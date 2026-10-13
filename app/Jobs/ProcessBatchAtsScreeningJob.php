<?php

namespace App\Jobs;

use App\Models\Pelamar;
use App\Services\AtsScreeningService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProcessBatchAtsScreeningJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 1800; // 30 minutes max for full batch
    public int $tries = 1;

    protected string $batchId;
    protected array $pelamarIds;

    /**
     * Create a new job instance.
     */
    public function __construct(string $batchId, array $pelamarIds)
    {
        $this->batchId = $batchId;
        $this->pelamarIds = $pelamarIds;
    }

    /**
     * Execute the job in background queue.
     */
    public function handle(AtsScreeningService $screeningService): void
    {
        $total = count($this->pelamarIds);
        $completed = 0;
        $failed = 0;

        Log::info("ProcessBatchAtsScreeningJob [{$this->batchId}]: Memulai proses batch untuk {$total} pelamar.");

        $chunks = array_chunk($this->pelamarIds, 5);

        foreach ($chunks as $chunkIds) {
            // Check if user requested cancellation for this specific batch
            if (Cache::get("ats_screening_cancel_{$this->batchId}", false)) {
                Log::info("ProcessBatchAtsScreeningJob [{$this->batchId}]: Dibatalkan oleh pengguna.");
                Cache::put('ats_screening_batch_progress', [
                    'batch_id' => null,
                    'total' => $total,
                    'completed' => $completed,
                    'failed' => $failed,
                    'percentage' => 0,
                    'current_candidate' => 'Proses telah dibatalkan',
                    'status' => 'idle',
                    'updated_at' => now()->timestamp,
                ], now()->addMinutes(10));
                return;
            }

            $pelamars = Pelamar::whereIn('id', $chunkIds)
                ->with(['lowongan.departement', 'lowongan.jabatan', 'formulirLamaran'])
                ->get();

            if ($pelamars->isEmpty()) {
                $completed += count($chunkIds);
                continue;
            }

            $firstCandidate = $pelamars->first()?->nama_lengkap ?? 'Kandidat';
            $candidateLabel = count($pelamars) > 1
                ? "{$firstCandidate} & " . (count($pelamars) - 1) . " kandidat lainnya"
                : $firstCandidate;

            $currentPct = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

            // Update state before chunk begins
            Cache::put('ats_screening_batch_progress', [
                'batch_id' => $this->batchId,
                'total' => $total,
                'completed' => $completed,
                'failed' => $failed,
                'percentage' => $currentPct,
                'current_candidate' => $candidateLabel,
                'status' => 'processing',
                'updated_at' => now()->timestamp,
            ], now()->addHours(2));

            try {
                Log::info("ProcessBatchAtsScreeningJob [{$this->batchId}]: Memproses concurrent pool " . count($pelamars) . " kandidat ({$candidateLabel})...");
                $screened = $screeningService->screenBatch($pelamars);
                $completed += count($pelamars);
            } catch (\Throwable $e) {
                Log::error("ProcessBatchAtsScreeningJob error pada concurrent chunk: " . $e->getMessage());
                // Safe fallback to individual screening if batch fails
                foreach ($pelamars as $p) {
                    try {
                        $screeningService->screen($p);
                        $completed++;
                    } catch (\Throwable $ex) {
                        $failed++;
                        $completed++;
                    }
                }
            }

            // Update state after chunk completes
            $newPct = $total > 0 ? (int) round(($completed / $total) * 100) : 100;
            Cache::put('ats_screening_batch_progress', [
                'batch_id' => $this->batchId,
                'total' => $total,
                'completed' => $completed,
                'failed' => $failed,
                'percentage' => $newPct,
                'current_candidate' => $candidateLabel,
                'status' => $completed >= $total ? 'completed' : 'processing',
                'updated_at' => now()->timestamp,
            ], now()->addHours(2));
        }

        // Final completion state
        Cache::put('ats_screening_batch_progress', [
            'batch_id' => $this->batchId,
            'total' => $total,
            'completed' => $completed,
            'failed' => $failed,
            'percentage' => 100,
            'current_candidate' => 'Semua kandidat selesai diproses',
            'status' => 'completed',
            'updated_at' => now()->timestamp,
        ], now()->addMinutes(15));

        Log::info("ProcessBatchAtsScreeningJob [{$this->batchId}]: Selesai! Berhasil: {$completed}, Gagal: {$failed}.");
    }
}
