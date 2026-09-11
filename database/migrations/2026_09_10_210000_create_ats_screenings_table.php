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
        Schema::create('rekrutmen.ats_screenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelamar_id')->constrained('rekrutmen.pelamars')->onDelete('cascade');
            $table->foreignId('lowongan_id')->constrained('rekrutmen.lowongans')->onDelete('cascade');
            $table->string('divisi', 100); // IT, Finance, HRD, Marketing, Customer Service, Service Motor, Parts Motor, Administrasi, General
            $table->decimal('total_skor', 5, 2)->default(0.00); // 0.00 to 100.00
            $table->string('rekomendasi', 50)->default('dipertimbangkan'); // sangat_disarankan, dipertimbangkan, tidak_disarankan
            $table->string('status_konfirmasi', 50)->default('menunggu_konfirmasi'); // menunggu_konfirmasi, disetujui, ditolak
            $table->json('kriteria_penilaian')->nullable(); // Table items: [{ kriteria, kebutuhan, data_kandidat, nilai, bobot_max, status_cocok }]
            $table->json('cv_parsed_data')->nullable(); // Parsed data: { pendidikan, pengalaman, skills, sertifikasi, bahasa, ringkasan }
            $table->text('catatan_ats')->nullable(); // Ringkasan evaluasi otomatis ATS
            $table->text('catatan_hr')->nullable(); // Catatan manual dari HR saat konfirmasi
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->index(['pelamar_id', 'status_konfirmasi']);
            $table->index(['lowongan_id', 'total_skor']);
            $table->index(['divisi', 'status_konfirmasi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.ats_screenings');
    }
};
