<?php

namespace App\Services;

use App\Jobs\CreateAndBroadcastNotification;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    public function sendToUser(int $userId, array $data): void
    {
        $payload = $this->buildPayload($data, ['user_id' => $userId, 'role_target' => null]);
        CreateAndBroadcastNotification::dispatchSync($payload);
        Cache::forget('notifications_unread_count_user_' . $userId);
    }

    public function sendToRole(string $role, array $data): void
    {
        $role = strtolower($role);
        $payload = $this->buildPayload($data, ['user_id' => null, 'role_target' => $role]);
        CreateAndBroadcastNotification::dispatchSync($payload);

        // Also persist user-targeted rows for accurate unread counts.
        $users = $this->usersByRole($role);
        foreach ($users as $user) {
            $this->sendToUser((int) $user->id, $data);
        }
    }

    public function broadcastAll(array $data): void
    {
        $payload = $this->buildPayload($data, ['user_id' => null, 'role_target' => 'all']);
        CreateAndBroadcastNotification::dispatchSync($payload);

        User::query()->select('id')->chunkById(200, function ($users) use ($data) {
            foreach ($users as $user) {
                $this->sendToUser((int) $user->id, $data);
            }
        });
    }

    private function buildPayload(array $data, array $override): array
    {
        return array_merge([
            'user_id' => null,
            'role_target' => null,
            'type' => $data['type'] ?? 'system',
            'title' => $data['title'] ?? 'Notification',
            'message' => $data['message'] ?? '',
            'item_type' => $data['item_type'] ?? null,
            'item_id' => $data['item_id'] ?? null,
            'meta' => $data['meta'] ?? null,
            'is_read' => false,
        ], $override);
    }

    private function usersByRole(string $role)
    {
        $query = User::query()->select('id');

        return match ($role) {
            'admin' => $query->whereIn('type', ['company', 'admin'])->get(),
            'employee' => $query->emp()->get(),
            'super_admin', 'superadmin' => $query->whereIn('type', ['superadmin', 'super admin'])->get(),
            default => collect(),
        };
    }
}

