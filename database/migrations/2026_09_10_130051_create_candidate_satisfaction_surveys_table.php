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
        Schema::create('candidate_satisfaction_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('pelamar_id')->nullable()->constrained('pelamars')->nullOnDelete();
            $table->string('nama_kandidat')->nullable();
            $table->string('email_kandidat')->nullable();
            $table->string('posisi')->nullable();
            $table->string('tahap')->default('Skill Test');

            // 7 Skala 1-5 Pertanyaan
            $table->unsignedTinyInteger('q1_kemudahan_daftar')->default(5);
            $table->unsignedTinyInteger('q2_kejelasan_info')->default(5);
            $table->unsignedTinyInteger('q3_kecepatan_proses')->default(5);
            $table->unsignedTinyInteger('q4_kemudahan_data')->default(5);
            $table->unsignedTinyInteger('q5_pengalaman_skill_test')->default(5);
            $table->unsignedTinyInteger('q6_profesionalisme_hr')->default(5);
            $table->unsignedTinyInteger('q7_kepuasan_keseluruhan')->default(5);

            // 2 Pertanyaan Terbuka
            $table->text('q8_hal_disukai')->nullable();
            $table->text('q9_hal_diperbaiki')->nullable();

            // Metrik Kalkulasi
            $table->decimal('skor_rata_rata', 3, 2)->default(5.00);
            $table->unsignedTinyInteger('nps_score')->default(10); // 0-10 untuk perhitungan Net Promoter Score
            $table->enum('sentimen', ['positif', 'netral', 'negatif'])->default('positif');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidate_satisfaction_surveys');
    }
};
