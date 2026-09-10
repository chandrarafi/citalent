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
        Schema::create('penjadwalan_interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelamar_id')->constrained('pelamars')->onDelete('cascade');
            $table->foreignId('lowongan_id')->constrained('rekrutmen.lowongans')->onDelete('cascade');
            $table->string('tahap', 50); // interview_hr, interview_user, interview_gm
            $table->date('tanggal_interview');
            $table->string('jam_mulai', 10); // e.g. "09:00"
            $table->string('jam_selesai', 10)->nullable(); // e.g. "10:00"
            $table->string('tipe_interview', 20)->default('offline'); // offline, online
            $table->string('lokasi')->nullable(); // e.g. "Ruang Rapat HR Lt. 2, Kantor Cabang Padang"
            $table->string('link_meeting', 500)->nullable(); // e.g. "https://meet.google.com/xyz"
            $table->string('pewawancara_nama')->nullable(); // e.g. "Bpk. Hendra (HR Manager), Ibu Maya (Head IT)"
            $table->text('catatan_untuk_kandidat')->nullable(); // Petunjuk persiapan, dresscode, dokumen
            $table->string('status_kehadiran', 30)->default('scheduled'); // scheduled, hadir, tidak_hadir, reschedule, selesai
            $table->timestamp('reminder_sent_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['tanggal_interview', 'status_kehadiran']);
            $table->index(['pelamar_id', 'tahap']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penjadwalan_interviews');
    }
};
