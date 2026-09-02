<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('terminations')) {
            Schema::table('terminations', function (Blueprint $table) {
                if (!Schema::hasColumn('terminations', 'rejoin_date')) {
                    $table->date('rejoin_date')->nullable()->after('termination_date');
                }
            });
        }

        if (Schema::hasTable('employees')) {
            Schema::table('employees', function (Blueprint $table) {
                if (!Schema::hasColumn('employees', 'rejoin_date')) {
                    $table->date('rejoin_date')->nullable()->after('date_of_joining');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('terminations')) {
            Schema::table('terminations', function (Blueprint $table) {
                if (Schema::hasColumn('terminations', 'rejoin_date')) {
                    $table->dropColumn('rejoin_date');
                }
            });
        }

        if (Schema::hasTable('employees')) {
            Schema::table('employees', function (Blueprint $table) {
                if (Schema::hasColumn('employees', 'rejoin_date')) {
                    $table->dropColumn('rejoin_date');
                }
            });
        }
    }
};
