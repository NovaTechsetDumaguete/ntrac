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
        Schema::table('export_history', function (Blueprint $table) {
            $table->string('employees')->nullable(true);
            $table->integer('item_count')->default(0);
            // $table->addColumn('integer', 'item_count');
            $table->string('team_name')->nullable(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('export_history', function (Blueprint $table) {
            $table->dropColumn('item_count');
        });
    }
};
