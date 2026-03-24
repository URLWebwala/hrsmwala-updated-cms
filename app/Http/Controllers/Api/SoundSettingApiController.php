<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SoundSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SoundSettingApiController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => SoundSetting::orderBy('type')->get(),
        ]);
    }

    public function upload(Request $request)
    {
        if (!in_array(Auth::user()->type, ['superadmin', 'super admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Permission denied'], 403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|max:50',
            'file' => 'required|file|mimes:mp3,wav|max:10240',
            'is_active' => 'nullable|boolean',
            'volume' => 'nullable|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $path = $request->file('file')->store('sound-settings', 'public');

        $sound = SoundSetting::updateOrCreate(
            ['type' => $request->type],
            [
                'file_path' => $path,
                'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
                'volume' => $request->has('volume') ? (float) $request->volume : 1,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Sound uploaded successfully',
            'data' => $sound,
        ]);
    }

    public function update(Request $request)
    {
        if (!in_array(Auth::user()->type, ['superadmin', 'super admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Permission denied'], 403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|max:50',
            'is_active' => 'nullable|boolean',
            'volume' => 'nullable|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $sound = SoundSetting::firstOrCreate(['type' => $request->type], [
            'is_active' => true,
            'volume' => 1,
        ]);

        if ($request->has('is_active')) {
            $sound->is_active = (bool) $request->is_active;
        }
        if ($request->has('volume')) {
            $sound->volume = (float) $request->volume;
        }

        $sound->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Sound setting updated successfully',
            'data' => $sound,
        ]);
    }
}

