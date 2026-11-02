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
        Schema::create('rekrutmen.log_pengiriman_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelamar_id')->constrained('rekrutmen.pelamars')->onDelete('cascade');
            $table->foreignId('lowongan_id')->nullable()->constrained('rekrutmen.lowongans')->onDelete('set null');
            $table->foreignId('penjadwalan_interview_id')->nullable()->constrained('penjadwalan_interviews')->onDelete('set null');
            $table->string('email_tujuan');
            $table->string('nama_penerima');
            $table->string('tipe_email', 30); // 'lolos', 'tidak_lolos'
            $table->string('status_lamaran', 50); // 'interview_hr', 'skill_test', 'accepted', 'rejected', etc.
            $table->string('subject', 255);
            $table->json('detail_jadwal')->nullable(); // Snapshot tanggal, jam, tipe, lokasi, link meeting
            $table->text('catatan')->nullable(); // Catatan tambahan dari HR
            $table->enum('status_pengiriman', ['queued', 'terkirim', 'gagal'])->default('queued');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['pelamar_id', 'tipe_email']);
            $table->index(['status_pengiriman', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.log_pengiriman_emails');
    }
};
