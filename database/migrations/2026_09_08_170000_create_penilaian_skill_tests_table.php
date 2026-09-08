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
        Schema::create('penilaian_skill_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelamar_id')->constrained('pelamars')->onDelete('cascade');
            $table->string('kd_jabatan', 50);
            $table->foreignId('penguji_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama_penguji')->nullable();
            $table->date('tanggal_test');
            $table->decimal('total_skor', 5, 2)->default(0); // Skala 1 - 5 terbobot
            $table->decimal('nilai_akhir', 5, 2)->default(0); // Skala 0 - 100
            $table->enum('rekomendasi', ['disarankan', 'dipertimbangkan', 'tidak_disarankan'])->default('dipertimbangkan');
            $table->text('catatan')->nullable();
            $table->enum('status', ['draft', 'final'])->default('draft');
            $table->timestamps();

            $table->index(['pelamar_id', 'kd_jabatan']);
        });

        Schema::create('detail_penilaian_skill_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penilaian_skill_test_id')->constrained('penilaian_skill_tests')->onDelete('cascade');
            $table->foreignId('parameter_skill_test_id')->constrained('parameter_skill_tests')->onDelete('cascade');
            $table->foreignId('detail_parameter_skill_test_id')->constrained('detail_parameter_skill_tests')->onDelete('cascade');
            $table->unsignedTinyInteger('skor')->default(3); // 1 - 5
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_penilaian_skill_tests');
        Schema::dropIfExists('penilaian_skill_tests');
    }
};
