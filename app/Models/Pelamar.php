<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

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
        'cv_markdown',
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

    protected $appends = [
        'foto_url',
        'cv_url',
    ];

    public function getFotoUrlAttribute(): string
    {
        if (empty($this->foto_path)) {
            return asset('assets/images/user.png');
        }

        if (str_starts_with($this->foto_path, 'http://') || str_starts_with($this->foto_path, 'https://')) {
            return $this->foto_path;
        }

        $storagePath = public_path('storage/' . $this->foto_path);
        $directPath = public_path($this->foto_path);

        if (file_exists($storagePath)) {
            return asset('storage/' . $this->foto_path);
        }

        if (file_exists($directPath)) {
            return asset($this->foto_path);
        }

        return asset('assets/images/user.png');
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

    public function penjadwalanInterviews()
    {
        return $this->hasMany(PenjadwalanInterview::class, 'pelamar_id', 'id')->orderByDesc('tanggal_interview');
    }

    public function atsScreening()
    {
        return $this->hasOne(AtsScreening::class, 'pelamar_id', 'id');
    }

    public function latestInterviewSchedule()
    {
        return $this->hasOne(PenjadwalanInterview::class, 'pelamar_id', 'id')->latestOfMany('tanggal_interview');
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

    /**
     * Generate the next registration number (REG-YYYYMMDD-XXXX) based on the
     * highest existing sequence for the given date so deleted rows never cause collisions.
     */
    public static function generateNextNoPendaftaran(?string $date = null): string
    {
        $prefix = 'REG-' . ($date ?? date('Ymd')) . '-';
        $prefixLen = strlen($prefix);

        $maxSeq = static::query()
            ->where('no_pendaftaran', 'like', "{$prefix}%")
            ->pluck('no_pendaftaran')
            ->reduce(function (int $max, string $code) use ($prefixLen): int {
                $suffix = substr($code, $prefixLen);

                return ctype_digit($suffix) ? max($max, (int) $suffix) : $max;
            }, 0);

        return $prefix . str_pad((string) ($maxSeq + 1), 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create a Pelamar record with a unique sequential registration number,
     * protected against deleted gaps and concurrent submissions.
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function createWithGeneratedNoPendaftaran(array $attributes): self
    {
        $maxAttempts = 5;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return DB::transaction(function () use ($attributes): self {
                    if (DB::getDriverName() === 'pgsql') {
                        DB::statement('SELECT pg_advisory_xact_lock(hashtext(?))', ['pelamar_no_pendaftaran_' . date('Ymd')]);
                    }

                    $attributes['no_pendaftaran'] = static::generateNextNoPendaftaran();

                    return static::create($attributes);
                });
            } catch (QueryException $e) {
                $sqlState = (string) ($e->errorInfo[0] ?? $e->getCode());
                $isUniqueViolation = in_array($sqlState, ['23505', '23000'], true)
                    && str_contains($e->getMessage(), 'no_pendaftaran');

                if (!$isUniqueViolation || $attempt === $maxAttempts) {
                    throw $e;
                }
            }
        }

        throw new \RuntimeException('Gagal membuat nomor pendaftaran.');
    }
}
