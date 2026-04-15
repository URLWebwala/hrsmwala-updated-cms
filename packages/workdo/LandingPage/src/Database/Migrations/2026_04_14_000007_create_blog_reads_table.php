<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('blog_reads')) {
            Schema::create('blog_reads', function (Blueprint $table) {
                $table->id();
                $table->foreignId('blog_id')->constrained('blogs')->cascadeOnDelete();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('read_at');
                $table->timestamps();
                $table->index(['blog_id', 'ip_address', 'read_at']);
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('blog_reads');
    }
};
