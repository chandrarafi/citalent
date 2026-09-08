<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PenilaianSkillTest extends Model
{
    use HasFactory;

    protected $table = 'penilaian_skill_tests';

    protected $fillable = [
        'pelamar_id',
        'kd_jabatan',
        'jenis_tahap',
        'penguji_id',
        'nama_penguji',
        'tanggal_test',
        'total_skor',
        'nilai_akhir',
        'rekomendasi',
        'catatan',
        'status',
    ];

    protected $casts = [
        'tanggal_test' => 'date',
        'total_skor' => 'decimal:2',
        'nilai_akhir' => 'decimal:2',
    ];

    public function pelamar(): BelongsTo
    {
        return $this->belongsTo(Pelamar::class, 'pelamar_id');
    }

    public function penguji(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penguji_id');
    }

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'kd_jabatan', 'kd_jabatan');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailPenilaianSkillTest::class, 'penilaian_skill_test_id');
    }

    public function scopeTahap($query, string $tahap)
    {
        return $query->where('jenis_tahap', $tahap);
    }
}
