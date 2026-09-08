<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    protected $table = 'public.jabatan';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'kd_departement',
        'kd_jabatan',
        'nama_jabatan',
        'active',
        'flag_approval',
        'flag_proposal',
    ];

    public function departement()
    {
        return $this->belongsTo(Departement::class, 'kd_departement', 'kd_departement');
    }

    public function permintaanRekrutmens()
    {
        return $this->hasMany(PermintaanRekrutmen::class, 'posisi_id', 'id');
    }

    public function parameterSkillTests()
    {
        return $this->hasMany(ParameterSkillTest::class, 'kd_jabatan', 'kd_jabatan')->orderBy('urutan');
    }
}
