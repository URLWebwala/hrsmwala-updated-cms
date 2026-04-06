<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('messenger.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('private-user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('role-admin', function ($user) {
    return in_array($user->type, ['company', 'admin']);
});

Broadcast::channel('role-employee', function ($user) {
    return !in_array($user->type, ['superadmin', 'super admin', 'company', 'admin', 'client', 'vendor']);
});

Broadcast::channel('role-super-admin', function ($user) {
    return in_array($user->type, ['superadmin', 'super admin']);
});