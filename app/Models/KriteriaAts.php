<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KriteriaAts extends Model
{
    protected $table = 'rekrutmen.kriteria_ats';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'divisi',
        'lowongan_id',
        'kategori',
        'nama_kriteria',
        'kebutuhan',
        'tipe_penilaian',
        'keywords',
        'bobot',
        'is_wajib',
        'urutan',
        'active',
    ];

    protected $casts = [
        'keywords' => 'array',
        'bobot' => 'integer',
        'is_wajib' => 'boolean',
        'urutan' => 'integer',
        'active' => 'boolean',
    ];

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'lowongan_id', 'id');
    }

    /**
     * Get criteria for a specific lowongan or fallback to division template.
     */
    public static function getCriteriaFor(int $lowonganId, string $divisi)
    {
        // 1. Check if specific criteria exist for this lowongan
        $lowonganCriteria = static::where('lowongan_id', $lowonganId)
            ->where('active', true)
            ->orderBy('urutan')
            ->get();

        if ($lowonganCriteria->isNotEmpty()) {
            return $lowonganCriteria;
        }

        // 2. Fallback to division template (where lowongan_id is null)
        $divisionCriteria = static::whereNull('lowongan_id')
            ->where('divisi', $divisi)
            ->where('active', true)
            ->orderBy('urutan')
            ->get();

        if ($divisionCriteria->isNotEmpty()) {
            return $divisionCriteria;
        }

        // 3. Fallback to General division
        return static::whereNull('lowongan_id')
            ->where('divisi', 'General')
            ->where('active', true)
            ->orderBy('urutan')
            ->get();
    }
}
