<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermintaanRekrutmen extends Model
{
    protected $table = 'rekrutmen.permintaan_rekrutmens';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'kode_permintaan',
        'kd_departement',
        'posisi_id',
        'requester_id',
        'jumlah',
        'tgl_permintaan',
        'target_join',
        'prioritas',
        'status_persetujuan',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'tgl_permintaan' => 'date:Y-m-d',
        'target_join' => 'date:Y-m-d',
    ];

    public function departement()
    {
        return $this->belongsTo(Departement::class, 'kd_departement', 'id');
    }

    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class, 'posisi_id', 'id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id', 'id');
    }

    public function lowongan()
    {
        return $this->hasOne(Lowongan::class, 'permintaan_rekrutmen_id', 'id');
    }
}
