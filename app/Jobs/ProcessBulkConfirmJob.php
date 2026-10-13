<?php

namespace App\Jobs;

use App\Mail\StatusLamaranUpdatedMail;
use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use App\Services\AtsScreeningService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessBulkConfirmJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries = 2;

    public function __construct(
        public array $pelamarIds,
        public string $keputusan, // 'approve' | 'reject'
        public ?string $catatanHr,
        public ?string $tahapBerikutnya,
        public bool $buatJadwalInterview,
        public array $jadwalData,
        public ?int $userId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AtsScreeningService $screeningService): void
    {
        $pelamars = Pelamar::with(['lowongan.departement', 'lowongan.jabatan', 'atsScreening'])
            ->whereIn('id', $this->pelamarIds)
            ->get();

        $isApprove = ($this->keputusan === 'approve');
        $nextStage = $this->tahapBerikutnya ?? 'lengkapi_formulir';
        $sendEmail = $this->jadwalData['kirim_undangan_email'] ?? true;

        foreach ($pelamars as $pelamar) {
            try {
                $screening = $pelamar->atsScreening;
                if (!$screening) {
                    $screening = $screeningService->screen($pelamar);
                }

                if ($isApprove) {
                    $screening->update([
                        'status_konfirmasi' => 'disetujui',
                        'catatan_hr' => $this->catatanHr ?? 'Disetujui oleh HR.',
                        'confirmed_by' => $this->userId,
                        'confirmed_at' => now(),
                    ]);

                    $pelamar->update([
                        'status' => $nextStage,
                        'tahap_gagal' => null,
                        'catatan' => $this->catatanHr ?? "Lolos ATS Screening (Skor: {$screening->total_skor}/100).",
                    ]);

                    $createdSchedule = null;
                    if ($this->buatJadwalInterview && !empty($this->jadwalData['tanggal_interview'])) {
                        $interviewTahap = in_array($nextStage, ['interview_hr', 'interview_user', 'interview_gm'])
                            ? $nextStage
                            : 'interview_hr';

                        $createdSchedule = PenjadwalanInterview::create([
                            'pelamar_id' => $pelamar->id,
                            'lowongan_id' => $pelamar->lowongan_id,
                            'tahap' => $interviewTahap,
                            'tanggal_interview' => $this->jadwalData['tanggal_interview'],
                            'jam_mulai' => $this->jadwalData['jam_mulai'],
                            'jam_selesai' => $this->jadwalData['jam_selesai'] ?? null,
                            'tipe_interview' => $this->jadwalData['tipe_interview'] ?? 'offline',
                            'lokasi' => ($this->jadwalData['tipe_interview'] ?? '') === 'offline' ? ($this->jadwalData['lokasi'] ?? null) : null,
                            'link_meeting' => ($this->jadwalData['tipe_interview'] ?? '') === 'online' ? ($this->jadwalData['link_meeting'] ?? null) : null,
                            'pewawancara_nama' => $this->jadwalData['pewawancara_nama'] ?? null,
                            'catatan_untuk_kandidat' => $this->jadwalData['catatan_interview'] ?? null,
                            'status_kehadiran' => 'scheduled',
                            'created_by' => $this->userId,
                        ]);
                    }

                    // Send email notification with schedule details inside lamaran_lulus
                    if (!empty($pelamar->email) && $sendEmail) {
                        try {
                            Mail::to($pelamar->email)->send(
                                new StatusLamaranUpdatedMail(
                                    $pelamar,
                                    $nextStage,
                                    $this->catatanHr,
                                    null,
                                    $createdSchedule
                                )
                            );
                            if ($createdSchedule) {
                                $createdSchedule->reminder_sent_at = now();
                                $createdSchedule->save();
                            }
                        } catch (\Throwable $e) {
                            Log::error("Gagal kirim email konfirmasi lolos pelamar ID {$pelamar->id}: " . $e->getMessage());
                        }
                    }
                } else {
                    $screening->update([
                        'status_konfirmasi' => 'ditolak',
                        'catatan_hr' => $this->catatanHr ?? 'Ditolak pada seleksi berkas/CV.',
                        'confirmed_by' => $this->userId,
                        'confirmed_at' => now(),
                    ]);

                    $pelamar->update([
                        'status' => 'rejected',
                        'tahap_gagal' => 'screening_cv',
                        'catatan' => $this->catatanHr ?? "Tidak lolos seleksi berkas/screening CV (Skor ATS: {$screening->total_skor}/100).",
                    ]);

                    if (!empty($pelamar->email)) {
                        try {
                            Mail::to($pelamar->email)->send(
                                new StatusLamaranUpdatedMail(
                                    $pelamar,
                                    'rejected',
                                    $this->catatanHr ?? 'Terima kasih atas partisipasi Anda. Saat ini kualifikasi Anda belum sesuai dengan kebutuhan posisi ini.'
                                )
                            );
                        } catch (\Throwable $e) {
                            Log::error("Gagal kirim email tolak pelamar ID {$pelamar->id}: " . $e->getMessage());
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::error("Error saat memproses konfirmasi pelamar ID {$pelamar->id}: " . $e->getMessage());
            }
        }
    }
}
