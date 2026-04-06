<?php

namespace Workdo\TimeTracker\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TimeTrackerUtility extends Model
{
    public static function GivePermissionToRoles($role_id = null, $rolename = null): void
    {
        // Keep defaults conservative: don't auto-grant tracker admin permissions to clients.
        $staffPermissions = [
            'manage-timetracker',
        ];

        if ($rolename !== 'staff') {
            return;
        }

        $role = Role::where('name', 'staff')->where('id', $role_id)->first();
        if (! $role) {
            return;
        }

        foreach ($staffPermissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();
            if ($permission && ! $role->hasPermissionTo($permissionName)) {
                $role->givePermissionTo($permission);
            }
        }
    }
}

