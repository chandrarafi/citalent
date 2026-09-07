<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class KandidatProfile extends Model
{
    use HasFactory;

    protected $table = 'rekrutmen.kandidat_profiles';

    protected $fillable = [
        'user_id',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'status_pernikahan',
        'agama',
        'alamat',
        'domisili',
        'pendidikan_terakhir',
        'nama_institusi',
        'jurusan',
        'tahun_lulus',
        'foto_path',
        'cv_path',
        'surat_lamaran_path',
        'is_complete',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date:Y-m-d',
        'is_complete' => 'boolean',
    ];

    protected $appends = [
        'foto_url',
        'cv_url',
        'surat_lamaran_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto_path && Storage::disk('public')->exists($this->foto_path)
            ? Storage::disk('public')->url($this->foto_path)
            : null;
    }

    public function getCvUrlAttribute(): ?string
    {
        return $this->cv_path && Storage::disk('public')->exists($this->cv_path)
            ? Storage::disk('public')->url($this->cv_path)
            : null;
    }

    public function getSuratLamaranUrlAttribute(): ?string
    {
        return $this->surat_lamaran_path && Storage::disk('public')->exists($this->surat_lamaran_path)
            ? Storage::disk('public')->url($this->surat_lamaran_path)
            : null;
    }
}
