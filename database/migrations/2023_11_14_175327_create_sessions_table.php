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
        Schema::create('tbltrackrecords', function (Blueprint $table) {
            $table->id();
            $table->integer('userid');
            $table->time('timein');
            $table->time('timeout');
            $table->date('datein');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbltrackrecords');
    }
};
