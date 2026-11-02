<?php

namespace App\Mail;

use App\Models\LogPengirimanEmail;
use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StatusLamaranUpdatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $statusLabel;

    public function __construct(
        public Pelamar $pelamar,
        public string $status,
        public ?string $catatan = null,
        ?string $statusLabel = null,
        public ?PenjadwalanInterview $schedule = null
    ) {
        $this->statusLabel = $statusLabel ?? match ($this->status) {
            'submitted' => 'Submit Lamaran',
            'screening_cv' => 'Screening CV',
            'lengkapi_formulir' => 'Lengkapi Formulir Lamaran Kerja',
            'interview_hr' => 'Interview HR',
            'interview_user' => 'Interview User',
            'interview_gm' => 'Interview GM',
            'skill_test' => 'Skill Test',
            'final_discussion' => 'Final Discussion',
            'accepted' => 'Diterima Bekerja',
            'rejected' => 'Tidak Lolos',
            default => ucwords(str_replace('_', ' ', $this->status)),
        };
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $appName = config('app.name', 'Citalent');
        $posisi = $this->pelamar->posisi_dilamar ?: ($this->pelamar->lowongan?->judul ?? 'Posisi Rekrutmen');

        $isLulus = ($this->status !== 'rejected');

        $subject = match ($this->status) {
            'accepted' => "Selamat! Anda Dinyatakan Lulus & Diterima Bekerja ({$posisi}) - {$appName}",
            'rejected' => "Pemberitahuan Hasil Seleksi Lamaran ({$posisi}) - {$appName}",
            'interview_hr' => "Selamat! Anda Dinyatakan Lolos ke Tahap Interview HR ({$posisi}) - {$appName}",
            'interview_user' => "Selamat! Anda Dinyatakan Lolos ke Tahap Interview User ({$posisi}) - {$appName}",
            'interview_gm' => "Selamat! Anda Dinyatakan Lolos ke Tahap Interview GM ({$posisi}) - {$appName}",
            'skill_test' => "Selamat! Anda Dinyatakan Lolos ke Tahap Skill Test ({$posisi}) - {$appName}",
            'final_discussion' => "Selamat! Anda Dinyatakan Lolos ke Tahap Final Discussion ({$posisi}) - {$appName}",
            default => $isLulus
                ? "Selamat! Anda Dinyatakan Lolos ke Tahap {$this->statusLabel} ({$posisi}) - {$appName}"
                : "Pemberitahuan Hasil Seleksi Lamaran ({$posisi}) - {$appName}",
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $view = ($this->status === 'rejected') ? 'emails.lamaran_gagal' : 'emails.lamaran_lulus';

        return new Content(
            view: $view,
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Send the message using the given mailer and log to database.
     */
    public function send($mailer)
    {
        $isLolos = ($this->status !== 'rejected');
        $detailJadwal = null;
        if ($this->schedule) {
            $detailJadwal = [
                'tahap' => $this->schedule->tahap,
                'tanggal_interview' => $this->schedule->tanggal_interview?->format('Y-m-d') ?? (string) $this->schedule->tanggal_interview,
                'jam_mulai' => $this->schedule->jam_mulai,
                'jam_selesai' => $this->schedule->jam_selesai,
                'tipe_interview' => $this->schedule->tipe_interview,
                'lokasi' => $this->schedule->lokasi,
                'link_meeting' => $this->schedule->link_meeting,
                'pewawancara_nama' => $this->schedule->pewawancara_nama,
            ];
        }

        $log = null;
        try {
            $log = LogPengirimanEmail::create([
                'pelamar_id' => $this->pelamar->id,
                'lowongan_id' => $this->pelamar->lowongan_id,
                'penjadwalan_interview_id' => $this->schedule?->id,
                'email_tujuan' => $this->pelamar->email,
                'nama_penerima' => $this->pelamar->nama_lengkap,
                'tipe_email' => $isLolos ? 'lolos' : 'tidak_lolos',
                'status_lamaran' => $this->status,
                'subject' => $this->envelope()->subject,
                'detail_jadwal' => $detailJadwal,
                'catatan' => $this->catatan,
                'status_pengiriman' => 'queued',
            ]);
        } catch (\Throwable $e) {
            // Jangan gagalkan pengiriman email jika create log awal mengalami kendala
        }

        try {
            $result = parent::send($mailer);

            if ($log) {
                $log->update([
                    'status_pengiriman' => 'terkirim',
                    'sent_at' => now(),
                ]);
            }

            return $result;
        } catch (\Throwable $e) {
            if ($log) {
                $log->update([
                    'status_pengiriman' => 'gagal',
                    'error_message' => $e->getMessage(),
                ]);
            } else {
                try {
                    LogPengirimanEmail::create([
                        'pelamar_id' => $this->pelamar->id,
                        'lowongan_id' => $this->pelamar->lowongan_id,
                        'penjadwalan_interview_id' => $this->schedule?->id,
                        'email_tujuan' => $this->pelamar->email,
                        'nama_penerima' => $this->pelamar->nama_lengkap,
                        'tipe_email' => $isLolos ? 'lolos' : 'tidak_lolos',
                        'status_lamaran' => $this->status,
                        'subject' => $this->envelope()->subject,
                        'detail_jadwal' => $detailJadwal,
                        'catatan' => $this->catatan,
                        'status_pengiriman' => 'gagal',
                        'error_message' => $e->getMessage(),
                    ]);
                } catch (\Throwable) {}
            }

            throw $e;
        }
    }
}
