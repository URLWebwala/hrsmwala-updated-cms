<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free Plan',
                'description' => 'Perfect for getting started with basic features',
                'number_of_users' => 10,
                'status' => true,
                'free_plan' => true,
                'modules' => ["Taskly","Account","Hrm","Lead","Pos","Stripe","Paypal","AIAssistant","BudgetPlanner","Calendar","Contract","DoubleEntry","FormBuilder","Goal","Performance","Quotation","Recruitment","Slack","SupportTicket","Telegram","Timesheet","TimeTracker","Training","Twilio","Webhook","ZoomMeeting"],
                'package_price_yearly' => 0,
                'package_price_monthly' => 0,
                'trial' => false,
                'trial_days' => 0,
            ],
            [
                'name' => 'Starter Plan',
                'description' => 'Great for small teams and growing businesses',
                'number_of_users' => 50,
                'status' => true,
                'free_plan' => false,
                'modules' => ["Taskly","Account","Hrm","Lead","Pos","Stripe","BudgetPlanner","Calendar","Contract","DoubleEntry","FormBuilder","Goal","Performance","Quotation","Recruitment","Slack","SupportTicket","Timesheet","TimeTracker","Training","Twilio","Webhook","ZoomMeeting"],
                'package_price_yearly' => 240,
                'package_price_monthly' => 25,
                'trial' => true,
                'trial_days' => 14,
            ],
            [
                'name' => 'Professional Plan',
                'description' => 'Advanced features for established businesses',
                'number_of_users' => 100,
                'status' => true,
                'free_plan' => false,
                'modules' => ["Taskly","Account","Hrm","Lead","Pos","Stripe","Paypal","AIAssistant","BudgetPlanner","Calendar","Contract","DoubleEntry","FormBuilder","Goal","Performance","Quotation","Recruitment","Slack","SupportTicket","Telegram","Timesheet","TimeTracker","Training","Twilio","Webhook","ZoomMeeting"],
                'package_price_yearly' => 960,
                'package_price_monthly' => 99,
                'trial' => true,
                'trial_days' => 30,
            ],
        ];

        // Define legacy variables so older updater flows can't crash.
        $planRows = $plans;
        $superAdminId = null;

        foreach ($plans as $planData) {
            $plan = Plan::where('name', $planData['name'])->first();

            if (! $plan) {
                Plan::create($planData);
                continue;
            }

            // Don't overwrite existing pricing/settings; just ensure requested modules exist.
            $existingModules = is_array($plan->modules) ? $plan->modules : [];
            $desiredModules = $planData['modules'] ?? [];

            $plan->modules = array_values(array_unique(array_merge($existingModules, $desiredModules)));
            $plan->save();
        }
    }
}
