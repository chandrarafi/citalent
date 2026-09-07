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
        Schema::create('rekrutmen.kandidat_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('public.users')->onDelete('cascade');

            // Biodata Pribadi
            $table->string('tempat_lahir', 150)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin', 20)->nullable();
            $table->string('status_pernikahan', 50)->nullable();
            $table->string('agama', 50)->nullable();
            $table->text('alamat')->nullable();
            $table->string('domisili', 150)->nullable();

            // Pendidikan
            $table->string('pendidikan_terakhir', 50)->nullable();
            $table->string('nama_institusi', 255)->nullable();
            $table->string('jurusan', 255)->nullable();
            $table->string('tahun_lulus', 10)->nullable();

            // Berkas Dokumen
            $table->string('foto_path', 500)->nullable();
            $table->string('cv_path', 500)->nullable();
            $table->string('surat_lamaran_path', 500)->nullable();

            $table->boolean('is_complete')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.kandidat_profiles');
    }
};
