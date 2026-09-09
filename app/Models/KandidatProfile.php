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

    public function getFotoUrlAttribute(): string
    {
        if (empty($this->foto_path)) {
            return asset('assets/images/user.png');
        }

        return str_starts_with($this->foto_path, 'http')
            ? $this->foto_path
            : asset('storage/' . $this->foto_path);
    }

    public function getCvUrlAttribute(): ?string
    {
        if (empty($this->cv_path)) {
            return null;
        }

        return str_starts_with($this->cv_path, 'http')
            ? $this->cv_path
            : asset('storage/' . $this->cv_path);
    }

    public function getSuratLamaranUrlAttribute(): ?string
    {
        if (empty($this->surat_lamaran_path)) {
            return null;
        }

        return str_starts_with($this->surat_lamaran_path, 'http')
            ? $this->surat_lamaran_path
            : asset('storage/' . $this->surat_lamaran_path);
    }
}
