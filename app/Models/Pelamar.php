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
        'sumber_informasi',
        'foto_path',
        'cv_path',
        'surat_lamaran_path',
        'pernyataan_kebenaran',
        'status',
        'tahap_gagal',
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

    public function formulirLamaran()
    {
        return $this->hasOne(FormulirLamaran::class, 'pelamar_id', 'id');
    }

    public function penilaianSkillTests()
    {
        return $this->hasMany(PenilaianSkillTest::class, 'pelamar_id', 'id')->orderByDesc('id');
    }

    public function latestPenilaianSkillTest()
    {
        return $this->hasOne(PenilaianSkillTest::class, 'pelamar_id', 'id')->latestOfMany();
    }

    /**
     * Get the effective failed stage if rejected.
     */
    public function getEffectiveTahapGagalAttribute(): ?string
    {
        if ($this->status !== 'rejected') {
            return null;
        }

        if (!empty($this->tahap_gagal)) {
            return $this->tahap_gagal;
        }

        if ($this->relationLoaded('penilaianSkillTests') ? $this->penilaianSkillTests->isNotEmpty() : $this->penilaianSkillTests()->exists()) {
            return 'skill_test';
        }

        if ($this->formulirLamaran?->is_submitted) {
            $kdJabatan = $this->lowongan?->jabatan?->kd_jabatan
                ?: ($this->lowongan?->permintaanRekrutmen?->kd_jabatan ?: '');
            $skillTestJabatanCodes = ['JBT-5', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31', 'JBT-26'];
            $hasSkillTest = in_array($kdJabatan, $skillTestJabatanCodes);

            return $hasSkillTest ? 'skill_test' : 'interview_hr';
        }

        return 'screening_cv';
    }
}
