<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class HelpdeskTicket extends Model
{
    protected $table = 'rekrutmen.helpdesk_tickets';

    protected $fillable = [
        'kode_tiket',
        'user_id',
        'chat_token',
        'reporter_name',
        'reporter_email',
        'reporter_phone',
        'kategori',
        'judul',
        'deskripsi',
        'halaman_url',
        'screenshot_path',
        'status',
        'tanggapan_admin',
        'ditangani_oleh',
        'ditangani_at',
    ];

    protected $hidden = [
        'chat_token',
    ];

    protected $casts = [
        'ditangani_at' => 'datetime',
    ];

    protected $appends = [
        'screenshot_url',
    ];

    public const STATUSES = [
        'menunggu',
        'diproses',
        'selesai',
        'ditutup',
    ];

    public const OPEN_STATUSES = [
        'menunggu',
        'diproses',
    ];

    public const KATEGORIS = [
        'Error Halaman / Bug',
        'Gagal Upload Dokumen',
        'Masalah Formulir Lamaran',
        'Kendala Akun & Login',
        'Tampilan / Responsif',
        'Lainnya',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditangani_oleh');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(HelpdeskMessage::class, 'helpdesk_ticket_id')->orderBy('id');
    }

    public function isOpenForChat(): bool
    {
        return in_array($this->status, self::OPEN_STATUSES, true);
    }

    /**
     * Live chat operating schedule: Monday to Saturday, 08:00 - 17:00 WIB (Asia/Jakarta).
     *
     * @return array{active: bool, schedule_label: string, message: string, timezone: string}
     */
    public static function liveChatAvailability(?Carbon $now = null): array
    {
        $tz = 'Asia/Jakarta';
        $current = ($now ? $now->copy() : now($tz))->timezone($tz);

        $isOperationalDay = $current->dayOfWeekIso >= Carbon::MONDAY
            && $current->dayOfWeekIso <= Carbon::SATURDAY;

        $minutesOfDay = ($current->hour * 60) + $current->minute;
        $isOperationalHour = $minutesOfDay >= (8 * 60) && $minutesOfDay < (17 * 60);

        $active = $isOperationalDay && $isOperationalHour;

        return [
            'active' => $active,
            'schedule_label' => 'Senin – Sabtu, 08:00 – 17:00 WIB',
            'message' => $active
                ? 'Live Chat aktif (Senin – Sabtu, 08:00 – 17:00 WIB).'
                : 'Live Chat aktif hari Senin – Sabtu pukul 08:00 – 17:00 WIB. Tiket Anda tetap tersimpan dan akan dibalas pada jam operasional.',
            'timezone' => $tz,
        ];
    }

    /**
     * Unguessable capability channel key derived from ticket code and secret chat token.
     */
    public function getGuestChannelKey(): ?string
    {
        if (empty($this->chat_token)) {
            return null;
        }

        return hash_hmac('sha256', $this->kode_tiket . '|' . $this->chat_token, (string) config('app.key'));
    }

    public function getScreenshotUrlAttribute(): ?string
    {
        if (empty($this->screenshot_path)) {
            return null;
        }

        if (str_starts_with($this->screenshot_path, 'http://') || str_starts_with($this->screenshot_path, 'https://')) {
            return $this->screenshot_path;
        }

        return asset('storage/' . $this->screenshot_path);
    }

    /**
     * Generate next daily ticket code using max existing suffix so deleted rows never cause collisions.
     */
    public static function generateNextKodeTiket(?string $dateString = null): string
    {
        $datePrefix = $dateString ?: now()->format('Ymd');
        $prefix = 'HLP-' . $datePrefix . '-';

        $latest = static::query()
            ->where('kode_tiket', 'like', $prefix . '%')
            ->orderByDesc('kode_tiket')
            ->value('kode_tiket');

        $nextNumber = 1;
        if ($latest && preg_match('/-(\d+)$/', $latest, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create ticket inside a transaction with advisory lock and unique-constraint retry.
     */
    public static function createWithGeneratedKode(array $attributes): self
    {
        $maxAttempts = 5;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return DB::transaction(function () use ($attributes) {
                    if (DB::connection()->getDriverName() === 'pgsql') {
                        DB::statement("SELECT pg_advisory_xact_lock(hashtext('helpdesk_ticket_kode_seq'))");
                    }

                    $kode = static::generateNextKodeTiket();

                    return static::create([
                        ...$attributes,
                        'kode_tiket' => $kode,
                    ]);
                });
            } catch (QueryException $e) {
                $sqlState = $e->errorInfo[0] ?? null;
                $isUniqueViolation = in_array($sqlState, ['23505', '23000'], true)
                    || str_contains(strtolower($e->getMessage()), 'unique');

                if (!$isUniqueViolation || $attempt === $maxAttempts) {
                    throw $e;
                }
            }
        }

        throw new \RuntimeException('Gagal membuat kode tiket helpdesk yang unik.');
    }
}
