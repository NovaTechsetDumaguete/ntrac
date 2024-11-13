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
        Schema::create('tmp_taskrunning', function (Blueprint $table) {
            $table->id();
            $table->integer('userid');
            $table->integer('taskid');
            $table->string('description');
            $table->date('date');
            $table->time('time');
            $table->string('status');
            $table->integer('category_id');
            $table->time('end_time');
            $table->string('platform');
            $table->string('type');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmp_taskrunning');
    }
};
