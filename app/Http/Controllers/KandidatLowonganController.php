<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Jabatan;
use App\Models\Lowongan;
use App\Models\Pelamar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KandidatLowonganController extends Controller
{
    /**
     * Display a listing of active job vacancies for candidates.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user()->load('kandidatProfile');
        $profile = $user->kandidatProfile;
        $isProfileComplete = $user->isProfileComplete();

        $query = Lowongan::with(['departement', 'jabatan'])
            ->where('status', 'aktif')
            ->where(function ($q) {
                $q->whereNull('tgl_tutup')
                    ->orWhere('tgl_tutup', '>=', now()->toDateString());
            });

        // Search Keyword
        if ($request->filled('keyword')) {
            $kw = trim($request->keyword);
            $query->where(function ($q) use ($kw) {
                $q->where('judul', 'like', "%{$kw}%")
                    ->orWhere('deskripsi', 'like', "%{$kw}%")
                    ->orWhere('kualifikasi', 'like', "%{$kw}%")
                    ->orWhere('lokasi_kerja', 'like', "%{$kw}%")
                    ->orWhereHas('departement', fn($d) => $d->where('deskripsi', 'like', "%{$kw}%"))
                    ->orWhereHas('jabatan', fn($j) => $j->where('nama_jabatan', 'like', "%{$kw}%"));
            });
        }

        // Filter Posisi
        if ($request->filled('posisi_id')) {
            $query->where('posisi_id', $request->posisi_id);
        } elseif ($request->filled('nama_posisi')) {
            $query->where(function ($q) use ($request) {
                $q->where('judul', 'like', "%{$request->nama_posisi}%")
                    ->orWhereHas('jabatan', fn($j) => $j->where('nama_jabatan', 'like', "%{$request->nama_posisi}%"));
            });
        }

        // Filter Departement
        if ($request->filled('departement_id')) {
            $query->where('kd_departement', $request->departement_id);
        }

        $lowongans = $query->orderBy('id', 'desc')->get()->map(function (Lowongan $l) {
            $isClosed = $l->tgl_tutup && Carbon::parse($l->tgl_tutup)->endOfDay()->isPast();
            return [
                'id' => $l->id,
                'kode_lowongan' => $l->kode_lowongan,
                'slug' => $l->slug,
                'judul' => $l->judul,
                'posisi_nama' => $l->jabatan?->nama_jabatan ?? $l->judul,
                'posisi_id' => $l->posisi_id,
                'kd_jabatan' => $l->jabatan?->kd_jabatan ?? '',
                'departement_nama' => $l->departement?->deskripsi ?? 'General',
                'kd_departement' => $l->departement?->kd_departement ?? '',
                'jumlah_dibutuhkan' => $l->jumlah_dibutuhkan,
                'lokasi_kerja' => $l->lokasi_kerja ?? 'Padang, Sumatera Barat',
                'tipe_pekerjaan' => $l->tipe_pekerjaan ?? 'Full Time',
                'deskripsi' => $l->deskripsi,
                'kualifikasi' => $l->kualifikasi,
                'tgl_buka' => $l->tgl_buka ? $l->tgl_buka->format('Y-m-d') : null,
                'tgl_tutup' => $l->tgl_tutup ? $l->tgl_tutup->format('Y-m-d') : null,
                'tgl_tutup_formatted' => $l->tgl_tutup ? Carbon::parse($l->tgl_tutup)->isoFormat('D MMMM Y') : 'Terbuka',
                'is_closed' => $isClosed,
                'status' => $l->status,
            ];
        });

        // Get candidate's existing applications
        $applications = Pelamar::where('email', $user->email)->get();
        $appliedMap = [];
        foreach ($applications as $app) {
            $appliedMap[$app->lowongan_id] = [
                'id' => $app->id,
                'no_pendaftaran' => $app->no_pendaftaran,
                'status' => $app->status,
                'created_at' => $app->created_at ? $app->created_at->format('d/m/Y H:i') : null,
            ];
        }

        $posisis = Jabatan::orderBy('nama_jabatan')
            ->get(['id', 'kd_jabatan', 'nama_jabatan']);

        return Inertia::render('kandidat/Lowongan', [
            'lowongans' => $lowongans,
            'appliedMap' => $appliedMap,
            'isProfileComplete' => $isProfileComplete,
            'candidateProfile' => $profile ? [
                'nama_lengkap' => $user->name,
                'email' => $user->email,
                'nomor_kontak' => $user->phone ?? '',
                'pendidikan_terakhir' => $profile->pendidikan_terakhir ?? '',
                'nama_institusi' => $profile->nama_institusi ?? '',
                'jurusan' => $profile->jurusan ?? '',
                'foto_url' => $profile->foto_url,
                'cv_url' => $profile->cv_url,
                'surat_lamaran_url' => $profile->surat_lamaran_url,
            ] : null,
            'posisis' => $posisis,
            'filters' => [
                'keyword' => $request->keyword ?? '',
                'posisi_id' => $request->posisi_id ?? '',
            ],
        ]);
    }

    /**
     * Submit candidate application for a job vacancy.
     */
    public function apply(Request $request, Lowongan $lowongan): RedirectResponse
    {
        $user = Auth::user()->load('kandidatProfile');
        $profile = $user->kandidatProfile;

        if (!$user->isProfileComplete() || !$profile) {
            return redirect()->route('kandidat.profile')->with('error', 'Harap lengkapi seluruh profil biodata dan dokumen Anda sebelum mengajukan lamaran.');
        }

        if (
            $lowongan->status !== 'aktif' ||
            ($lowongan->tgl_tutup && Carbon::parse($lowongan->tgl_tutup)->endOfDay()->isPast())
        ) {
            return back()->with('error', 'Maaf, lowongan pekerjaan ini sudah tidak aktif atau telah ditutup.');
        }

        // Prevent duplicate application
        $existing = Pelamar::where('lowongan_id', $lowongan->id)
            ->where('email', $user->email)
            ->first();

        if ($existing) {
            return back()->with('error', "Anda sudah pernah mengajukan lamaran untuk posisi ini dengan No. Pendaftaran: {$existing->no_pendaftaran}.");
        }

        // Generate No. Pendaftaran: REG-YYYYMMDD-SEQ
        $todayPrefix = 'REG-' . date('Ymd') . '-';
        $countToday = Pelamar::where('no_pendaftaran', 'like', "{$todayPrefix}%")->count();
        $noPendaftaran = $todayPrefix . str_pad((string) ($countToday + 1), 4, '0', STR_PAD_LEFT);

        $request->validate([
            'sumber_informasi' => ['nullable', 'string', 'max:150'],
        ]);

        $lowongan->loadMissing(['jabatan', 'departement']);
        $posisiNama = $lowongan->jabatan?->nama_jabatan ?? $lowongan->judul;

        $pelamar = Pelamar::create([
            'lowongan_id' => $lowongan->id,
            'no_pendaftaran' => $noPendaftaran,
            'nama_lengkap' => $user->name,
            'tempat_lahir' => $profile->tempat_lahir ?? '-',
            'tanggal_lahir' => $profile->tanggal_lahir,
            'jenis_kelamin' => $profile->jenis_kelamin ?? 'Laki-laki',
            'status_pernikahan' => $profile->status_pernikahan ?? 'Belum Menikah',
            'agama' => $profile->agama ?? 'Islam',
            'alamat' => $profile->alamat ?? '-',
            'domisili' => $profile->domisili ?? '-',
            'nomor_kontak' => $user->phone ?? '-',
            'email' => $user->email,
            'pendidikan_terakhir' => $profile->pendidikan_terakhir ?? '-',
            'nama_institusi' => $profile->nama_institusi ?? '-',
            'jurusan' => $profile->jurusan ?? '-',
            'tahun_lulus' => $profile->tahun_lulus ?? date('Y'),
            'posisi_dilamar' => $posisiNama,
            'sumber_informasi' => $request->input('sumber_informasi') ?: 'Website Karir Perusahaan',
            'foto_path' => $profile->foto_path,
            'cv_path' => $profile->cv_path,
            'surat_lamaran_path' => $profile->surat_lamaran_path,
            'pernyataan_kebenaran' => true,
            'status' => 'submitted',
        ]);

        return back()->with('success', "Lamaran berhasil dikirim untuk posisi {$pelamar->posisi_dilamar}. Terima kasih!");
    }

    /**
     * Display candidate's submitted job applications history.
     */
    public function myApplications(): Response
    {
        $user = Auth::user();

        $stageLabels = [
            'submitted' => ['label' => 'Submit Lamaran', 'tone' => 'purple', 'step' => 1],
            'screening_cv' => ['label' => 'Screening CV', 'tone' => 'blue', 'step' => 2],
            'review' => ['label' => 'Screening CV', 'tone' => 'blue', 'step' => 2],
            'lengkapi_formulir' => ['label' => 'Lengkapi Formulir Lamaran Kerja', 'tone' => 'purple', 'step' => 3],
            'skill_test' => ['label' => 'Skill Test', 'tone' => 'orange', 'step' => 4],
            'interview_hr' => ['label' => 'Interview HR', 'tone' => 'mint', 'step' => 5],
            'interview' => ['label' => 'Interview HR', 'tone' => 'mint', 'step' => 5],
            'interview_user' => ['label' => 'Interview User', 'tone' => 'mint', 'step' => 6],
            'interview_gm' => ['label' => 'Interview GM', 'tone' => 'purple', 'step' => 7],
            'final_discussion' => ['label' => 'Final Discussion', 'tone' => 'purple', 'step' => 8],
            'accepted' => ['label' => 'Diterima Bekerja (Accepted)', 'tone' => 'mint', 'step' => 9],
            'rejected' => ['label' => 'Ditolak (Rejected)', 'tone' => 'orange', 'step' => 0],
        ];

        $applications = Pelamar::with(['lowongan.departement', 'lowongan.jabatan', 'lowongan.permintaanRekrutmen', 'formulirLamaran'])
            ->where('email', $user->email)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (Pelamar $p) use ($stageLabels) {
                if ($p->formulirLamaran?->is_submitted && in_array($p->status, ['submitted', 'screening_cv', 'review', 'lengkapi_formulir'])) {
                    $kdJabatan = $p->lowongan?->jabatan?->kd_jabatan
                        ?: ($p->lowongan?->permintaanRekrutmen?->kd_jabatan ?: '');
                    $skillTestJabatanCodes = ['JBT-5', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31', 'JBT-26'];
                    $hasSkillTest = in_array($kdJabatan, $skillTestJabatanCodes);
                    $p->status = $hasSkillTest ? 'skill_test' : 'interview_hr';
                    $p->save();
                }

                $statusInfo = $stageLabels[$p->status] ?? ['label' => ucfirst($p->status), 'tone' => 'purple', 'step' => 1];
                return [
                    'id' => $p->id,
                    'no_pendaftaran' => $p->no_pendaftaran,
                    'posisi_dilamar' => $p->posisi_dilamar,
                    'nama_lengkap' => $p->nama_lengkap,
                    'email' => $p->email,
                    'nomor_kontak' => $p->nomor_kontak,
                    'pendidikan_terakhir' => $p->pendidikan_terakhir,
                    'nama_institusi' => $p->nama_institusi,
                    'jurusan' => $p->jurusan,
                    'tahun_lulus' => $p->tahun_lulus,
                    'cv_url' => $p->cv_path ? asset('storage/' . $p->cv_path) : null,
                    'foto_url' => $p->foto_path ? asset('storage/' . $p->foto_path) : null,
                    'surat_lamaran_url' => $p->surat_lamaran_path ? asset('storage/' . $p->surat_lamaran_path) : null,
                    'departement_nama' => $p->lowongan?->departement?->deskripsi ?? 'General',
                    'kd_jabatan' => $p->lowongan?->jabatan?->kd_jabatan ?? '',
                    'lokasi_kerja' => $p->lowongan?->lokasi_kerja ?? 'Padang, Sumatera Barat',
                    'tipe_pekerjaan' => $p->lowongan?->tipe_pekerjaan ?? 'Full Time',
                    'status' => $p->status,
                    'status_label' => $statusInfo['label'],
                    'status_tone' => $statusInfo['tone'],
                    'step' => $statusInfo['step'],
                    'catatan' => $p->catatan,
                    'applied_at' => $p->created_at ? $p->created_at->isoFormat('D MMMM Y, HH:mm') : null,
                    'formulir_submitted' => (bool) $p->formulirLamaran?->is_submitted,
                    'has_formulir' => (bool) $p->formulirLamaran,
                    'lowongan' => $p->lowongan ? [
                        'id' => $p->lowongan->id,
                        'kode_lowongan' => $p->lowongan->kode_lowongan,
                        'judul' => $p->lowongan->judul,
                        'slug' => $p->lowongan->slug,
                    ] : null,
                ];
            });

        return Inertia::render('kandidat/Lamaran', [
            'applications' => $applications,
        ]);
    }

    /**
     * Display the details of a specific application for the candidate.
     */
    public function showApplication(Pelamar $pelamar): Response
    {
        $user = Auth::user();

        // Ensure candidate can only view their own application
        if ($pelamar->email !== $user->email) {
            abort(403, 'Akses ditolak.');
        }

        $pelamar->load(['lowongan.departement', 'lowongan.jabatan', 'lowongan.permintaanRekrutmen', 'formulirLamaran', 'penilaianSkillTests']);

        // Auto-advance status if candidate already submitted formulir
        if ($pelamar->formulirLamaran?->is_submitted && in_array($pelamar->status, ['submitted', 'screening_cv', 'review', 'lengkapi_formulir'])) {
            $kdJabatan = $pelamar->lowongan?->jabatan?->kd_jabatan
                ?: ($pelamar->lowongan?->permintaanRekrutmen?->kd_jabatan ?: '');
            $skillTestJabatanCodes = ['JBT-5', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31', 'JBT-26'];
            $hasSkillTest = in_array($kdJabatan, $skillTestJabatanCodes);
            $pelamar->status = $hasSkillTest ? 'skill_test' : 'interview_hr';
            $pelamar->save();
        }

        $stageLabels = [
            'submitted' => ['label' => 'Submit Lamaran', 'tone' => 'purple', 'step' => 1],
            'screening_cv' => ['label' => 'Screening CV', 'tone' => 'blue', 'step' => 2],
            'review' => ['label' => 'Screening CV', 'tone' => 'blue', 'step' => 2],
            'lengkapi_formulir' => ['label' => 'Lengkapi Formulir Lamaran Kerja', 'tone' => 'purple', 'step' => 3],
            'skill_test' => ['label' => 'Skill Test', 'tone' => 'orange', 'step' => 4],
            'interview_hr' => ['label' => 'Interview HR', 'tone' => 'mint', 'step' => 5],
            'interview' => ['label' => 'Interview HR', 'tone' => 'mint', 'step' => 5],
            'interview_user' => ['label' => 'Interview User', 'tone' => 'mint', 'step' => 6],
            'interview_gm' => ['label' => 'Interview GM', 'tone' => 'purple', 'step' => 7],
            'final_discussion' => ['label' => 'Final Discussion', 'tone' => 'purple', 'step' => 8],
            'accepted' => ['label' => 'Diterima Bekerja (Accepted)', 'tone' => 'mint', 'step' => 9],
            'rejected' => ['label' => 'Ditolak (Rejected)', 'tone' => 'orange', 'step' => 0],
        ];

        $statusInfo = $stageLabels[$pelamar->status] ?? ['label' => ucfirst($pelamar->status), 'tone' => 'purple', 'step' => 1];

        $applicationData = [
            'id' => $pelamar->id,
            'no_pendaftaran' => $pelamar->no_pendaftaran,
            'posisi_dilamar' => $pelamar->posisi_dilamar,
            'nama_lengkap' => $pelamar->nama_lengkap,
            'email' => $pelamar->email,
            'nomor_kontak' => $pelamar->nomor_kontak,
            'tempat_lahir' => $pelamar->tempat_lahir,
            'tanggal_lahir' => $pelamar->tanggal_lahir ? $pelamar->tanggal_lahir->format('d/m/Y') : null,
            'jenis_kelamin' => $pelamar->jenis_kelamin,
            'status_pernikahan' => $pelamar->status_pernikahan,
            'agama' => $pelamar->agama,
            'alamat' => $pelamar->alamat,
            'domisili' => $pelamar->domisili,
            'pendidikan_terakhir' => $pelamar->pendidikan_terakhir,
            'nama_institusi' => $pelamar->nama_institusi,
            'jurusan' => $pelamar->jurusan,
            'tahun_lulus' => $pelamar->tahun_lulus,
            'cv_url' => $pelamar->cv_path ? asset('storage/' . $pelamar->cv_path) : null,
            'foto_url' => $pelamar->foto_path ? asset('storage/' . $pelamar->foto_path) : null,
            'surat_lamaran_url' => $pelamar->surat_lamaran_path ? asset('storage/' . $pelamar->surat_lamaran_path) : null,
            'departement_nama' => $pelamar->lowongan?->departement?->deskripsi ?? 'General',
            'kd_jabatan' => $pelamar->lowongan?->jabatan?->kd_jabatan ?? '',
            'lokasi_kerja' => $pelamar->lowongan?->lokasi_kerja ?? 'Padang, Sumatera Barat',
            'tipe_pekerjaan' => $pelamar->lowongan?->tipe_pekerjaan ?? 'Full Time',
            'status' => $pelamar->status,
            'tahap_gagal' => $pelamar->effective_tahap_gagal,
            'status_label' => $statusInfo['label'],
            'status_tone' => $statusInfo['tone'],
            'step' => $statusInfo['step'],
            'catatan' => $pelamar->catatan,
            'applied_at' => $pelamar->created_at ? $pelamar->created_at->isoFormat('D MMMM Y, HH:mm') : null,
            'formulir_submitted' => (bool) $pelamar->formulirLamaran?->is_submitted,
            'has_formulir' => (bool) $pelamar->formulirLamaran,
            'lowongan' => $pelamar->lowongan ? [
                'id' => $pelamar->lowongan->id,
                'kode_lowongan' => $pelamar->lowongan->kode_lowongan,
                'judul' => $pelamar->lowongan->judul,
                'slug' => $pelamar->lowongan->slug,
            ] : null,
        ];

        return Inertia::render('kandidat/LamaranDetail', [
            'application' => $applicationData,
        ]);
    }
}
