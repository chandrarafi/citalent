<?php

namespace App\Services;

use App\Models\HelpdeskTicket;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TelegramNotificationService
{
    /**
     * Check whether Telegram Helpdesk notifications are enabled and configured.
     */
    public function isConfigured(): bool
    {
        return (bool) config('services.telegram.enabled', true)
            && !empty(config('services.telegram.bot_token'))
            && !empty(config('services.telegram.chat_id'));
    }

    /**
     * Format HTML message body for an incoming helpdesk ticket.
     */
    public function formatIncomingTicketMessage(HelpdeskTicket $ticket): string
    {
        $ticket->loadMissing('user:id,name,email,phone');

        $isGuest = $ticket->user_id === null;
        $reporterName = $ticket->user?->name ?? $ticket->reporter_name ?? 'Pelapor';
        $reporterEmail = $ticket->user?->email ?? $ticket->reporter_email ?? '-';
        $reporterPhone = $ticket->user?->phone ?? $ticket->reporter_phone;
        $sourceLabel = $isGuest ? 'Halaman Login (Tamu)' : 'Portal Kandidat';

        $lines = [
            '<b>Tiket Helpdesk Baru Masuk</b>',
            '',
            '<b>Kode Tiket:</b> <code>' . $this->escapeHtml($ticket->kode_tiket) . '</code>',
            '<b>Sumber:</b> ' . $this->escapeHtml($sourceLabel),
            '<b>Kategori:</b> ' . $this->escapeHtml($ticket->kategori),
            '<b>Pelapor:</b> ' . $this->escapeHtml($reporterName),
            '<b>Email:</b> ' . $this->escapeHtml($reporterEmail),
        ];

        if (!empty($reporterPhone)) {
            $lines[] = '<b>No. HP / WA:</b> ' . $this->escapeHtml($reporterPhone);
        }

        if (!empty($ticket->halaman_url)) {
            $lines[] = '<b>Halaman:</b> <code>' . $this->escapeHtml($ticket->halaman_url) . '</code>';
        }

        $lines[] = '';
        $lines[] = '<b>Judul:</b> ' . $this->escapeHtml($ticket->judul);
        $lines[] = '<b>Deskripsi:</b>';
        $lines[] = $this->escapeHtml(Str::limit($ticket->deskripsi, 1200));

        $adminUrl = rtrim((string) config('app.url', ''), '/') . '/helpdesk';
        if ($adminUrl !== '/helpdesk') {
            $lines[] = '';
            $lines[] = '<b>Panel Admin:</b> ' . $this->escapeHtml($adminUrl);
        }

        return implode("\n", $lines);
    }

    /**
     * Send an incoming helpdesk ticket alert (and screenshot if attached) to Telegram.
     */
    public function sendHelpdeskTicketAlert(HelpdeskTicket $ticket): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        $textSent = $this->sendMessage($this->formatIncomingTicketMessage($ticket));

        if (
            $textSent
            && !empty($ticket->screenshot_path)
            && Storage::disk('public')->exists($ticket->screenshot_path)
        ) {
            $this->sendPhoto(
                Storage::disk('public')->path($ticket->screenshot_path),
                'Lampiran Screenshot • ' . $ticket->kode_tiket,
            );
        }

        return $textSent;
    }

    /**
     * Send a plain/HTML message via Telegram Bot API.
     */
    public function sendMessage(string $htmlMessage): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        $botToken = (string) config('services.telegram.bot_token');
        $chatId = (string) config('services.telegram.chat_id');
        $threadId = config('services.telegram.thread_id');
        $timeout = max(2, (int) config('services.telegram.timeout', 8));
        $verifySsl = (bool) config('services.telegram.verify_ssl', true);

        $payload = [
            'chat_id' => $chatId,
            'text' => $htmlMessage,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ];

        if (!empty($threadId)) {
            $payload['message_thread_id'] = (int) $threadId;
        }

        try {
            $response = Http::connectTimeout(3)
                ->timeout($timeout)
                ->withOptions(['verify' => $verifySsl])
                ->post("https://api.telegram.org/bot{$botToken}/sendMessage", $payload);

            if (!$response->successful() || !($response->json('ok') === true)) {
                Log::warning('Telegram Helpdesk notification failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('Telegram Helpdesk notification exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Attach a screenshot image cleanly after the main alert message.
     */
    public function sendPhoto(string $absolutePath, string $caption = ''): bool
    {
        if (!$this->isConfigured() || !is_readable($absolutePath)) {
            return false;
        }

        $botToken = (string) config('services.telegram.bot_token');
        $chatId = (string) config('services.telegram.chat_id');
        $threadId = config('services.telegram.thread_id');
        $timeout = max(4, (int) config('services.telegram.timeout', 8));
        $verifySsl = (bool) config('services.telegram.verify_ssl', true);

        try {
            $handle = fopen($absolutePath, 'rb');
            if (!$handle) {
                return false;
            }

            $fields = [
                'chat_id' => $chatId,
                'caption' => Str::limit($caption, 1000),
            ];

            if (!empty($threadId)) {
                $fields['message_thread_id'] = (int) $threadId;
            }

            $response = Http::connectTimeout(3)
                ->timeout($timeout)
                ->withOptions(['verify' => $verifySsl])
                ->attach('photo', $handle, basename($absolutePath))
                ->post("https://api.telegram.org/bot{$botToken}/sendPhoto", $fields);

            if (is_resource($handle)) {
                fclose($handle);
            }

            if (!$response->successful() || !($response->json('ok') === true)) {
                Log::warning('Telegram Helpdesk photo upload failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('Telegram Helpdesk photo upload exception: ' . $e->getMessage());
            return false;
        }
    }

    private function escapeHtml(?string $value): string
    {
        return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
