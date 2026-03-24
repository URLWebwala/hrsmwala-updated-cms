<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sound_settings')) {
            Schema::create('sound_settings', function (Blueprint $table) {
                $table->id();
                $table->string('type', 50)->unique(); // start|pause|resume|stop|clock_in|clock_out|notification|global
                $table->string('file_path')->nullable();
                $table->boolean('is_active')->default(true);
                $table->float('volume')->default(1);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sound_settings');
    }
};

