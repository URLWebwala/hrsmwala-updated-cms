<?php

namespace Workdo\TimeTracker\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class PermissionTableSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            ['name' => 'manage-timetracker', 'label' => 'Manage Time Tracker', 'module' => 'TimeTracker'],
            ['name' => 'manage-tracker-settings', 'label' => 'Manage Tracker Settings', 'module' => 'TimeTracker'],
            ['name' => 'edit-tracker-settings', 'label' => 'Edit Tracker Settings', 'module' => 'TimeTracker'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                [
                    'module' => $perm['module'],
                    'label' => $perm['label'],
                    'add_on' => 'TimeTracker'
                ]
            );
        }

        $companyRole = Role::where('name', 'company')->first();
        if ($companyRole) {
            foreach ($permissions as $perm) {
                $companyRole->givePermissionTo($perm['name']);
            }
        }
    }
}
