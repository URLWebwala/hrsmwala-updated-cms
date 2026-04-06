<?php

namespace Workdo\TimeTracker\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Workdo\TimeTracker\Models\AppVersion;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AppVersionController extends Controller
{
    /**
     * List all app versions (for superadmin)
     */
    public function index()
    {
        if (Auth::user()->type !== 'superadmin') {
            return redirect()->back()->with('error', __('Permission denied'));
        }

        $versions = AppVersion::latest()->get();

        return Inertia::render('TimeTracker/AppVersions/Index', [
            'versions' => $versions
        ]);
    }

    /**
     * Store a new app version (for superadmin)
     */
    public function store(Request $request)
    {
        if (Auth::user()->type !== 'superadmin') {
            return response()->json(['status' => 'error', 'message' => __('Permission denied')], 403);
        }

        $validator = Validator::make($request->all(), [
            'version_name' => 'required|string|max:50',
            'changelog' => 'nullable|string',
            'desktop_app' => 'required|file|mimes:exe,dmg,zip|max:51200' // 50MB limit
        ]);

        if ($validator->fails()) {
            return back()->with('error', $validator->errors()->first());
        }

        if ($request->hasFile('desktop_app')) {
            $path = $request->file('desktop_app')->store('desktop-apps', 'public');
            
            AppVersion::create([
                'version_name' => $request->version_name,
                'changelog' => $request->changelog,
                'file_path' => $path,
                'upload_date' => now()
            ]);

            return back()->with('success', __('Desktop app uploaded successfully'));
        }

        return back()->with('error', __('Failed to upload desktop app'));
    }

    /**
     * Get the latest download URL (for users)
     */
    public function getLatestDownloadUrl()
    {
        $latest = AppVersion::latest()->first();
        if ($latest) {
            return response()->json([
                'status' => 'success',
                'download_url' => Storage::url($latest->file_path),
                'version' => $latest->version_name,
                'changelog' => $latest->changelog
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'No app versions available'], 404);
    }
}
