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
        Schema::table('rekrutmen.pelamars', function (Blueprint $table) {
            $table->string('sumber_informasi', 150)->nullable()->after('posisi_dilamar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekrutmen.pelamars', function (Blueprint $table) {
            $table->dropColumn('sumber_informasi');
        });
    }
};
