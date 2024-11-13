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
        Schema::create('tbltaskrunning', function (Blueprint $table) {
            $table->id();
            $table->string('task_name')->nullable();
            $table->integer('category_id')->nullable();
            $table->string('taskid');
            $table->integer('userid');
            $table->time('time');
            $table->date('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbltaskrunning');
    }
};
