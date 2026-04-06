<?php

namespace App\Events;

use App\Models\SoundSetting;
use App\Models\UserNotification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public UserNotification $notification;

    public function __construct(UserNotification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        if ($this->notification->user_id) {
            return [new PrivateChannel('private-user.' . $this->notification->user_id)];
        }

        if ($this->notification->role_target && $this->notification->role_target !== 'all') {
            return [new PrivateChannel('role-' . $this->notification->role_target)];
        }

        return [
            new PrivateChannel('role-admin'),
            new PrivateChannel('role-employee'),
            new PrivateChannel('role-super-admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        $notificationSound = SoundSetting::query()
            ->where('type', 'notification')
            ->where('is_active', true)
            ->first(['file_path', 'volume']);

        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'item_type' => $this->notification->item_type,
            'item_id' => $this->notification->item_id,
            'meta' => $this->notification->meta,
            'is_read' => $this->notification->is_read,
            'created_at' => optional($this->notification->created_at)->toISOString(),
            'sound_url' => $notificationSound?->file_path ? url('/storage/' . ltrim($notificationSound->file_path, '/')) : null,
            'sound_volume' => $notificationSound?->volume ?? 1,
        ];
    }
}

