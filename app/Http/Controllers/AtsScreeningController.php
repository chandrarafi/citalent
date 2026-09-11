<?php

namespace App\Http\Controllers;

use App\Mail\StatusLamaranUpdatedMail;
use App\Models\AtsScreening;
use App\Models\KriteriaAts;
use App\Models\Lowongan;
use App\Models\Pelamar;
use App\Services\AtsScreeningService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AtsScreeningController extends Controller
{
    protected AtsScreeningService $screeningService;

    public function __construct(AtsScreeningService $screeningService)
    {
        $this->screeningService = $screeningService;
    }

    /**
     * Display ATS Screening list and review confirmation dashboard.
     */
    public function index(Request $request): Response
    {
        ini_set('memory_limit', '512M');

        $lowongans = Lowongan::where('status', 'aktif')
            ->orderBy('id', 'desc')
            ->get(['id', 'kode_lowongan', 'judul']);

        $query = AtsScreening::with([
            'pelamar.lowongan.departement',
            'pelamar.lowongan.jabatan',
            'confirmedBy',
        ])
        ->whereHas('lowongan', fn ($q) => $q->where('status', 'aktif'))
        ->orderByDesc('total_skor');

        if ($request->filled('lowongan_id') && $request->lowongan_id !== 'all') {
            $query->where('lowongan_id', $request->lowongan_id);
        }

        if ($request->filled('divisi') && $request->divisi !== 'all') {
            $query->where('divisi', $request->divisi);
        }

        if ($request->filled('rekomendasi') && $request->rekomendasi !== 'all') {
            $query->where('rekomendasi', $request->rekomendasi);
        }

        if ($request->filled('status_konfirmasi') && $request->status_konfirmasi !== 'all') {
            $query->where('status_konfirmasi', $request->status_konfirmasi);
        }

        $screenings = $query->get()->map(function (AtsScreening $s) {
            $p = $s->pelamar;
            return [
                'id' => $s->id,
                'pelamar_id' => $s->pelamar_id,
                'lowongan_id' => $s->lowongan_id,
                'divisi' => $s->divisi,
                'total_skor' => (float) $s->total_skor,
                'rekomendasi' => $s->rekomendasi,
                'rekomendasi_label' => $s->rekomendasi_label,
                'rekomendasi_tone' => $s->rekomendasi_tone,
                'status_konfirmasi' => $s->status_konfirmasi,
                'status_konfirmasi_label' => $s->status_konfirmasi_label,
                'status_konfirmasi_tone' => $s->status_konfirmasi_tone,
                'kriteria_penilaian' => $s->kriteria_penilaian ?? [],
                'cv_parsed_data' => $s->cv_parsed_data ?? [],
                'catatan_ats' => $s->catatan_ats,
                'catatan_hr' => $s->catatan_hr,
                'confirmed_by_name' => $s->confirmedBy?->name,
                'confirmed_at' => $s->confirmed_at ? $s->confirmed_at->isoFormat('D MMM Y, HH:mm') : null,
                'pelamar' => $p ? [
                    'id' => $p->id,
                    'no_pendaftaran' => $p->no_pendaftaran,
                    'nama_lengkap' => $p->nama_lengkap,
                    'email' => $p->email,
                    'nomor_kontak' => $p->nomor_kontak,
                    'pendidikan_terakhir' => $p->pendidikan_terakhir,
                    'nama_institusi' => $p->nama_institusi,
                    'jurusan' => $p->jurusan,
                    'tahun_lulus' => $p->tahun_lulus,
                    'posisi_dilamar' => $p->posisi_dilamar,
                    'status' => $p->status,
                    'foto_url' => $p->foto_url,
                    'cv_url' => $p->cv_url,
                    'created_at' => $p->created_at ? $p->created_at->format('Y-m-d H:i') : null,
                    'lowongan' => $p->lowongan ? [
                        'id' => $p->lowongan->id,
                        'kode_lowongan' => $p->lowongan->kode_lowongan,
                        'judul' => $p->lowongan->judul,
                        'departemen_nama' => $p->lowongan->departement?->deskripsi,
                        'posisi_nama' => $p->lowongan->jabatan?->nama_jabatan,
                        'kd_jabatan' => $p->lowongan->jabatan?->kd_jabatan,
                    ] : null,
                ] : null,
            ];
        });

        // KPI Counts via efficient database aggregations
        $unscreenedCount = Pelamar::whereDoesntHave('atsScreening')
            ->whereHas('lowongan', fn ($q) => $q->where('status', 'aktif'))
            ->count();

        $stats = [
            'total_screened' => AtsScreening::count(),
            'pending_confirmation' => AtsScreening::where('status_konfirmasi', 'menunggu_konfirmasi')->count(),
            'top_candidates' => AtsScreening::where('rekomendasi', 'sangat_disarankan')->count(),
            'approved' => AtsScreening::where('status_konfirmasi', 'disetujui')->count(),
            'rejected' => AtsScreening::where('status_konfirmasi', 'ditolak')->count(),
            'unscreened' => $unscreenedCount,
        ];

        $kriteriaTemplates = KriteriaAts::whereNull('lowongan_id')
            ->orderBy('urutan')
            ->get();

        $kriteriaLowongans = KriteriaAts::whereNotNull('lowongan_id')
            ->orderBy('urutan')
            ->get();

        return Inertia::render('screening-cv/Index', [
            'screenings' => $screenings,
            'lowongans' => $lowongans,
            'stats' => $stats,
            'selectedLowonganId' => $request->lowongan_id ?? 'all',
            'kriteriaTemplates' => $kriteriaTemplates,
            'kriteriaLowongans' => $kriteriaLowongans,
        ]);
    }

    /**
     * Run batch auto-screening for unscreened or filtered candidates.
     */
    public function runBatch(Request $request): RedirectResponse
    {
        ini_set('memory_limit', '512M');
        set_time_limit(300);
        $query = Pelamar::with(['lowongan.departement', 'lowongan.jabatan', 'formulirLamaran'])
            ->whereHas('lowongan', fn ($q) => $q->where('status', 'aktif'));

        if ($request->filled('lowongan_id') && $request->lowongan_id !== 'all') {
            $query->where('lowongan_id', $request->lowongan_id);
        }

        // If force_rescreen is false, only screen unscreened ones
        if (!$request->boolean('force_rescreen')) {
            $query->whereDoesntHave('atsScreening');
        }

        $pelamars = $query->get();
        $processed = 0;

        foreach ($pelamars as $p) {
            try {
                $this->screeningService->screen($p);
                $processed++;
            } catch (\Throwable $e) {
                Log::error("Gagal auto-screening pelamar ID {$p->id}: " . $e->getMessage());
            }
        }

        return back()->with('success', "Auto-Screening ATS selesai. Sebanyak {$processed} kandidat berhasil dinilai dan siap ditinjau oleh HR.");
    }

    /**
     * Run single auto-screening for one candidate.
     */
    public function runSingle(Pelamar $pelamar): RedirectResponse
    {
        $screening = $this->screeningService->screen($pelamar);

        return back()->with('success', "Screening CV otomatis ATS berhasil untuk '{$pelamar->nama_lengkap}' (Skor: {$screening->total_skor}/100 - {$screening->rekomendasi_label}). Silakan lakukan konfirmasi hasil.");
    }

    /**
     * Confirm screening result by HR (Approve or Reject).
     */
    public function confirm(Request $request, Pelamar $pelamar): RedirectResponse
    {
        $validated = $request->validate([
            'keputusan' => ['required', 'in:approve,reject'],
            'catatan_hr' => ['nullable', 'string', 'max:1000'],
            'tahap_berikutnya' => ['nullable', 'string', 'in:lengkapi_formulir,skill_test,interview_hr,interview_user'],
        ]);

        $screening = AtsScreening::where('pelamar_id', $pelamar->id)->first();
        if (!$screening) {
            $screening = $this->screeningService->screen($pelamar);
        }

        $userId = Auth::id();
        $isApprove = $validated['keputusan'] === 'approve';

        if ($isApprove) {
            // Determine next stage
            $kdJabatan = $pelamar->lowongan?->jabatan?->kd_jabatan ?: '';
            $skillTestJabatanCodes = ['JBT-5', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31', 'JBT-26'];
            $hasSkillTest = in_array($kdJabatan, $skillTestJabatanCodes);

            $nextStage = $validated['tahap_berikutnya'] ?? 'lengkapi_formulir';

            $screening->update([
                'status_konfirmasi' => 'disetujui',
                'catatan_hr' => $validated['catatan_hr'] ?? 'Disetujui oleh HR untuk melanjutkan ke tahapan berikutnya.',
                'confirmed_by' => $userId,
                'confirmed_at' => now(),
            ]);

            $pelamar->update([
                'status' => $nextStage,
                'tahap_gagal' => null,
                'catatan' => $validated['catatan_hr'] ?? "Lolos ATS Screening (Skor: {$screening->total_skor}/100). Dikonfirmasi lanjut ke tahap " . strtoupper(str_replace('_', ' ', $nextStage)),
            ]);

            $stageLabel = match ($nextStage) {
                'lengkapi_formulir' => 'Lengkapi Formulir Lamaran Kerja',
                'skill_test' => 'Skill Test',
                'interview_hr' => 'Interview HR',
                default => strtoupper(str_replace('_', ' ', $nextStage)),
            };

            // Queue notification email
            if (!empty($pelamar->email)) {
                try {
                    Mail::to($pelamar->email)->queue(
                        new StatusLamaranUpdatedMail(
                            $pelamar->fresh(['lowongan.departement', 'lowongan.jabatan']),
                            $nextStage,
                            $validated['catatan_hr'] ?? null
                        )
                    );
                } catch (\Throwable $e) {
                    Log::error("Gagal queue email konfirmasi screening pelamar ID {$pelamar->id}: " . $e->getMessage());
                }
            }

            return back()->with('success', "Konfirmasi berhasil! '{$pelamar->nama_lengkap}' LOLOS screening ATS dan melaju ke tahap '{$stageLabel}'.");
        } else {
            $screening->update([
                'status_konfirmasi' => 'ditolak',
                'catatan_hr' => $validated['catatan_hr'] ?? 'Kandidat belum memenuhi kualifikasi minimum yang dibutuhkan.',
                'confirmed_by' => $userId,
                'confirmed_at' => now(),
            ]);

            $pelamar->update([
                'status' => 'rejected',
                'tahap_gagal' => 'screening_cv',
                'catatan' => $validated['catatan_hr'] ?? "Tidak lolos seleksi berkas/screening CV (Skor ATS: {$screening->total_skor}/100).",
            ]);

            if (!empty($pelamar->email)) {
                try {
                    Mail::to($pelamar->email)->queue(
                        new StatusLamaranUpdatedMail(
                            $pelamar->fresh(['lowongan.departement', 'lowongan.jabatan']),
                            'rejected',
                            $validated['catatan_hr'] ?? 'Terima kasih atas partisipasi Anda. Saat ini kualifikasi Anda belum sesuai dengan kebutuhan posisi ini.'
                        )
                    );
                } catch (\Throwable $e) {
                    Log::error("Gagal queue email tolak screening pelamar ID {$pelamar->id}: " . $e->getMessage());
                }
            }

            return back()->with('success', "Konfirmasi berhasil: Status '{$pelamar->nama_lengkap}' telah DITOLAK pada tahapan Screening CV.");
        }
    }

    /**
     * Bulk confirm multiple candidates at once.
     */
    public function bulkConfirm(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pelamar_ids' => ['required', 'array', 'min:1'],
            'pelamar_ids.*' => ['required', 'exists:rekrutmen.pelamars,id'],
            'keputusan' => ['required', 'in:approve,reject'],
            'catatan_hr' => ['nullable', 'string', 'max:1000'],
            'tahap_berikutnya' => ['nullable', 'string', 'in:lengkapi_formulir,skill_test,interview_hr,interview_user'],
        ]);

        $userId = Auth::id();
        $isApprove = $validated['keputusan'] === 'approve';
        $nextStage = $validated['tahap_berikutnya'] ?? 'lengkapi_formulir';
        $count = 0;

        $pelamars = Pelamar::with(['lowongan.departement', 'lowongan.jabatan', 'atsScreening'])
            ->whereIn('id', $validated['pelamar_ids'])
            ->get();

        foreach ($pelamars as $pelamar) {
            $screening = $pelamar->atsScreening;
            if (!$screening) {
                $screening = $this->screeningService->screen($pelamar);
            }

            if ($isApprove) {
                $screening->update([
                    'status_konfirmasi' => 'disetujui',
                    'catatan_hr' => $validated['catatan_hr'] ?? 'Disetujui secara massal oleh HR.',
                    'confirmed_by' => $userId,
                    'confirmed_at' => now(),
                ]);

                $pelamar->update([
                    'status' => $nextStage,
                    'tahap_gagal' => null,
                    'catatan' => $validated['catatan_hr'] ?? "Lolos ATS Screening (Skor: {$screening->total_skor}/100).",
                ]);
            } else {
                $screening->update([
                    'status_konfirmasi' => 'ditolak',
                    'catatan_hr' => $validated['catatan_hr'] ?? 'Ditolak pada tahapan screening berkas.',
                    'confirmed_by' => $userId,
                    'confirmed_at' => now(),
                ]);

                $pelamar->update([
                    'status' => 'rejected',
                    'tahap_gagal' => 'screening_cv',
                    'catatan' => $validated['catatan_hr'] ?? "Tidak lolos seleksi berkas/screening CV.",
                ]);
            }

            if (!empty($pelamar->email)) {
                try {
                    Mail::to($pelamar->email)->queue(
                        new StatusLamaranUpdatedMail(
                            $pelamar,
                            $isApprove ? $nextStage : 'rejected',
                            $validated['catatan_hr'] ?? null
                        )
                    );
                } catch (\Throwable $e) {
                    Log::error("Gagal queue email bulk confirm screening pelamar ID {$pelamar->id}: " . $e->getMessage());
                }
            }

            $count++;
        }

        $actionLabel = $isApprove ? 'DILOLOSKAN' : 'DITOLAK';
        return back()->with('success', "Sebanyak {$count} kandidat berhasil dikonfirmasi ({$actionLabel}) oleh HR.");
    }

    /**
     * Save / update a criteria item.
     */
    public function saveKriteria(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['nullable', 'exists:rekrutmen.kriteria_ats,id'],
            'lowongan_id' => ['nullable', 'exists:rekrutmen.lowongans,id'],
            'divisi' => ['required', 'string'],
            'kategori' => ['required', 'string'],
            'nama_kriteria' => ['required', 'string', 'max:255'],
            'kebutuhan' => ['required', 'string', 'max:255'],
            'tipe_penilaian' => ['required', 'in:pendidikan,pengalaman,keyword,sertifikasi'],
            'keywords' => ['nullable'],
            'bobot' => ['required', 'integer', 'min:1', 'max:100'],
            'is_wajib' => ['nullable', 'boolean'],
            'active' => ['nullable', 'boolean'],
        ]);

        if (is_string($validated['keywords'] ?? null)) {
            $validated['keywords'] = array_values(array_filter(array_map('trim', explode(',', $validated['keywords']))));
        }

        if (!empty($validated['id'])) {
            $crit = KriteriaAts::findOrFail($validated['id']);
            $crit->update($validated);
        } else {
            $crit = KriteriaAts::create($validated);
        }

        return back()->with('success', "Kriteria ATS '{$crit->nama_kriteria}' berhasil disimpan.");
    }

    /**
     * Delete a criteria item.
     */
    public function deleteKriteria(KriteriaAts $kriteria): RedirectResponse
    {
        $name = $kriteria->nama_kriteria;
        $kriteria->delete();

        return back()->with('success', "Kriteria ATS '{$name}' berhasil dihapus.");
    }

    /**
     * Reset criteria of a lowongan back to the division template.
     */
    public function resetKriteriaLowongan(Request $request): RedirectResponse
    {
        $lowonganId = $request->validate(['lowongan_id' => 'required|exists:rekrutmen.lowongans,id'])['lowongan_id'];
        $lowongan = Lowongan::with('departement')->findOrFail($lowonganId);

        $divisi = match (strtoupper($lowongan->departement?->kd_departement ?? '')) {
            'H1' => 'H1',
            'H2' => 'H2',
            'H3' => 'H3',
            'HC3' => 'HC3',
            'IT' => 'IT',
            'HR', 'HRD' => 'HRD',
            'FINANCE', 'FIN' => 'Finance',
            default => 'H1',
        };

        KriteriaAts::where('lowongan_id', $lowonganId)->delete();

        $templates = KriteriaAts::whereNull('lowongan_id')->where('divisi', $divisi)->get();
        foreach ($templates as $t) {
            KriteriaAts::create([
                'divisi' => $divisi,
                'lowongan_id' => $lowonganId,
                'kategori' => $t->kategori,
                'nama_kriteria' => $t->nama_kriteria,
                'kebutuhan' => $t->kebutuhan,
                'tipe_penilaian' => $t->tipe_penilaian,
                'keywords' => $t->keywords,
                'bobot' => $t->bobot,
                'is_wajib' => $t->is_wajib,
                'urutan' => $t->urutan,
                'active' => true,
            ]);
        }

        return back()->with('success', "Kriteria ATS untuk lowongan '{$lowongan->judul}' berhasil disesuaikan dengan template divisi {$divisi}.");
    }
}
