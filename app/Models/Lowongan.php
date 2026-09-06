<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lowongan extends Model
{
    protected $table = 'rekrutmen.lowongans';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'permintaan_rekrutmen_id',
        'kode_lowongan',
        'slug',
        'judul',
        'kd_departement',
        'posisi_id',
        'jumlah_dibutuhkan',
        'lokasi_kerja',
        'tipe_pekerjaan',
        'deskripsi',
        'kualifikasi',
        'tgl_buka',
        'tgl_tutup',
        'status',
        'created_by',
    ];

    protected $casts = [
        'jumlah_dibutuhkan' => 'integer',
        'tgl_buka' => 'date:Y-m-d',
        'tgl_tutup' => 'date:Y-m-d',
    ];

    public function permintaanRekrutmen()
    {
        return $this->belongsTo(PermintaanRekrutmen::class, 'permintaan_rekrutmen_id', 'id');
    }

    public function departement()
    {
        return $this->belongsTo(Departement::class, 'kd_departement', 'id');
    }

    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class, 'posisi_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function pelamars()
    {
        return $this->hasMany(Pelamar::class, 'lowongan_id', 'id');
    }
}
