<?php

namespace Workdo\TimeTracker\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Models\Setting;

class TrackerSettingController extends Controller
{
    /**
     * Display tracker settings form
     */
    public function index()
    {
        if (Auth::user()->can('manage-tracker-settings')) {
            $settings = [
                'keyboard_activity_timer' => company_setting('keyboard_activity_timer') ?? 60,
                'mouse_activity_timer' => company_setting('mouse_activity_timer') ?? 60,
                'heartbeat_interval' => company_setting('heartbeat_interval') ?? 120,
                'screenshot_interval' => company_setting('screenshot_interval') ?? 600,
                'enable_keyboard_tracking' => company_setting('enable_keyboard_tracking') ?? 'on',
                'enable_mouse_tracking' => company_setting('enable_mouse_tracking') ?? 'on',
                'enable_heartbeat_tracking' => company_setting('enable_heartbeat_tracking') ?? 'on',
                'enable_screenshot_tracking' => company_setting('enable_screenshot_tracking') ?? 'on',
                'enable_blurry_screenshots' => company_setting('enable_blurry_screenshots') ?? 'off',
                'auto_stop_tracking' => company_setting('auto_stop_tracking') ?? 30,
                'enable_idle_detection' => company_setting('enable_idle_detection') ?? 'off',
            ];

            return Inertia::render('TimeTracker/Settings/Index', [
                'settings' => $settings
            ]);
        } else {
            return redirect()->back()->with('error', __('Permission denied'));
        }
    }

    /**
     * Update tracker settings
     */
    public function update(Request $request)
    {
        if (Auth::user()->can('edit-tracker-settings')) {
            $validator = Validator::make($request->all(), [
                'keyboard_activity_timer' => 'required|integer|min:10',
                'mouse_activity_timer' => 'required|integer|min:10',
                'heartbeat_interval' => 'required|integer|min:30',
                'screenshot_interval' => 'required|integer|min:60',
                'enable_keyboard_tracking' => 'nullable',
                'enable_mouse_tracking' => 'nullable',
                'enable_heartbeat_tracking' => 'nullable',
                'enable_screenshot_tracking' => 'nullable',
                'enable_blurry_screenshots' => 'nullable',
                'auto_stop_tracking' => 'required|integer|min:5',
                'enable_idle_detection' => 'nullable',
            ]);

            if ($validator->fails()) {
                return back()->with('error', $validator->errors()->first());
            }

            $post = $request->all();
            
            // Handle switches
            $post['enable_keyboard_tracking'] = $request->has('enable_keyboard_tracking') && $request->enable_keyboard_tracking ? 'on' : 'off';
            $post['enable_mouse_tracking'] = $request->has('enable_mouse_tracking') && $request->enable_mouse_tracking ? 'on' : 'off';
            $post['enable_heartbeat_tracking'] = $request->has('enable_heartbeat_tracking') && $request->enable_heartbeat_tracking ? 'on' : 'off';
            $post['enable_screenshot_tracking'] = $request->has('enable_screenshot_tracking') && $request->enable_screenshot_tracking ? 'on' : 'off';
            $post['enable_blurry_screenshots'] = $request->has('enable_blurry_screenshots') && $request->enable_blurry_screenshots ? 'on' : 'off';
            $post['enable_idle_detection'] = $request->has('enable_idle_detection') && $request->enable_idle_detection ? 'on' : 'off';

            foreach ($post as $key => $value) {
                if ($key !== 'tracker_app') { // Don't save the file in settings table here
                    setSetting($key, $value);
                }
            }

            return back()->with('success', __('Tracker settings updated successfully'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }
}
