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
        Schema::table('tbltaskrunning', function (Blueprint $table) {
            $table->time('end_time', 2);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbltaskrunning', function (Blueprint $table) {
            $table->dropColumn('end_time');
        });
    }
};
