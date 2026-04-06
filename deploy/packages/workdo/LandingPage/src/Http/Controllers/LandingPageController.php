<?php

namespace Workdo\LandingPage\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use App\Models\AddOn;
use App\Models\Plan;
use App\Models\User;
use Workdo\LandingPage\Models\LandingPageSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Workdo\LandingPage\Models\CustomPage;
use Illuminate\Support\Facades\Auth;

class LandingPageController extends Controller
{
    private function getCareerDefaultSlug(): ?string
    {
        try {
            // Recruitment frontend expects an existing user slug.
            return User::whereNotNull('slug')->where('slug', '!=', '')->value('slug');
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function index(Request $request)
    {
        $settings = Cache::remember('landing_page_settings', 3600, function () {
            return LandingPageSetting::first();
        });

        if (!isLandingPageEnabled()) {
            $enableRegistration = admin_setting('enableRegistration');

            return Inertia::render('auth/login', [
                'canResetPassword' => Route::has('password.request'),
                'status' => session('status'),
                'enableRegistration' => $enableRegistration === 'on',
            ]);
        }

        $enableRegistration = admin_setting('enableRegistration');

        $settingsData = $settings ? $settings->toArray() : [];
        $settingsData['enable_registration'] = $enableRegistration === 'on';
        $settingsData['is_authenticated'] = $request->user() !== null;
        $settingsData = $this->normalizeLandingSettings($settingsData);
        $settingsData['career_default_slug'] = $this->getCareerDefaultSlug();

        return Inertia::render('LandingPage/Landing', [
            'auth' => [
                'user' => $request->user(),
                'lang' => app()->getLocale()
            ],
            'settings' => $settingsData
        ]);
    }

    public function pricing(Request $request)
    {
        // Get active plans from the main app
        $plans = Plan::where('status', true)
            ->withCount('orders')
            ->get();

        // Get active modules/addons
        $activeModules = AddOn::where('is_enable', true)
            ->whereNotIn('module', User::$superadmin_activated_module)
            ->select('module', 'name as alias', 'image', 'monthly_price', 'yearly_price')
            ->get();

        $landingPageSettings = LandingPageSetting::first();
        $enableRegistration = admin_setting('enableRegistration');

        $settingsData = $landingPageSettings ? $landingPageSettings->toArray() : [];
        $settingsData['enable_registration'] = $enableRegistration === 'on';
        $settingsData['is_authenticated'] = $request->user() !== null;
        $settingsData = $this->normalizeLandingSettings($settingsData);
        $settingsData['career_default_slug'] = $this->getCareerDefaultSlug();

        return Inertia::render('LandingPage/Pricing', [
            'plans' => $plans->map(function($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'package_price_monthly' => $plan->package_price_monthly,
                    'package_price_yearly' => $plan->package_price_yearly,
                    'number_of_users' => $plan->number_of_users,
                    'storage_limit' => $plan->storage_limit,
                    'modules' => $plan->modules ?? [],
                    'free_plan' => $plan->free_plan,
                    'trial' => $plan->trial,
                    'trial_days' => $plan->trial_days,
                    'orders_count' => $plan->orders_count
                ];
            }),
            'activeModules' => $activeModules,
            'settings' => $settingsData,

        ]);
    }

    public function settings()
    {
        if(Auth::user()->can('manage-landing-page')){
            $settings = LandingPageSetting::first();
            $customPages = CustomPage::where('is_active', true)->select('id', 'title', 'slug')->get();

            if ($settings) {
                $settingsArray = $this->normalizeLandingSettings($settings->toArray());
                $settings = new LandingPageSetting($settingsArray);
                $settings->id = $settingsArray['id'] ?? 1;
            }

            return Inertia::render('LandingPage/Settings', [
                'settings' => $settings ?: [
                    'company_name' => '',
                    'contact_email' => '',
                    'contact_phone' => '',
                    'contact_address' => '',
                    'config_sections' => [
                        'sections' => [],
                        'section_visibility' => [
                            'header' => true,
                            'hero' => true,
                            'stats' => true,
                            'features' => true,
                            'tracker_features' => true,
                            'modules' => true,
                            'benefits' => true,
                            'gallery' => true,
                            'how_works_videos' => true,
                            'cta' => true,
                            'footer' => true
                        ],
                        'section_order' => ['header', 'hero', 'stats', 'features', 'tracker_features', 'modules', 'benefits', 'gallery', 'how_works_videos', 'cta', 'footer']
                    ]
                ],
                'customPages' => $customPages
            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(Request $request)
    {
        if(Auth::user()->can('edit-landing-page')){
            $validated = $request->validate([
                'company_name' => 'nullable|string|max:255',
                'contact_email' => 'nullable|email|max:255',
                'contact_phone' => 'nullable|string|max:255',
                'contact_address' => 'nullable|string',
                'config_sections' => 'nullable|array'
            ]);

            // Handle image paths - store only filename
            if (isset($validated['config_sections']['sections'])) {
                $this->processImagePaths($validated['config_sections']['sections']);
            }

            LandingPageSetting::updateOrCreate(['id' => 1], $validated);

            return back()->with('success', __('Settings saved successfully'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    private function processImagePaths(&$sections)
    {
        foreach ($sections as $sectionKey => &$sectionData) {
            if (is_array($sectionData)) {
                // Handle single images (hero, cta)
                if (isset($sectionData['image'])) {
                    $sectionData['image'] = $this->processImagePath($sectionData['image']);
                }
                // Handle single video
                if (isset($sectionData['video'])) {
                    $sectionData['video'] = $this->processImagePath($sectionData['video']);
                }
                
                // Handle gallery images array
                if (isset($sectionData['images']) && is_array($sectionData['images'])) {
                    $sectionData['images'] = array_map([$this, 'processImagePath'], $sectionData['images']);
                }

                // Handle videos array
                if (isset($sectionData['videos']) && is_array($sectionData['videos'])) {
                    $sectionData['videos'] = array_map(function ($videoItem) {
                        // supports string[] OR {url,title}[] OR {video,title}[]
                        if (is_string($videoItem)) {
                            return $this->processImagePath($videoItem);
                        }
                        if (is_array($videoItem)) {
                            $url = $videoItem['url'] ?? $videoItem['video'] ?? null;
                            if (is_string($url)) {
                                $videoItem['url'] = $this->processImagePath($url);
                            }
                            return $videoItem;
                        }
                        return $videoItem;
                    }, $sectionData['videos']);
                }
            }
        }
    }

    private function processImagePath($imagePath)
    {
        if (! is_string($imagePath) || $imagePath === '') {
            return $imagePath;
        }
        if (strpos($imagePath, 'packages/workdo') !== false) {
            return $imagePath;
        }
        return basename($imagePath);
    }

    private function normalizeLandingSettings(array $settingsData): array
    {
        $defaults = [
            'sections' => [],
            'section_visibility' => [
                'header' => true,
                'hero' => true,
                'stats' => true,
                'features' => true,
                'tracker_features' => true,
                'modules' => true,
                'benefits' => true,
                'gallery' => true,
                'how_works_videos' => true,
                'cta' => true,
                'footer' => true,
            ],
            'section_order' => ['header', 'hero', 'stats', 'features', 'tracker_features', 'modules', 'benefits', 'gallery', 'how_works_videos', 'cta', 'footer'],
        ];

        $config = $settingsData['config_sections'] ?? [];
        $config['sections'] = is_array($config['sections'] ?? null) ? $config['sections'] : [];
        $config['section_visibility'] = is_array($config['section_visibility'] ?? null) ? $config['section_visibility'] : [];
        $config['section_order'] = is_array($config['section_order'] ?? null) ? $config['section_order'] : [];

        // Merge visibility defaults (don't override existing explicit false/true)
        $config['section_visibility'] = array_merge($defaults['section_visibility'], $config['section_visibility']);

        // Merge order defaults while preserving existing order
        $order = $config['section_order'];
        foreach ($defaults['section_order'] as $key) {
            if (! in_array($key, $order, true)) {
                // Place tracker_features after features, how_works_videos after gallery if possible.
                if ($key === 'tracker_features' && in_array('features', $order, true)) {
                    $pos = array_search('features', $order, true);
                    array_splice($order, $pos + 1, 0, [$key]);
                    continue;
                }
                if ($key === 'how_works_videos' && in_array('gallery', $order, true)) {
                    $pos = array_search('gallery', $order, true);
                    array_splice($order, $pos + 1, 0, [$key]);
                    continue;
                }
                $order[] = $key;
            }
        }
        $config['section_order'] = $order;

        $settingsData['config_sections'] = array_merge($defaults, $config);

        return $settingsData;
    }
}