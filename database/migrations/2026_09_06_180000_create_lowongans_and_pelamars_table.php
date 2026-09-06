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
        // 1. Table Lowongan Pekerjaan (Published Vacancy)
        Schema::create('rekrutmen.lowongans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permintaan_rekrutmen_id')
                ->constrained('rekrutmen.permintaan_rekrutmens')
                ->onDelete('cascade');
            $table->string('kode_lowongan', 50)->unique();
            $table->string('slug', 255)->unique();
            $table->string('judul', 255);
            $table->foreignId('kd_departement')->constrained('public.departement')->onDelete('cascade');
            $table->foreignId('posisi_id')->constrained('public.jabatan')->onDelete('cascade');
            $table->integer('jumlah_dibutuhkan')->default(1);
            $table->string('lokasi_kerja', 150)->default('Kantor Pusat (On-site)');
            $table->string('tipe_pekerjaan', 50)->default('Full-time');
            $table->text('deskripsi')->nullable();
            $table->text('kualifikasi')->nullable();
            $table->date('tgl_buka');
            $table->date('tgl_tutup')->nullable();
            $table->enum('status', ['aktif', 'ditutup', 'draft'])->default('aktif');
            $table->foreignId('created_by')->nullable()->constrained('public.users')->onDelete('set null');
            $table->timestamps();
        });

        // 2. Table Pelamar / Kandidat (Candidate Applications)
        Schema::create('rekrutmen.pelamars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lowongan_id')
                ->constrained('rekrutmen.lowongans')
                ->onDelete('cascade');
            $table->string('no_pendaftaran', 50)->unique();
            $table->string('nama_lengkap', 255);
            $table->string('tempat_lahir', 150);
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan']);
            $table->string('status_pernikahan', 50);
            $table->string('agama', 50);
            $table->text('alamat');
            $table->string('domisili', 150);
            $table->string('nomor_kontak', 50);
            $table->string('email', 255);
            $table->string('pendidikan_terakhir', 50);
            $table->string('nama_institusi', 255);
            $table->string('jurusan', 255);
            $table->string('tahun_lulus', 10);
            $table->string('posisi_dilamar', 255);
            $table->string('cv_path', 500);
            $table->string('surat_lamaran_path', 500)->nullable();
            $table->boolean('pernyataan_kebenaran')->default(true);
            $table->enum('status', ['submitted', 'review', 'interview', 'accepted', 'rejected'])->default('submitted');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.pelamars');
        Schema::dropIfExists('rekrutmen.lowongans');
    }
};
