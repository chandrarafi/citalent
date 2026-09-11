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
        Schema::create('rekrutmen.kriteria_ats', function (Blueprint $table) {
            $table->id();
            $table->string('divisi', 100); // Marketing, Customer Service, Service Motor, IT, HRD, Finance, Parts Motor, Administrasi, General
            $table->foreignId('lowongan_id')->nullable()->constrained('rekrutmen.lowongans')->onDelete('cascade');
            $table->string('kategori', 100)->default('Keahlian / Skill'); // Pendidikan, Pengalaman Kerja, Keahlian / Skill, Sertifikasi
            $table->string('nama_kriteria', 255); // e.g. "Digital marketing", "SQL / Database", "Diagnosis motor"
            $table->string('kebutuhan', 255); // e.g. "Wajib (Query, RDBMS)", "Minimal 2 tahun"
            $table->string('tipe_penilaian', 50)->default('keyword'); // pendidikan, pengalaman, keyword, sertifikasi
            $table->json('keywords')->nullable(); // JSON array of search keywords
            $table->unsignedInteger('bobot')->default(20); // Nilai bobot maksimal
            $table->boolean('is_wajib')->default(true);
            $table->unsignedInteger('urutan')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['divisi', 'lowongan_id']);
            $table->index(['lowongan_id', 'active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.kriteria_ats');
    }
};
