<?php

namespace Workdo\Cashfree\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CashfreeSettingsController extends Controller
{
    public function update(Request $request)
    {
        if (Auth::user()->can('manage-system-settings')) {
            $settings = $request->input('settings', []);
            
            try {
                foreach ($settings as $key => $value) {
                    setSetting($key, $value, creatorId());
                }

                return redirect()->back()->with('success', __('Cashfree settings saved successfully.'));
            } catch (\Exception $e) {
                return redirect()->back()->with('error', __('Failed to update Cashfree settings: ') . $e->getMessage());
            }           
        }
        return back()->with('error', __('Permission denied'));
    }
}
