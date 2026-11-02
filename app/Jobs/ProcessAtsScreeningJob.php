<?php

namespace App\Jobs;

use App\Models\Pelamar;
use App\Services\AtsScreeningService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAtsScreeningJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 180;
    public int $tries = 2;

    protected int $pelamarId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $pelamarId)
    {
        $this->pelamarId = $pelamarId;
    }

    /**
     * Execute the job.
     */
    public function handle(AtsScreeningService $screeningService): void
    {
        $pelamar = Pelamar::with(['lowongan.departement', 'lowongan.jabatan', 'formulirLamaran'])
            ->find($this->pelamarId);

        if (!$pelamar) {
            Log::warning("ProcessAtsScreeningJob: Pelamar ID {$this->pelamarId} tidak ditemukan.");
            return;
        }

        try {
            Log::info("ProcessAtsScreeningJob: Memulai screening AI untuk Pelamar ID {$pelamar->id} ({$pelamar->nama_lengkap})...");
            $screening = $screeningService->screen($pelamar);
            Log::info("ProcessAtsScreeningJob: Selesai screening Pelamar ID {$pelamar->id}. Skor: {$screening->total_skor} - {$screening->rekomendasi}");
        } catch (\Throwable $e) {
            Log::error("ProcessAtsScreeningJob Error untuk Pelamar ID {$this->pelamarId}: " . $e->getMessage());
            throw $e;
        }
    }
}
