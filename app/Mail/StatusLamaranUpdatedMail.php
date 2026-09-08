<?php

namespace App\Mail;

use App\Models\Pelamar;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StatusLamaranUpdatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Pelamar $pelamar,
        public string $status,
        public ?string $catatan = null
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $appName = config('app.name', 'Citalent');
        $posisi = $this->pelamar->posisi_dilamar ?: ($this->pelamar->lowongan?->judul ?? 'Posisi Rekrutmen');

        $subject = match ($this->status) {
            'interview_hr' => "Pemberitahuan: Lolos ke Tahap Interview HR ({$posisi}) - {$appName}",
            'interview_user' => "Pemberitahuan: Lolos ke Tahap Interview User ({$posisi}) - {$appName}",
            'interview_gm' => "Pemberitahuan: Lolos ke Tahap Interview GM ({$posisi}) - {$appName}",
            'skill_test' => "Pemberitahuan: Jadwal Tahap Skill Test ({$posisi}) - {$appName}",
            'final_discussion' => "Pemberitahuan: Undangan Final Discussion ({$posisi}) - {$appName}",
            'accepted' => "Selamat! Anda Diterima Bekerja untuk Posisi {$posisi} - {$appName}",
            'rejected' => "Informasi Hasil Seleksi Rekrutmen ({$posisi}) - {$appName}",
            default => "Pembaruan Status Lamaran: {$posisi} - {$appName}",
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
        return new Content(
            view: 'emails.status_lamaran_updated',
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
}
