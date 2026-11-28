<?php

use App\Services\TelegramNotificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('helpdesk:test-telegram', function (TelegramNotificationService $telegram) {
    if (!$telegram->isConfigured()) {
        $this->error('Konfigurasi Telegram belum lengkap. Isi TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID di .env terlebih dahulu.');
        return 1;
    }

    $ok = $telegram->sendMessage("<b>Tes Notifikasi Helpdesk Citalent</b>\nBot Telegram berhasil terhubung dan siap menerima notifikasi tiket masuk.");

    if ($ok) {
        $this->info('Pesan tes berhasil dikirim ke Telegram!');
        return 0;
    }

    $this->error('Gagal mengirim pesan tes ke Telegram. Periksa TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, atau log Laravel.');
    return 1;
})->purpose('Kirim pesan tes ke Telegram Bot untuk notifikasi tiket Helpdesk');
