<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            Schema::create('user_notifications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('role_target', 30)->nullable(); // super_admin|admin|employee|all
                $table->string('type', 60);
                $table->string('title');
                $table->text('message');
                $table->string('item_type', 40)->nullable(); // task|project|tracker|attendance
                $table->unsignedBigInteger('item_id')->nullable();
                $table->json('meta')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamps();

                $table->index(['user_id', 'is_read']);
                $table->index('created_at');
                $table->index('type');
                $table->index('role_target');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notifications');
    }
};

