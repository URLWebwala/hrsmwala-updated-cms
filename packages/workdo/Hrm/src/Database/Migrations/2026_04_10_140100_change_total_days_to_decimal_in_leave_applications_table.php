<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('leave_applications') && Schema::hasColumn('leave_applications', 'total_days')) {
            DB::statement('ALTER TABLE leave_applications MODIFY total_days DECIMAL(5,1) NULL');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('leave_applications') && Schema::hasColumn('leave_applications', 'total_days')) {
            DB::statement('ALTER TABLE leave_applications MODIFY total_days INT NULL');
        }
    }
};
