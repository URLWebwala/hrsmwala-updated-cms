<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tracker_sessions')) {
            Schema::table('tracker_sessions', function (Blueprint $table) {
                if (!Schema::hasColumn('tracker_sessions', 'task_id')) {
                    $table->unsignedBigInteger('task_id')->nullable()->after('project_id');
                }
                if (!Schema::hasColumn('tracker_sessions', 'total_break_seconds')) {
                    $table->integer('total_break_seconds')->default(0)->after('total_duration');
                }
                if (!Schema::hasColumn('tracker_sessions', 'break_count')) {
                    $table->integer('break_count')->default(0)->after('total_break_seconds');
                }
                if (!Schema::hasColumn('tracker_sessions', 'paused_at')) {
                    $table->timestamp('paused_at')->nullable()->after('end_time');
                }
                if (!Schema::hasColumn('tracker_sessions', 'stop_reason')) {
                    $table->string('stop_reason')->nullable()->after('version');
                }
                if (!Schema::hasColumn('tracker_sessions', 'stop_type')) {
                    $table->string('stop_type')->nullable()->after('stop_reason');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tracker_sessions')) {
            Schema::table('tracker_sessions', function (Blueprint $table) {
                foreach (['stop_type', 'stop_reason', 'paused_at', 'break_count', 'total_break_seconds', 'task_id'] as $column) {
                    if (Schema::hasColumn('tracker_sessions', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};

