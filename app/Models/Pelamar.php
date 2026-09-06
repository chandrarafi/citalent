<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pelamar extends Model
{
    protected $table = 'rekrutmen.pelamars';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'lowongan_id',
        'no_pendaftaran',
        'nama_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'status_pernikahan',
        'agama',
        'alamat',
        'domisili',
        'nomor_kontak',
        'email',
        'pendidikan_terakhir',
        'nama_institusi',
        'jurusan',
        'tahun_lulus',
        'posisi_dilamar',
        'cv_path',
        'surat_lamaran_path',
        'pernyataan_kebenaran',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date:Y-m-d',
        'pernyataan_kebenaran' => 'boolean',
    ];

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'lowongan_id', 'id');
    }
}
