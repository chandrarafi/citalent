<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormulirLamaran extends Model
{
    use HasFactory;

    protected $table = 'rekrutmen.formulir_lamarans';

    protected $fillable = [
        'pelamar_id',
        'user_id',
        'no_lamaran',
        'nama_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'kewarganegaraan',
        'no_ktp_sim',
        'alamat_padang',
        'telp_padang',
        'hp_padang',
        'alamat_luar_padang',
        'telp_luar_padang',
        'pendidikan_formal',
        'alasan_pilih_jurusan',
        'karya_ilmiah',
        'pendidikan_non_formal',
        'bahasa_asing',
        'status_pernikahan',
        'status_pernikahan_sejak',
        'keluarga_inti',
        'susunan_keluarga',
        'pengalaman_kerja',
        'gambaran_jabatan',
        'atasan_bawahan',
        'masalah_kerja_dan_solusi',
        'kesan_perusahaan_sebelumnya',
        'penanganan_masalah_keputusan',
        'cita_cita',
        'pendorong_kerja',
        'alasan_melamar_perusahaan',
        'gaji_diharapkan',
        'fasilitas_diharapkan',
        'kapan_mulai_kerja',
        'prioritas_pekerjaan',
        'bersedia_luar_daerah',
        'tipe_orang_disenangi',
        'hal_sulit_ambil_keputusan',
        'ada_kenalan_perusahaan',
        'kenalan_perusahaan',
        'referensi',
        'hobi',
        'cara_mengisi_waktu_luang',
        'organisasi',
        'riwayat_psikotest',
        'kekuatan_diri',
        'kelemahan_diri',
        'pernah_sakit_lama',
        'riwayat_penyakit',
        'gangguan_jasmani',
        'pernyataan_kebenaran',
        'tanggal_pernyataan',
        'is_submitted',
        'submitted_at',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date:Y-m-d',
        'status_pernikahan_sejak' => 'date:Y-m-d',
        'tanggal_pernyataan' => 'date:Y-m-d',
        'pendidikan_formal' => 'array',
        'pendidikan_non_formal' => 'array',
        'bahasa_asing' => 'array',
        'keluarga_inti' => 'array',
        'susunan_keluarga' => 'array',
        'pengalaman_kerja' => 'array',
        'atasan_bawahan' => 'array',
        'prioritas_pekerjaan' => 'array',
        'kenalan_perusahaan' => 'array',
        'referensi' => 'array',
        'organisasi' => 'array',
        'riwayat_psikotest' => 'array',
        'riwayat_penyakit' => 'array',
        'pernyataan_kebenaran' => 'boolean',
        'is_submitted' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function pelamar()
    {
        return $this->belongsTo(Pelamar::class, 'pelamar_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
