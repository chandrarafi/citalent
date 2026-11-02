<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogPengirimanEmail extends Model
{
    use HasFactory;

    protected $table = 'rekrutmen.log_pengiriman_emails';

    protected $fillable = [
        'pelamar_id',
        'lowongan_id',
        'penjadwalan_interview_id',
        'email_tujuan',
        'nama_penerima',
        'tipe_email',
        'status_lamaran',
        'subject',
        'detail_jadwal',
        'catatan',
        'status_pengiriman',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'detail_jadwal' => 'array',
        'sent_at' => 'datetime',
    ];

    public function pelamar(): BelongsTo
    {
        return $this->belongsTo(Pelamar::class, 'pelamar_id');
    }

    public function lowongan(): BelongsTo
    {
        return $this->belongsTo(Lowongan::class, 'lowongan_id');
    }

    public function penjadwalanInterview(): BelongsTo
    {
        return $this->belongsTo(PenjadwalanInterview::class, 'penjadwalan_interview_id');
    }
}
