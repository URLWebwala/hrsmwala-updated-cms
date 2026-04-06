<?php

namespace Workdo\TimeTracker\Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AddOn;

class TimeTrackerSeeder extends Seeder
{
    public function run()
    {
        $this->call(PermissionTableSeeder::class);

        AddOn::updateOrCreate(
            ['module' => 'TimeTracker'],
            [
                'name' => 'Time Tracker',
                'package_name' => 'timetracker',
                'monthly_price' => 10,
                'yearly_price' => 100,
                'is_enable' => true,
                'image' => 'favicon.png'
            ]
        );
    }
}
