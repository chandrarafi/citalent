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
        Schema::table('rekrutmen.permintaan_rekrutmens', function (Blueprint $table) {
            $table->foreignId('requester_id')
                ->nullable()
                ->after('posisi_id')
                ->constrained('public.users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekrutmen.permintaan_rekrutmens', function (Blueprint $table) {
            $table->dropForeign(['requester_id']);
            $table->dropColumn('requester_id');
        });
    }
};
