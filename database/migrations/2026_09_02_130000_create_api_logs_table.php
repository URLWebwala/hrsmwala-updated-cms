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
        if (!Schema::hasTable('api_logs')) {
            Schema::create('api_logs', function (Blueprint $table) {
                $table->id();
                $table->string('method', 10)->index();
                $table->text('url');
                $table->string('route_name')->nullable()->index();
                $table->integer('status_code')->index();
                $table->string('status_text')->nullable();
                $table->float('duration_ms', 10, 2)->index();
                $table->string('ip_address', 45)->nullable();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('user_name')->nullable();
                $table->string('user_email')->nullable();
                $table->json('request_headers')->nullable();
                $table->json('request_body')->nullable();
                $table->mediumText('response_body')->nullable();
                $table->text('error_message')->nullable();
                $table->mediumText('error_trace')->nullable();
                $table->boolean('is_slow')->default(false)->index();
                $table->boolean('is_failed')->default(false)->index();
                $table->timestamps();

                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
    }
};
