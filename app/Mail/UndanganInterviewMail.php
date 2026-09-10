<?php

namespace App\Mail;

use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UndanganInterviewMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Pelamar $pelamar,
        public PenjadwalanInterview $schedule,
        public bool $isReminder = false
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $appName = config('app.name', 'Citalent Astra Motor');
        $posisi = $this->pelamar->posisi_dilamar ?: ($this->pelamar->lowongan?->judul ?? 'Posisi Rekrutmen');
        $tahapLabel = $this->schedule->tahap_label;

        $prefix = $this->isReminder ? 'REMINDER JADWAL' : 'UNDANGAN RESMI';
        $subject = "[{$prefix}] {$tahapLabel} - Posisi {$posisi} ({$this->pelamar->nama_lengkap})";

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
            view: 'emails.undangan_interview',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
