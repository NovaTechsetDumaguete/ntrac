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
        Schema::create('extract_tracking_data', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->integer('report_id');
            $table->integer('employee_id');
            $table->integer('productive_duration');
            $table->integer('unproductive_duration');
            $table->integer('neutral_duration');
            $table->date('date');
            $table->time('time_in');
            $table->time('time_out');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('extract_data');
    }
};
