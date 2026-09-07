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
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE SCHEMA IF NOT EXISTS rekrutmen');
        }

        Schema::create('rekrutmen.permintaan_rekrutmens', function (Blueprint $table) {
            $table->id();
            $table->string('kode_permintaan', 50)->unique();
            $table->foreignId('kd_departement')->constrained('public.departement')->onDelete('cascade');
            $table->foreignId('posisi_id')->constrained('public.jabatan')->onDelete('cascade');
            $table->integer('jumlah');
            $table->date('tgl_permintaan');
            $table->date('target_join');
            $table->enum('prioritas', ['high', 'medium', 'low'])->default('medium');
            $table->enum('status_persetujuan', ['pending', 'disetujui', 'ditolak', 'cancel'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.permintaan_rekrutmens');
    }
};
