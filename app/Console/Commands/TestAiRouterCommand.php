<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestAiRouterCommand extends Command
{
    protected $signature = 'ai:test {--model= : Specific model to test with}';

    protected $description = 'Test connection to AI Router (vendorarouter.web.id) and verify API Key & models';

    public function handle(): int
    {
        $baseUrl = rtrim(config('services.ai_router.base_url', 'https://vendorarouter.web.id/api/v1'), '/');
        $apiKey = config('services.ai_router.api_key');
        $specifiedModel = $this->option('model') ?: config('services.ai_router.model');

        $this->info("=== Uji Koneksi AI Router (vendorarouter / 9Router) ===");
        $this->line("Base URL : <comment>{$baseUrl}</comment>");
        $this->line("API Key  : " . ($apiKey ? '<info>[Terpasang: ' . substr($apiKey, 0, 8) . '...]</info>' : '<error>[Belum diisi di .env (AI_ROUTER_API_KEY)]</error>'));

        if (empty($apiKey)) {
            $this->newLine();
            $this->warn("Silakan masukkan API Key Anda ke dalam file .env:");
            $this->line("AI_ROUTER_API_KEY=your_api_key_here");
            $this->newLine();
            return self::FAILURE;
        }

        // 1. Test GET /models
        $this->newLine();
        $this->info("1. Mengambil daftar model dari {$baseUrl}/models...");
        try {
            $client = Http::withToken($apiKey)->timeout(15);
            if (!config('services.ai_router.verify_ssl', false)) {
                $client = $client->withoutVerifying();
            }

            $modelsResponse = $client->get("{$baseUrl}/models");

            if (!$modelsResponse->successful()) {
                $this->error("Gagal terhubung ke endpoint models (Status: {$modelsResponse->status()}):");
                $this->line($modelsResponse->body());
                return self::FAILURE;
            }

            $modelsData = $modelsResponse->json('data') ?? [];
            if (empty($modelsData)) {
                $this->warn("Berhasil terhubung, namun daftar model kosong.");
            } else {
                $this->info("Berhasil! Ditemukan " . count($modelsData) . " model di 9Router:");
                $headers = ['No', 'ID Model', 'Owned By'];
                $rows = [];
                foreach (array_slice($modelsData, 0, 15) as $idx => $m) {
                    $rows[] = [
                        $idx + 1,
                        $m['id'] ?? '-',
                        $m['owned_by'] ?? ($m['root'] ?? '-'),
                    ];
                }
                $this->table($headers, $rows);

                if (count($modelsData) > 15) {
                    $this->comment("... dan " . (count($modelsData) - 15) . " model lainnya.");
                }
            }

            // Pick model to test
            $activeModel = $specifiedModel;
            if (!$activeModel && !empty($modelsData)) {
                $activeModel = $modelsData[0]['id'] ?? 'default';
            } elseif (!$activeModel) {
                $activeModel = 'default';
            }

            // 2. Test Chat Completion
            $this->newLine();
            $this->info("2. Menguji Chat Completion dengan model: <comment>{$activeModel}</comment>...");

            $start = microtime(true);
            $chatClient = Http::withToken($apiKey)->timeout(30);
            if (!config('services.ai_router.verify_ssl', false)) {
                $chatClient = $chatClient->withoutVerifying();
            }

            $chatResponse = $chatClient->post("{$baseUrl}/chat/completions", [
                    'model' => $activeModel,
                    'messages' => [
                        ['role' => 'system', 'content' => 'Kamu adalah asisten HR AI.'],
                        ['role' => 'user', 'content' => 'Balas singkat: Halo, koneksi AI ATS Citalent HR berhasil.'],
                    ],
                    'max_tokens' => 50,
                ]);

            $elapsed = round(microtime(true) - $start, 2);

            if ($chatResponse->successful()) {
                $reply = $chatResponse->json('choices.0.message.content');
                $actualModel = $chatResponse->json('model') ?? $activeModel;

                $this->info("Sukses! Respon diterima dalam {$elapsed}s:");
                $this->line("<comment>{$reply}</comment>");
                $this->line("Model yang merespon: <info>{$actualModel}</info>");
                $this->newLine();
                $this->info("=== SEMUA KONEKSI AI BERFUNGSI SEMPURNA ===");
                return self::SUCCESS;
            } else {
                $this->error("Chat completion gagal (Status: {$chatResponse->status()}):");
                $this->line($chatResponse->body());
                return self::FAILURE;
            }
        } catch (\Throwable $e) {
            $this->error("Terjadi error koneksi: " . $e->getMessage());
            return self::FAILURE;
        }
    }
}
