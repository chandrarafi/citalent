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
        Schema::create('rekrutmen.formulir_lamarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelamar_id')->unique()->constrained('rekrutmen.pelamars')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('public.users')->onDelete('cascade');

            // 1. Identitas
            $table->string('no_lamaran', 50)->nullable();
            $table->string('nama_lengkap', 255)->nullable();
            $table->string('tempat_lahir', 150)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('agama', 50)->nullable();
            $table->string('kewarganegaraan', 50)->default('Indonesia');
            $table->string('no_ktp_sim', 50)->nullable();
            $table->text('alamat_padang')->nullable();
            $table->string('telp_padang', 50)->nullable();
            $table->string('hp_padang', 50)->nullable();
            $table->text('alamat_luar_padang')->nullable();
            $table->string('telp_luar_padang', 50)->nullable();

            // 2. Pendidikan
            $table->json('pendidikan_formal')->nullable();
            $table->text('alasan_pilih_jurusan')->nullable();
            $table->text('karya_ilmiah')->nullable();
            $table->json('pendidikan_non_formal')->nullable();
            $table->json('bahasa_asing')->nullable();

            // 3. Keluarga dan Lingkungan
            $table->string('status_pernikahan', 50)->nullable();
            $table->date('status_pernikahan_sejak')->nullable();
            $table->json('keluarga_inti')->nullable();
            $table->json('susunan_keluarga')->nullable();

            // 4. Riwayat Pekerjaan
            $table->json('pengalaman_kerja')->nullable();
            $table->text('gambaran_jabatan')->nullable();
            $table->json('atasan_bawahan')->nullable();
            $table->text('masalah_kerja_dan_solusi')->nullable();
            $table->text('kesan_perusahaan_sebelumnya')->nullable();
            $table->text('penanganan_masalah_keputusan')->nullable();

            // 5. Minat dan Konsep Pribadi
            $table->text('cita_cita')->nullable();
            $table->text('pendorong_kerja')->nullable();
            $table->text('alasan_melamar_perusahaan')->nullable();
            $table->string('gaji_diharapkan', 50)->nullable();
            $table->text('fasilitas_diharapkan')->nullable();
            $table->string('kapan_mulai_kerja', 100)->nullable();
            $table->json('prioritas_pekerjaan')->nullable();
            $table->string('bersedia_luar_daerah', 20)->nullable();
            $table->text('tipe_orang_disenangi')->nullable();
            $table->text('hal_sulit_ambil_keputusan')->nullable();

            // 6. Aktivitas Sosial
            $table->string('ada_kenalan_perusahaan', 20)->nullable();
            $table->json('kenalan_perusahaan')->nullable();
            $table->json('referensi')->nullable();
            $table->text('hobi')->nullable();
            $table->text('cara_mengisi_waktu_luang')->nullable();
            $table->json('organisasi')->nullable();

            // 7. Lain - lain
            $table->json('riwayat_psikotest')->nullable();
            $table->text('kekuatan_diri')->nullable();
            $table->text('kelemahan_diri')->nullable();
            $table->string('pernah_sakit_lama', 20)->nullable();
            $table->json('riwayat_penyakit')->nullable();
            $table->text('gangguan_jasmani')->nullable();

            // Konfirmasi & Status Form
            $table->boolean('pernyataan_kebenaran')->default(true);
            $table->date('tanggal_pernyataan')->nullable();
            $table->boolean('is_submitted')->default(false);
            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekrutmen.formulir_lamarans');
    }
};
