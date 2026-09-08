<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Alter column permintaan_rekrutmen_id to be nullable in rekrutmen.lowongans
        Schema::table('rekrutmen.lowongans', function (Blueprint $table) {
            $table->unsignedBigInteger('permintaan_rekrutmen_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekrutmen.lowongans', function (Blueprint $table) {
            $table->unsignedBigInteger('permintaan_rekrutmen_id')->nullable(false)->change();
        });
    }
};
