<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('leave_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('leave_applications', 'leave_duration')) {
                $table->enum('leave_duration', ['full_day', 'half_day'])->default('full_day')->after('end_date');
            }

            if (!Schema::hasColumn('leave_applications', 'half_day_session')) {
                $table->enum('half_day_session', ['first_half', 'second_half'])->nullable()->after('leave_duration');
            }
        });
    }

    public function down(): void
    {
        Schema::table('leave_applications', function (Blueprint $table) {
            if (Schema::hasColumn('leave_applications', 'half_day_session')) {
                $table->dropColumn('half_day_session');
            }

            if (Schema::hasColumn('leave_applications', 'leave_duration')) {
                $table->dropColumn('leave_duration');
            }
        });
    }
};
