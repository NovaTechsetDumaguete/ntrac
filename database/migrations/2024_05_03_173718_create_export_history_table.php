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
        Schema::create('export_history', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->integer('userid');
            $table->integer('employee_id');
            $table->string('employees')->nullable(true);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['pending', 'started', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('export_history');
    }
};
