<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SoundSetting;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class NotificationApiController extends Controller
{
    public function index(Request $request)
    {
        $query = UserNotification::query()
            ->where(function ($q) {
                $q->where('user_id', Auth::id())
                    ->orWhere('role_target', 'all');
            })
            ->when($request->boolean('unread_only'), fn ($q) => $q->where('is_read', false))
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->type))
            ->when($request->filled('start_date'), fn ($q) => $q->whereDate('created_at', '>=', $request->start_date))
            ->when($request->filled('end_date'), fn ($q) => $q->whereDate('created_at', '<=', $request->end_date))
            ->latest();

        $items = $query->paginate((int) $request->get('limit', 20));
        $notificationSound = SoundSetting::query()
            ->where('type', 'notification')
            ->where('is_active', true)
            ->first(['file_path', 'volume']);

        $items->getCollection()->transform(function ($item) use ($notificationSound) {
            $item->sound_url = $notificationSound?->file_path ? url('/storage/' . ltrim($notificationSound->file_path, '/')) : null;
            $item->sound_volume = $notificationSound?->volume ?? 1;
            return $item;
        });

        return response()->json([
            'status' => 'success',
            'data' => $items,
        ]);
    }

    public function markRead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:user_notifications,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $updated = UserNotification::where('id', $request->id)
            ->where('user_id', Auth::id())
            ->update(['is_read' => true]);

        if (!$updated) {
            return response()->json(['status' => 'error', 'message' => 'Notification not found'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Notification marked as read']);
    }

    public function markAllRead()
    {
        UserNotification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['status' => 'success', 'message' => 'All notifications marked as read']);
    }

    public function clearRead()
    {
        UserNotification::where('user_id', Auth::id())
            ->where('is_read', true)
            ->delete();

        return response()->json(['status' => 'success', 'message' => 'Read notifications cleared']);
    }
}

