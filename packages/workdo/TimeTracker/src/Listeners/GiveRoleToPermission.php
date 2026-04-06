<?php

namespace Workdo\TimeTracker\Listeners;

use App\Events\GivePermissionToRole;
use Workdo\TimeTracker\Models\TimeTrackerUtility;

class GiveRoleToPermission
{
    public function handle(GivePermissionToRole $event): void
    {
        $roleId = $event->role_id;
        $roleName = $event->rolename;
        $userModules = $event->user_module ? explode(',', $event->user_module) : [];

        if (! empty($userModules) && in_array('TimeTracker', $userModules, true)) {
            TimeTrackerUtility::GivePermissionToRoles($roleId, $roleName);
        }
    }
}

