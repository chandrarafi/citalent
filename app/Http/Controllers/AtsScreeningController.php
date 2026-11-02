<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessBatchAtsScreeningJob;
use App\Jobs\ProcessBulkConfirmJob;
use App\Mail\StatusLamaranUpdatedMail;
use App\Mail\UndanganInterviewMail;
use App\Models\AtsScreening;
use App\Models\KriteriaAts;
use App\Models\Lowongan;
use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use App\Services\AtsScreeningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
     * Get real-time batch screening progress.
     */
     public function getBatchProgress(): JsonResponse
     {
         $progress = Cache::get('ats_screening_batch_progress', [
             'status' => 'idle',
             'percentage' => 0,
             'completed' => 0,
             'total' => 0,
             'failed' => 0,
             'current_candidate' => null,
             'batch_id' => null,
         ]);

         return response()->json($progress);
     }

    /**
     * Cancel active ATS batch screening queue immediately.
     */
    public function cancelBatch(): JsonResponse
    {
        Cache::put('ats_screening_cancel_requested', true, now()->addMinutes(10));
        $progress = Cache::get('ats_screening_batch_progress');
        if ($progress && !empty($progress['batch_id'])) {
            Cache::put("ats_screening_cancel_{$progress['batch_id']}", true, now()->addMinutes(10));
        }

        Cache::put('ats_screening_batch_progress', [
            'status' => 'idle',
            'percentage' => 0,
            'completed' => 0,
            'total' => 0,
            'failed' => 0,
            'current_candidate' => null,
            'batch_id' => null,
        ]);

        // Restart queue worker to immediately terminate child process
        Artisan::call('queue:restart');

        return response()->json([
            'success' => true,
            'message' => 'Proses AI Screening CV berhasil dibatalkan.',
        ]);
    }

    /**
     * Run batch auto-screening for unscreened or filtered candidates using Queue.
     */
    public function runBatch(Request $request): RedirectResponse
    {
        $query = Pelamar::whereHas('lowongan', fn ($q) => $q->where('status', 'aktif'));

        if ($request->filled('lowongan_id') && $request->lowongan_id !== 'all') {
            $query->where('lowongan_id', $request->lowongan_id);
        }

        // If force_rescreen is false, only screen unscreened ones
        if (!$request->boolean('force_rescreen')) {
            $query->whereDoesntHave('atsScreening');
        }

        $pelamarIds = $query->pluck('id')->all();

        if (empty($pelamarIds)) {
            return back()->with('info', 'Tidak ada kandidat yang perlu diskrining.');
        }

        $batchId = (string) Str::uuid();
        Cache::forget('ats_screening_cancel_requested');
        Cache::forget("ats_screening_cancel_{$batchId}");

        $total = count($pelamarIds);

        // Initialize progress in Cache immediately
        Cache::put('ats_screening_batch_progress', [
            'batch_id' => $batchId,
            'total' => $total,
            'completed' => 0,
            'failed' => 0,
            'percentage' => 0,
            'current_candidate' => 'Menyiapkan antrean screening...',
            'status' => 'processing',
            'updated_at' => now()->timestamp,
        ], now()->addHours(2));

        // Dispatch background queue jobs in small chunks of 5 candidates
        // agar tidak pernah terkena timeout 30 menit dan progress tersimpan bertahap
        $chunks = array_chunk($pelamarIds, 5);
        foreach ($chunks as $chunk) {
            ProcessBatchAtsScreeningJob::dispatch($batchId, $chunk, $total);
        }

        return back()->with('info', "Screening CV untuk {$total} kandidat telah dimasukkan ke antrean background (" . count($chunks) . " sub-batch).");
    }

    /**
     * Run single auto-screening for one candidate using Queue.
     */
    public function runSingle(Pelamar $pelamar): RedirectResponse
    {
        $batchId = (string) Str::uuid();
        Cache::forget('ats_screening_cancel_requested');
        Cache::forget("ats_screening_cancel_{$batchId}");

        Cache::put('ats_screening_batch_progress', [
            'batch_id' => $batchId,
            'total' => 1,
            'completed' => 0,
            'failed' => 0,
            'percentage' => 0,
            'current_candidate' => $pelamar->nama_lengkap,
            'status' => 'processing',
            'updated_at' => now()->timestamp,
        ], now()->addHours(2));

        ProcessBatchAtsScreeningJob::dispatch($batchId, [$pelamar->id], 1);

        return back()->with('info', "Screening CV untuk '{$pelamar->nama_lengkap}' sedang diproses di background.");
    }

    /**
     * Confirm screening result by HR (Approve or Reject).
     */
    /**
     * Confirm screening result by HR (Approve or Reject), with optional instant interview scheduling.
     */
    public function confirm(Request $request, Pelamar $pelamar): RedirectResponse
    {
        $validated = $request->validate([
            'keputusan' => ['required', 'in:approve,reject'],
            'catatan_hr' => ['nullable', 'string', 'max:1000'],
            'tahap_berikutnya' => ['nullable', 'string', 'in:lengkapi_formulir,skill_test,interview_hr,interview_user,interview_gm'],
            // Instant Interview Scheduling Fields
            'buat_jadwal_interview' => ['nullable', 'boolean'],
            'tanggal_interview' => ['nullable', 'required_if:buat_jadwal_interview,true', 'date'],
            'jam_mulai' => ['nullable', 'required_if:buat_jadwal_interview,true', 'string', 'max:10'],
            'jam_selesai' => ['nullable', 'string', 'max:10'],
            'tipe_interview' => ['nullable', 'required_if:buat_jadwal_interview,true', 'in:offline,online'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'link_meeting' => ['nullable', 'string', 'max:500'],
            'pewawancara_nama' => ['nullable', 'string', 'max:255'],
            'catatan_interview' => ['nullable', 'string', 'max:1000'],
            'kirim_undangan_email' => ['nullable', 'boolean'],
        ]);

        $userId = Auth::id();
        $isApprove = $validated['keputusan'] === 'approve';
        $buatJadwal = $isApprove && $request->boolean('buat_jadwal_interview');

        $jadwalData = [
            'tanggal_interview' => $validated['tanggal_interview'] ?? null,
            'jam_mulai' => $validated['jam_mulai'] ?? null,
            'jam_selesai' => $validated['jam_selesai'] ?? null,
            'tipe_interview' => $validated['tipe_interview'] ?? 'offline',
            'lokasi' => $validated['lokasi'] ?? null,
            'link_meeting' => $validated['link_meeting'] ?? null,
            'pewawancara_nama' => $validated['pewawancara_nama'] ?? null,
            'catatan_interview' => $validated['catatan_interview'] ?? null,
            'kirim_undangan_email' => $request->boolean('kirim_undangan_email', true),
        ];

        ProcessBulkConfirmJob::dispatch(
            [$pelamar->id],
            $validated['keputusan'],
            $validated['catatan_hr'] ?? null,
            $validated['tahap_berikutnya'] ?? null,
            $buatJadwal,
            $jadwalData,
            $userId
        );

        $actionText = $isApprove ? 'Loloskan' : 'Tolak';
        $schedText = $buatJadwal ? ' dan pembuatan jadwal interview' : '';
        return back()->with('info', "Proses {$actionText} kandidat '{$pelamar->nama_lengkap}'{$schedText} sedang diproses di antrean (Queue).");
    }

    /**
     * Bulk confirm multiple candidates at once, with optional instant interview scheduling.
     * Processed in background via Queue.
     */
    public function bulkConfirm(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pelamar_ids' => ['required', 'array', 'min:1'],
            'pelamar_ids.*' => ['required', Rule::exists(Pelamar::class, 'id')],
            'keputusan' => ['required', 'in:approve,reject'],
            'catatan_hr' => ['nullable', 'string', 'max:1000'],
            'tahap_berikutnya' => ['nullable', 'string', 'in:lengkapi_formulir,skill_test,interview_hr,interview_user,interview_gm'],
            // Instant Interview Scheduling Fields
            'buat_jadwal_interview' => ['nullable', 'boolean'],
            'tanggal_interview' => ['nullable', 'required_if:buat_jadwal_interview,true', 'date'],
            'jam_mulai' => ['nullable', 'required_if:buat_jadwal_interview,true', 'string', 'max:10'],
            'jam_selesai' => ['nullable', 'string', 'max:10'],
            'tipe_interview' => ['nullable', 'required_if:buat_jadwal_interview,true', 'in:offline,online'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'link_meeting' => ['nullable', 'string', 'max:500'],
            'pewawancara_nama' => ['nullable', 'string', 'max:255'],
            'catatan_interview' => ['nullable', 'string', 'max:1000'],
            'kirim_undangan_email' => ['nullable', 'boolean'],
        ]);

        $userId = Auth::id();
        $isApprove = $validated['keputusan'] === 'approve';
        $buatJadwal = $isApprove && $request->boolean('buat_jadwal_interview');
        $count = count($validated['pelamar_ids']);

        $jadwalData = [
            'tanggal_interview' => $validated['tanggal_interview'] ?? null,
            'jam_mulai' => $validated['jam_mulai'] ?? null,
            'jam_selesai' => $validated['jam_selesai'] ?? null,
            'tipe_interview' => $validated['tipe_interview'] ?? 'offline',
            'lokasi' => $validated['lokasi'] ?? null,
            'link_meeting' => $validated['link_meeting'] ?? null,
            'pewawancara_nama' => $validated['pewawancara_nama'] ?? null,
            'catatan_interview' => $validated['catatan_interview'] ?? null,
            'kirim_undangan_email' => $request->boolean('kirim_undangan_email', true),
        ];

        ProcessBulkConfirmJob::dispatch(
            $validated['pelamar_ids'],
            $validated['keputusan'],
            $validated['catatan_hr'] ?? null,
            $validated['tahap_berikutnya'] ?? null,
            $buatJadwal,
            $jadwalData,
            $userId
        );

        $actionText = $isApprove ? 'Loloskan' : 'Tolak';
        $schedText = $buatJadwal ? ' beserta pembuatan jadwal interview' : '';
        return back()->with('info', "Konfirmasi massal ({$actionText}) untuk {$count} kandidat{$schedText} sedang diproses di antrean (Queue).");
    }

    /**
     * Save / update a criteria item.
     */
    public function saveKriteria(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['nullable', Rule::exists(KriteriaAts::class, 'id')],
            'lowongan_id' => ['nullable', Rule::exists(Lowongan::class, 'id')],
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
        $lowonganId = $request->validate(['lowongan_id' => ['required', Rule::exists(Lowongan::class, 'id')]])['lowongan_id'];
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
