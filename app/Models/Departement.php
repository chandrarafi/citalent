<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departement extends Model
{
    protected $table = 'public.departement';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'kd_departement',
        'deskripsi',
        'active',
    ];

    public function jabatans()
    {
        return $this->hasMany(Jabatan::class, 'kd_departement', 'kd_departement');
    }

    public function permintaanRekrutmens()
    {
        return $this->hasMany(PermintaanRekrutmen::class, 'kd_departement', 'id');
    }
}
