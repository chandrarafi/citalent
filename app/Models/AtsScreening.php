<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AtsScreening extends Model
{
    protected $table = 'rekrutmen.ats_screenings';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'pelamar_id',
        'lowongan_id',
        'divisi',
        'total_skor',
        'rekomendasi',
        'status_konfirmasi',
        'kriteria_penilaian',
        'cv_parsed_data',
        'catatan_ats',
        'catatan_hr',
        'confirmed_by',
        'confirmed_at',
    ];

    protected $casts = [
        'total_skor' => 'float',
        'kriteria_penilaian' => 'array',
        'cv_parsed_data' => 'array',
        'confirmed_at' => 'datetime',
    ];

    protected $appends = [
        'rekomendasi_label',
        'rekomendasi_tone',
        'status_konfirmasi_label',
        'status_konfirmasi_tone',
    ];

    public function pelamar()
    {
        return $this->belongsTo(Pelamar::class, 'pelamar_id', 'id');
    }

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'lowongan_id', 'id');
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by', 'id');
    }

    public function getRekomendasiLabelAttribute(): string
    {
        return match ($this->rekomendasi) {
            'sangat_disarankan' => 'Top Candidate (Sangat Disarankan)',
            'dipertimbangkan' => 'Dipertimbangkan',
            'tidak_disarankan' => 'Kurang Sesuai (Tidak Disarankan)',
            default => 'Belum Dinilai',
        };
    }

    public function getRekomendasiToneAttribute(): string
    {
        return match ($this->rekomendasi) {
            'sangat_disarankan' => 'mint',
            'dipertimbangkan' => 'yellow',
            'tidak_disarankan' => 'pink',
            default => 'blue',
        };
    }

    public function getStatusKonfirmasiLabelAttribute(): string
    {
        return match ($this->status_konfirmasi) {
            'menunggu_konfirmasi' => 'Menunggu Konfirmasi HR',
            'disetujui' => 'Dikonfirmasi Lolos',
            'ditolak' => 'Dikonfirmasi Ditolak',
            default => 'Draft',
        };
    }

    public function getStatusKonfirmasiToneAttribute(): string
    {
        return match ($this->status_konfirmasi) {
            'menunggu_konfirmasi' => 'orange',
            'disetujui' => 'mint',
            'ditolak' => 'pink',
            default => 'yellow',
        };
    }
}
