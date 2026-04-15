<?php

namespace Workdo\LandingPage\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Workdo\LandingPage\Models\Blog;
use Workdo\LandingPage\Models\BlogRead;
use Workdo\LandingPage\Models\CustomPage;
use Workdo\LandingPage\Models\LandingPageSetting;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        if (!Auth::user()->can('manage-blogs')) {
            return back()->with('error', __('Permission denied'));
        }

        $query = Blog::query()->addSelect([
            'unique_readers_count' => BlogRead::query()
                ->selectRaw('COUNT(DISTINCT ip_address)')
                ->whereColumn('blog_reads.blog_id', 'blogs.id'),
        ]);

        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->string('title') . '%');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->string('status') === 'active');
        }

        $blogs = $query->latest()->paginate((int) $request->get('per_page', 10))->withQueryString();

        return Inertia::render('LandingPage/Blogs/Index', [
            'blogs' => $blogs,
        ]);
    }

    public function create()
    {
        if (!Auth::user()->can('create-blogs')) {
            return redirect()->route('blogs.index')->with('error', __('Permission denied'));
        }

        return Inertia::render('LandingPage/Blogs/Create');
    }

    public function store(Request $request)
    {
        if (!Auth::user()->can('create-blogs')) {
            return redirect()->route('blogs.index')->with('error', __('Permission denied'));
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug',
            'category' => 'nullable|string|max:255',
            'author_name' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?: Str::slug($validated['title']);
        $validated['published_at'] = now();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('blogs', 'public');
            $this->syncPublicStorageFile($validated['image']);
        }

        Blog::create($validated);

        return redirect()->route('blogs.index')->with('success', __('Blog created successfully.'));
    }

    public function edit(Blog $blog)
    {
        if (!Auth::user()->can('edit-blogs')) {
            return redirect()->route('blogs.index')->with('error', __('Permission denied'));
        }

        return Inertia::render('LandingPage/Blogs/Edit', [
            'blog' => $blog,
        ]);
    }

    public function update(Request $request, Blog $blog)
    {
        if (!Auth::user()->can('edit-blogs')) {
            return redirect()->route('blogs.index')->with('error', __('Permission denied'));
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blogs,slug,' . $blog->id,
            'category' => 'nullable|string|max:255',
            'author_name' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($blog->image) {
                Storage::disk('public')->delete($blog->image);
            }
            $validated['image'] = $request->file('image')->store('blogs', 'public');
            $this->syncPublicStorageFile($validated['image']);
        } else {
            unset($validated['image']);
        }

        $blog->update($validated);

        return redirect()->route('blogs.index')->with('success', __('Blog updated successfully.'));
    }

    public function destroy(Blog $blog)
    {
        if (!Auth::user()->can('delete-blogs')) {
            return redirect()->route('blogs.index')->with('error', __('Permission denied'));
        }

        if ($blog->image) {
            Storage::disk('public')->delete($blog->image);
        }

        $blog->delete();

        return back()->with('success', __('Blog deleted successfully.'));
    }

    public function publicIndex(Request $request)
    {
        $blogs = Blog::query()
            ->where('is_active', true)
            ->latest('published_at')
            ->latest('id')
            ->paginate(9)
            ->withQueryString();

        $settingsData = $this->landingSettingsForPublic($request);

        return Inertia::render('LandingPage/Blogs/PublicIndex', [
            'blogs' => $blogs,
            'landingPageSettings' => $settingsData,
        ]);
    }

    public function viewCountJson(string $slug)
    {
        $blog = Blog::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return response()->json([
            'read_count' => (int) $blog->read_count,
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }

    public function publicShow(Request $request, string $slug)
    {
        $blog = Blog::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $this->registerRead($request, $blog);

        $relatedBlogs = Blog::query()
            ->where('id', '!=', $blog->id)
            ->where('is_active', true)
            ->latest('published_at')
            ->take(3)
            ->get();

        $settingsData = $this->landingSettingsForPublic($request);

        return Inertia::render('LandingPage/Blogs/PublicShow', [
            'blog' => $blog->fresh(),
            'relatedBlogs' => $relatedBlogs,
            'landingPageSettings' => $settingsData,
        ]);
    }

    private function registerRead(Request $request, Blog $blog): void
    {
        BlogRead::create([
            'blog_id' => $blog->id,
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'read_at' => now(),
        ]);

        $blog->increment('read_count');
    }

    private function landingSettingsForPublic(Request $request): array
    {
        $landingPageSettings = LandingPageSetting::first();
        $enableRegistration = admin_setting('enableRegistration');

        $settingsData = $landingPageSettings ? $landingPageSettings->toArray() : [];
        $settingsData['enable_registration'] = $enableRegistration === 'on';
        $settingsData['is_authenticated'] = $request->user() !== null;
        $settingsData['custom_pages'] = CustomPage::where('is_active', true)->select('id', 'title', 'slug')->get();

        return $settingsData;
    }

    private function syncPublicStorageFile(?string $relativePath): void
    {
        if (empty($relativePath)) {
            return;
        }

        $source = storage_path('app/public/' . ltrim($relativePath, '/'));
        $target = public_path('storage/' . ltrim($relativePath, '/'));

        if (!File::exists($source)) {
            return;
        }

        File::ensureDirectoryExists(dirname($target));
        File::copy($source, $target);
    }
}
