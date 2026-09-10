<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenjadwalanInterview extends Model
{
    use HasFactory;

    protected $table = 'penjadwalan_interviews';

    protected $fillable = [
        'pelamar_id',
        'lowongan_id',
        'tahap',
        'tanggal_interview',
        'jam_mulai',
        'jam_selesai',
        'tipe_interview',
        'lokasi',
        'link_meeting',
        'pewawancara_nama',
        'catatan_untuk_kandidat',
        'status_kehadiran',
        'reminder_sent_at',
        'created_by',
    ];

    protected $casts = [
        'tanggal_interview' => 'date:Y-m-d',
        'reminder_sent_at' => 'datetime',
    ];

    public function pelamar(): BelongsTo
    {
        return $this->belongsTo(Pelamar::class, 'pelamar_id');
    }

    public function lowongan(): BelongsTo
    {
        return $this->belongsTo(Lowongan::class, 'lowongan_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('tanggal_interview', today());
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->whereDate('tanggal_interview', '>=', today())
            ->whereIn('status_kehadiran', ['scheduled', 'reschedule']);
    }

    public function scopeByTahap(Builder $query, string $tahap): Builder
    {
        return $query->where('tahap', $tahap);
    }

    public function getTahapLabelAttribute(): string
    {
        return match ($this->tahap) {
            'interview_hr' => 'Interview HR',
            'interview_user' => 'Interview User',
            'interview_gm' => 'Interview GM',
            default => ucfirst(str_replace('_', ' ', $this->tahap)),
        };
    }
}
