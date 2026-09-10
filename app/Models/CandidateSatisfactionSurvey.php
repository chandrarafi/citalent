<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateSatisfactionSurvey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pelamar_id',
        'nama_kandidat',
        'email_kandidat',
        'posisi',
        'tahap',
        'q1_kemudahan_daftar',
        'q2_kejelasan_info',
        'q3_kecepatan_proses',
        'q4_kemudahan_data',
        'q5_pengalaman_skill_test',
        'q6_profesionalisme_hr',
        'q7_kepuasan_keseluruhan',
        'q8_hal_disukai',
        'q9_hal_diperbaiki',
        'skor_rata_rata',
        'nps_score',
        'sentimen',
    ];

    protected $casts = [
        'q1_kemudahan_daftar' => 'integer',
        'q2_kejelasan_info' => 'integer',
        'q3_kecepatan_proses' => 'integer',
        'q4_kemudahan_data' => 'integer',
        'q5_pengalaman_skill_test' => 'integer',
        'q6_profesionalisme_hr' => 'integer',
        'q7_kepuasan_keseluruhan' => 'integer',
        'nps_score' => 'integer',
        'skor_rata_rata' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pelamar(): BelongsTo
    {
        return $this->belongsTo(Pelamar::class);
    }
}
