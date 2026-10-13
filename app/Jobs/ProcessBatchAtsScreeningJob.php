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

    public int $timeout = 180; // 3 menit per chunk (sangat aman karena 5 kandidat hanya butuh ~20 detik)
    public int $tries = 2;
    public int $maxExceptions = 2;
    public int $backoff = 3;

    protected string $batchId;
    protected array $pelamarIds;
    protected int $totalBatchCount;

    /**
     * Create a new job instance for a chunk of candidates.
     */
    public function __construct(string $batchId, array $pelamarIds, int $totalBatchCount = 0)
    {
        $this->batchId = $batchId;
        $this->pelamarIds = $pelamarIds;
        $this->totalBatchCount = $totalBatchCount ?: count($pelamarIds);
    }

    /**
     * Execute the job in background queue.
     */
    public function handle(AtsScreeningService $screeningService): void
    {
        // 1. Check if user requested cancellation
        if (Cache::get("ats_screening_cancel_{$this->batchId}", false) || Cache::get('ats_screening_cancel_requested', false)) {
            Log::info("ProcessBatchAtsScreeningJob [{$this->batchId}]: Skip chunk (" . count($this->pelamarIds) . " kandidat) karena telah dibatalkan.");
            return;
        }

        $pelamars = Pelamar::whereIn('id', $this->pelamarIds)
            ->with(['lowongan.departement', 'lowongan.jabatan', 'formulirLamaran'])
            ->get();

        if ($pelamars->isEmpty()) {
            $this->updateProgress(count($this->pelamarIds), 0, 'Selesai');
            return;
        }

        $firstCandidate = $pelamars->first()?->nama_lengkap ?? 'Kandidat';
        $candidateLabel = count($pelamars) > 1
            ? "{$firstCandidate} & " . (count($pelamars) - 1) . " kandidat lainnya"
            : $firstCandidate;

        $chunkFailed = 0;

        try {
            Log::info("ProcessBatchAtsScreeningJob [{$this->batchId}]: Memproses pool " . count($pelamars) . " kandidat ({$candidateLabel})...");
            $screeningService->screenBatch($pelamars);
        } catch (\Throwable $e) {
            Log::error("ProcessBatchAtsScreeningJob error batch pool: " . $e->getMessage() . " - Fallback single");
            foreach ($pelamars as $p) {
                try {
                    $screeningService->screen($p);
                } catch (\Throwable $ex) {
                    $chunkFailed++;
                }
            }
        }

        $chunkSuccess = count($pelamars) - $chunkFailed;
        $this->updateProgress($chunkSuccess, $chunkFailed, $candidateLabel);
    }

    /**
     * Atomically update batch progress in Cache.
     */
    protected function updateProgress(int $successCount, int $failedCount, string $label): void
    {
        try {
            Cache::lock("ats_progress_lock_{$this->batchId}", 5)->block(3, function () use ($successCount, $failedCount, $label) {
                $progress = Cache::get('ats_screening_batch_progress', [
                    'batch_id' => $this->batchId,
                    'total' => $this->totalBatchCount,
                    'completed' => 0,
                    'failed' => 0,
                    'percentage' => 0,
                    'current_candidate' => null,
                    'status' => 'processing',
                ]);

                $total = $this->totalBatchCount ?: ($progress['total'] ?? 1);
                $newCompleted = min($total, ($progress['completed'] ?? 0) + $successCount + $failedCount);
                $newFailed = ($progress['failed'] ?? 0) + $failedCount;
                $newPercentage = $total > 0 ? (int) round(($newCompleted / $total) * 100) : 100;
                $isDone = ($newCompleted >= $total);

                Cache::put('ats_screening_batch_progress', [
                    'batch_id' => $this->batchId,
                    'total' => $total,
                    'completed' => $newCompleted,
                    'failed' => $newFailed,
                    'percentage' => $newPercentage,
                    'current_candidate' => $isDone ? 'Semua kandidat selesai diproses' : $label,
                    'status' => $isDone ? 'completed' : 'processing',
                    'updated_at' => now()->timestamp,
                ], now()->addHours(2));

                Log::info("ProcessBatchAtsScreeningJob [{$this->batchId}]: Progress {$newCompleted}/{$total} ({$newPercentage}%).");
            });
        } catch (\Throwable $e) {
            Log::warning("Gagal update lock progress: " . $e->getMessage());
        }
    }

    /**
     * Handle job failure gracefully if this individual chunk fails permanently.
     */
    public function failed(?\Throwable $exception): void
    {
        Log::error("ProcessBatchAtsScreeningJob [{$this->batchId}] chunk gagal: " . $exception?->getMessage());
        $this->updateProgress(0, count($this->pelamarIds), 'Gagal memproses sebagian kandidat');
    }
}
