<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('interviews')) {
            Schema::table('interviews', function (Blueprint $table) {
                if (!Schema::hasColumn('interviews', 'interview_mode')) {
                    $table->string('interview_mode')->default('offline')->after('meeting_link');
                }
                if (!Schema::hasColumn('interviews', 'round_ids')) {
                    $table->json('round_ids')->nullable()->after('round_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('interviews')) {
            Schema::table('interviews', function (Blueprint $table) {
                if (Schema::hasColumn('interviews', 'interview_mode')) {
                    $table->dropColumn('interview_mode');
                }
                if (Schema::hasColumn('interviews', 'round_ids')) {
                    $table->dropColumn('round_ids');
                }
            });
        }
    }
};
