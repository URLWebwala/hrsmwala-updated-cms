<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tracker Sessions table
        if (!Schema::hasTable('tracker_sessions')) {
            Schema::create('tracker_sessions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                $table->timestamp('start_time');
                $table->timestamp('end_time')->nullable();
                $table->integer('total_duration')->default(0); // in seconds
                $table->string('os_type')->nullable(); // windows, macos, etc.
                $table->string('version')->nullable(); // desktop app version
                $table->timestamps();
            });
        }

        // 2. Activity Logs table
        if (!Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('session_id')->constrained('tracker_sessions')->onDelete('cascade');
                $table->integer('keyboard_hits')->default(0);
                $table->integer('mouse_clicks')->default(0);
                $table->integer('activity_level')->default(0); // 0-100 percentage
                $table->timestamp('log_time');
                $table->timestamps();
            });
        }

        // 3. Screenshots table
        if (!Schema::hasTable('screenshots')) {
            Schema::create('screenshots', function (Blueprint $table) {
                $table->id();
                $table->foreignId('session_id')->constrained('tracker_sessions')->onDelete('cascade');
                $table->string('file_path');
                $table->timestamp('captured_at');
                $table->timestamps();
            });
        }

        // 4. App Versions table
        if (!Schema::hasTable('app_versions')) {
            Schema::create('app_versions', function (Blueprint $table) {
                $table->id();
                $table->string('version_name');
                $table->text('changelog')->nullable();
                $table->string('file_path'); // .exe or .dmg path
                $table->date('upload_date');
                $table->timestamps();
            });
        }

        // 5. Add tracker_enabled to projects table
        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (!Schema::hasColumn('projects', 'tracker_enabled')) {
                    $table->boolean('tracker_enabled')->default(false)->after('status');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('screenshots');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('tracker_sessions');
        Schema::dropIfExists('app_versions');
        
        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                if (Schema::hasColumn('projects', 'tracker_enabled')) {
                    $table->dropColumn('tracker_enabled');
                }
            });
        }
    }
};
