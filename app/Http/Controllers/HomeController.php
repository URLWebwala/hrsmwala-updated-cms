<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Workdo\LandingPage\Models\Blog;

class HomeController extends Controller
{
    public function Dashboard(Request $request)
    {
        if(Auth::user()->type === 'superadmin') {
            return $this->superAdminDashboard();
        }

        return $this->regularDashboard();
    }

    private function superAdminDashboard()
    {
        $driver = DB::getDriverName();
        $selectRaw = $driver === 'sqlite' 
            ? "strftime('%m', created_at) as month, COUNT(*) as count, SUM(price) as payments"
            : "MONTH(created_at) as month, COUNT(*) as count, SUM(price) as payments";

        $orderData = Order::selectRaw($selectRaw)
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy(function ($item) {
                return (int)$item->month;
            });

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $chartData = [];
        $isDemo = config('app.is_demo');

        for ($i = 1; $i <= 12; $i++) {
            if ($isDemo) {
                $chartData[] = [
                    'month' => $months[$i-1],
                    'orders' => rand(5, 20),
                    'payments' => rand(500, 5000)
                ];
            } else {
                $chartData[] = [
                    'month' => $months[$i-1],
                    'orders' => $orderData[$i]->count ?? 0,
                    'payments' => $orderData[$i]->payments ?? 0
                ];
            }
        }

        $blogInsights = [
            'total_blogs' => 0,
            'active_blogs' => 0,
            'total_reads' => 0,
            'average_reads' => 0,
            'top_blogs' => [],
        ];

        try {
            $totalBlogs = Blog::count();
            $activeBlogs = Blog::where('is_active', true)->count();
            $totalReads = (int) (Blog::sum('read_count') ?? 0);

            $topBlogs = Blog::query()
                ->where('is_active', true)
                ->select('id', 'title', 'slug', 'category', 'author_name', 'read_count', 'published_at')
                ->orderByDesc('read_count')
                ->orderByDesc('published_at')
                ->limit(7)
                ->get()
                ->map(function (Blog $blog) {
                    return [
                        'id' => $blog->id,
                        'title' => $blog->title,
                        'slug' => $blog->slug,
                        'category' => $blog->category,
                        'author_name' => $blog->author_name,
                        'read_count' => (int) $blog->read_count,
                        'published_at' => optional($blog->published_at)?->format('Y-m-d'),
                    ];
                })
                ->values();

            $blogInsights = [
                'total_blogs' => $totalBlogs,
                'active_blogs' => $activeBlogs,
                'total_reads' => $totalReads,
                'average_reads' => $totalBlogs > 0 ? (int) round($totalReads / $totalBlogs) : 0,
                'top_blogs' => $topBlogs,
            ];
        } catch (\Throwable $e) {
            // Keep dashboard resilient if blog tables/module are unavailable.
        }

        return Inertia::render('SuperAdminDashboard', [
            'stats' => [
                'order_payments' => Order::sum('price') ?? 0,
                'total_orders' => Order::count(),
                'total_plans' => Plan::count(),
                'total_companies' => User::where('type', 'company')->count(),
            ],
            'chartData' => $chartData,
            'blogInsights' => $blogInsights,
        ]);
    }

    private function regularDashboard()
    {
        $redirectRoute = Cache::remember('dashboard_redirect_' . Auth::id(), 3600, function () {
            $packagesPath = base_path('packages/workdo');

            if (is_dir($packagesPath)) {
                foreach (glob($packagesPath . '/*/src/Resources/js/menus/company-menu.ts') as $menuFile) {
                    preg_match('/packages\/workdo\/([^\/]+)\//', $menuFile, $moduleMatch);
                    $moduleName = $moduleMatch[1] ?? null;
                    $content = file_get_contents($menuFile);
                    if (preg_match("/parent:\s*['\"]dashboard['\"]/", $content)) {
                        preg_match("/href:\s*route\(['\"]([^'\"]+)['\"]/", $content, $routeMatch);
                        preg_match("/permission:\s*['\"]([^'\"]+)['\"]/", $content, $permMatch);
                        if (!empty($routeMatch[1]) && !empty($permMatch[1]) && Module_is_active($moduleName) && Auth::user()->can($permMatch[1])) {
                            return $routeMatch[1];
                        }
                    }
                }
            }
            return null;
        });

        if ($redirectRoute) {
            return redirect()->route($redirectRoute);
        }

        return Inertia::render('dashboard');
    }
}
