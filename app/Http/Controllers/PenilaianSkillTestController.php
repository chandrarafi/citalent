<?php

namespace App\Http\Controllers;

use App\Models\DetailParameterSkillTest;
use App\Models\DetailPenilaianSkillTest;
use App\Models\Jabatan;
use App\Models\Lowongan;
use App\Models\ParameterSkillTest;
use App\Models\Pelamar;
use App\Models\PenilaianSkillTest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PenilaianSkillTestController extends Controller
{
    /**
     * Resolve the recruitment stage (tahap) from the request URI or parameter.
     */
    protected function resolveTahap(Request $request): string
    {
        $path = $request->path();
        if (str_contains($path, 'penilaian-interview-gm')) {
            return 'interview_gm';
        }
        if (str_contains($path, 'penilaian-interview-user')) {
            return 'interview_user';
        }
        if (str_contains($path, 'penilaian-interview-hr')) {
            return 'interview_hr';
        }
        return $request->input('jenis_tahap', 'skill_test');
    }

    /**
     * Get stage configuration and metadata.
     */
    protected function getTahapConfig(string $tahap): array
    {
        return match ($tahap) {
            'interview_hr' => [
                'tahap' => 'interview_hr',
                'tahap_key' => 'interview_hr',
                'title' => 'Penilaian Interview HR',
                'subtitle' => 'Evaluasi wawancara awal HR, kepribadian, latar belakang, dan kesesuaian budaya kerja kandidat.',
                'route_prefix' => 'penilaian-interview-hr',
                'param_route_prefix' => 'parameter-interview-hr',
                'badge_label' => 'INTERVIEW HR',
                'badge_tone' => 'mint',
                'allowed_jabatans' => null,
                'next_stage_default' => 'interview_user',
                'next_stage_label' => 'Interview User',
            ],
            'interview_user' => [
                'tahap' => 'interview_user',
                'tahap_key' => 'interview_user',
                'title' => 'Penilaian Interview User',
                'subtitle' => 'Evaluasi wawancara calon atasan / User, kompetensi teknis mendalam, dan pemecahan masalah kerja.',
                'route_prefix' => 'penilaian-interview-user',
                'param_route_prefix' => 'parameter-interview-user',
                'badge_label' => 'INTERVIEW USER',
                'badge_tone' => 'mint',
                'allowed_jabatans' => null,
                'next_stage_default' => 'final_discussion',
                'next_stage_label' => 'Final Discussion',
            ],
            'interview_gm' => [
                'tahap' => 'interview_gm',
                'tahap_key' => 'interview_gm',
                'title' => 'Penilaian Interview GM',
                'subtitle' => 'Evaluasi wawancara General Manager khusus untuk posisi pimpinan / manajerial (JBT-6 dan JBT-37).',
                'route_prefix' => 'penilaian-interview-gm',
                'param_route_prefix' => 'parameter-interview-gm',
                'badge_label' => 'INTERVIEW GM',
                'badge_tone' => 'purple',
                'allowed_jabatans' => ['JBT-6', 'JBT-37'],
                'next_stage_default' => 'final_discussion',
                'next_stage_label' => 'Final Discussion',
            ],
            default => [
                'tahap' => 'skill_test',
                'tahap_key' => 'skill_test',
                'title' => 'Penilaian Skill Test',
                'subtitle' => 'Penilaian uji kompetensi teknis, tes keahlian, dan simulasi kerja kandidat per lowongan.',
                'route_prefix' => 'penilaian-skill-test',
                'param_route_prefix' => 'parameter-skill-test',
                'badge_label' => 'SKILL TEST',
                'badge_tone' => 'purple',
                'allowed_jabatans' => ['JBT-5', 'JBT-26', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31'],
                'next_stage_default' => 'interview_hr',
                'next_stage_label' => 'Interview HR',
            ],
        };
    }

    /**
     * Display a listing of ongoing vacancies with their candidates for the resolved stage.
     */
    public function index(Request $request): Response
    {
        $tahap = $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $statusFilter = $request->input('status', 'aktif');
        $search = $request->input('search');
        $deptFilter = $request->input('kd_departement', 'all');

        $query = Lowongan::with([
            'departement',
            'jabatan.departement',
            'jabatan.parameterSkillTests' => function ($q) use ($tahap) {
                $q->where('jenis_tahap', $tahap)->with('details')->orderBy('urutan');
            },
            'permintaanRekrutmen',
            'pelamars' => function ($q) use ($tahap) {
                $q->where(function ($sq) use ($tahap) {
                    $sq->where('status', $tahap)
                       ->orWhereHas('penilaianSkillTests', fn($p) => $p->where('jenis_tahap', $tahap));
                })
                ->with(['penilaianSkillTests' => fn($p) => $p->where('jenis_tahap', $tahap)->with('penguji')])
                ->orderByDesc('id');
            },
        ]);

        if ($config['allowed_jabatans']) {
            $query->whereHas('jabatan', function ($j) use ($config) {
                $j->whereIn('kd_jabatan', $config['allowed_jabatans']);
            });
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($deptFilter && $deptFilter !== 'all') {
            $query->where('kd_departement', $deptFilter);
        }

        if ($search) {
            $q = trim(strtolower($search));
            $query->where(function ($w) use ($q, $tahap) {
                $w->whereRaw('LOWER(judul) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(kode_lowongan) LIKE ?', ["%{$q}%"])
                    ->orWhereHas('jabatan', function ($j) use ($q) {
                        $j->whereRaw('LOWER(nama_jabatan) LIKE ?', ["%{$q}%"])
                            ->orWhereRaw('LOWER(kd_jabatan) LIKE ?', ["%{$q}%"]);
                    })
                    ->orWhereHas('pelamars', function ($p) use ($q, $tahap) {
                        $p->where(function ($sq) use ($tahap) {
                            $sq->where('status', $tahap)
                               ->orWhereHas('penilaianSkillTests', fn($pq) => $pq->where('jenis_tahap', $tahap));
                        })->where(function ($sub) use ($q) {
                            $sub->whereRaw('LOWER(nama_lengkap) LIKE ?', ["%{$q}%"])
                                ->orWhereRaw('LOWER(no_pendaftaran) LIKE ?', ["%{$q}%"]);
                        });
                    });
            });
        }

        $lowongans = $query->orderByDesc('id')->get()->map(function (Lowongan $lowongan) use ($tahap) {
            $jabatan = $lowongan->jabatan;
            $parameters = $jabatan?->parameterSkillTests->where('jenis_tahap', $tahap) ?? collect();
            $activeParams = $parameters->where('active', true);
            $totalBobot = (int) $activeParams->sum('bobot');
            $parameterCount = $activeParams->count();
            $totalItemsDinilai = $activeParams->reduce(fn($carry, $p) => $carry + $p->details->count(), 0);

            $stagePelamars = $lowongan->pelamars;

            $kandidatSelesai = $stagePelamars->filter(fn(Pelamar $p) => $p->penilaianSkillTests->where('jenis_tahap', $tahap)->contains('status', 'final'))->count();
            $kandidatDraft = $stagePelamars->filter(fn(Pelamar $p) => $p->penilaianSkillTests->where('jenis_tahap', $tahap)->where('status', 'draft')->isNotEmpty() && !$p->penilaianSkillTests->where('jenis_tahap', $tahap)->contains('status', 'final'))->count();
            $kandidatBelum = $stagePelamars->filter(fn(Pelamar $p) => $p->penilaianSkillTests->where('jenis_tahap', $tahap)->isEmpty())->count();

            return [
                'id' => $lowongan->id,
                'kode_lowongan' => $lowongan->kode_lowongan,
                'judul' => $lowongan->judul,
                'status' => $lowongan->status,
                'tgl_buka' => $lowongan->tgl_buka ? $lowongan->tgl_buka->isoFormat('D MMM Y') : null,
                'tgl_tutup' => $lowongan->tgl_tutup ? $lowongan->tgl_tutup->isoFormat('D MMM Y') : null,
                'tipe_pekerjaan' => $lowongan->tipe_pekerjaan,
                'lokasi_kerja' => $lowongan->lokasi_kerja,
                'jumlah_dibutuhkan' => (int) $lowongan->jumlah_dibutuhkan,
                'departement' => [
                    'id' => $lowongan->departement?->id,
                    'kd_departement' => $lowongan->departement?->kd_departement ?? '',
                    'deskripsi' => $lowongan->departement?->deskripsi ?? 'General',
                ],
                'jabatan' => [
                    'id' => $jabatan?->id,
                    'kd_jabatan' => $jabatan?->kd_jabatan ?? '',
                    'nama_jabatan' => $jabatan?->nama_jabatan ?? $lowongan->judul,
                ],
                'parameter_config' => [
                    'count' => $parameterCount,
                    'total_bobot' => $totalBobot,
                    'total_items_dinilai' => $totalItemsDinilai,
                    'is_ready' => $parameterCount > 0,
                    'parameters' => $activeParams->map(fn($param) => [
                        'id' => $param->id,
                        'parameter' => $param->parameter,
                        'bobot' => (int) $param->bobot,
                        'items_count' => $param->details->count(),
                    ])->values()->all(),
                ],
                'stats' => [
                    'total_stage' => $stagePelamars->count(),
                    'selesai' => $kandidatSelesai,
                    'draft' => $kandidatDraft,
                    'belum_dinilai' => $kandidatBelum,
                ],
                'candidates' => $stagePelamars->map(function (Pelamar $p) use ($tahap) {
                    $ass = $p->penilaianSkillTests->where('jenis_tahap', $tahap)->first();
                    return [
                        'id' => $p->id,
                        'no_pendaftaran' => $p->no_pendaftaran,
                        'nama_lengkap' => $p->nama_lengkap,
                        'email' => $p->email,
                        'nomor_kontak' => $p->nomor_kontak,
                        'posisi_dilamar' => $p->posisi_dilamar,
                        'status' => $p->status,
                        'assessment' => $ass ? [
                            'id' => $ass->id,
                            'total_skor' => (float) $ass->total_skor,
                            'nilai_akhir' => (float) $ass->nilai_akhir,
                            'rekomendasi' => $ass->rekomendasi,
                            'status' => $ass->status,
                            'tanggal_test' => $ass->tanggal_test ? $ass->tanggal_test->isoFormat('D MMMM Y') : null,
                            'nama_penguji' => $ass->nama_penguji ?: ($ass->penguji?->name ?? 'Penguji'),
                        ] : null,
                    ];
                })->values()->all(),
            ];
        });

        // Dropdown Departement options
        $departements = \App\Models\Departement::orderBy('deskripsi')
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'kd_departement' => $d->kd_departement,
                'deskripsi' => $d->deskripsi,
            ]);

        return Inertia::render('penilaian-skill-test/Index', [
            'lowongans' => $lowongans,
            'departements' => $departements,
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter,
                'kd_departement' => $deptFilter ?? 'all',
            ],
            'tahapConfig' => $config,
        ]);
    }

    /**
     * Display candidate list & score matrix for a specific vacancy in the resolved stage.
     */
    public function showLowongan(Request $request, Lowongan $lowongan): Response
    {
        $tahap = $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $lowongan->load([
            'departement',
            'jabatan.departement',
            'jabatan.parameterSkillTests' => function ($q) use ($tahap) {
                $q->where('jenis_tahap', $tahap)->with('details')->orderBy('urutan');
            },
            'permintaanRekrutmen',
            'pelamars' => function ($q) use ($tahap) {
                $q->where(function ($sq) use ($tahap) {
                    $sq->where('status', $tahap)
                       ->orWhereHas('penilaianSkillTests', fn($p) => $p->where('jenis_tahap', $tahap));
                })
                ->with([
                    'penilaianSkillTests' => fn($p) => $p->where('jenis_tahap', $tahap)->with([
                        'penguji',
                        'details.parameterSkillTest',
                        'details.detailParameterSkillTest',
                    ]),
                ])
                ->orderByDesc('id');
            },
        ]);

        $jabatan = $lowongan->jabatan;

        if ($config['allowed_jabatans'] && $jabatan) {
            if (!in_array($jabatan->kd_jabatan, $config['allowed_jabatans'])) {
                return redirect()->route("{$config['route_prefix']}.index")->with('error', "Posisi {$jabatan->nama_jabatan} tidak termasuk dalam tahapan {$config['title']}.");
            }
        }

        $parameters = $jabatan?->parameterSkillTests->where('jenis_tahap', $tahap) ?? collect();
        $activeParams = $parameters->where('active', true);
        $totalBobot = (int) $activeParams->sum('bobot');
        $parameterCount = $activeParams->count();
        $totalItemsDinilai = $activeParams->reduce(fn($carry, $p) => $carry + $p->details->count(), 0);

        $stagePelamars = $lowongan->pelamars;
        $currentUserId = Auth::id();

        $kandidatSelesai = $stagePelamars->filter(fn(Pelamar $p) => $p->penilaianSkillTests->where('jenis_tahap', $tahap)->contains('status', 'final'))->count();
        $kandidatDraft = $stagePelamars->filter(fn(Pelamar $p) => $p->penilaianSkillTests->where('jenis_tahap', $tahap)->where('status', 'draft')->isNotEmpty() && !$p->penilaianSkillTests->where('jenis_tahap', $tahap)->contains('status', 'final'))->count();
        $kandidatBelum = $stagePelamars->filter(fn(Pelamar $p) => $p->penilaianSkillTests->where('jenis_tahap', $tahap)->isEmpty())->count();

        $kandidats = $stagePelamars->map(function (Pelamar $p) use ($currentUserId, $activeParams, $tahap) {
            $assessments = $p->penilaianSkillTests->where('jenis_tahap', $tahap);
            $myAssessment = $assessments->firstWhere('penguji_id', $currentUserId);
            $completedAssessments = $assessments->where('status', 'final');
            
            $avgNilaiAkhir = $completedAssessments->isNotEmpty()
                ? round($completedAssessments->avg('nilai_akhir'), 1)
                : ($assessments->isNotEmpty() ? round($assessments->avg('nilai_akhir'), 1) : null);
            
            $avgTotalSkor = $completedAssessments->isNotEmpty()
                ? round($completedAssessments->avg('total_skor'), 2)
                : ($assessments->isNotEmpty() ? round($assessments->avg('total_skor'), 2) : null);

            // Determine dominant recommendation
            $dominantRekomendasi = null;
            if ($assessments->isNotEmpty()) {
                $recs = $assessments->pluck('rekomendasi');
                $disarankanCount = $recs->filter(fn($r) => $r === 'disarankan')->count();
                $dipertimbangkanCount = $recs->filter(fn($r) => $r === 'dipertimbangkan')->count();
                $tidakCount = $recs->filter(fn($r) => $r === 'tidak_disarankan')->count();

                if ($disarankanCount >= $dipertimbangkanCount && $disarankanCount >= $tidakCount) {
                    $dominantRekomendasi = 'disarankan';
                } elseif ($dipertimbangkanCount >= $tidakCount) {
                    $dominantRekomendasi = 'dipertimbangkan';
                } else {
                    $dominantRekomendasi = 'tidak_disarankan';
                }
            }

            // Parameter score breakdown for this candidate (averaged across examiners for this stage)
            $parameterScores = $activeParams->map(function ($param) use ($assessments) {
                $paramDetails = $assessments->flatMap->details->where('parameter_skill_test_id', $param->id);
                $avgSkor = $paramDetails->isNotEmpty() ? round($paramDetails->avg('skor'), 2) : null;
                $nilaiScale100 = $avgSkor !== null ? round(($avgSkor / 5) * 100, 1) : null;

                return [
                    'parameter_id' => $param->id,
                    'parameter_name' => $param->parameter,
                    'bobot' => (int) $param->bobot,
                    'avg_skor' => $avgSkor,
                    'nilai_100' => $nilaiScale100,
                ];
            })->values()->all();

            return [
                'id' => $p->id,
                'no_pendaftaran' => $p->no_pendaftaran,
                'nama_lengkap' => $p->nama_lengkap,
                'email' => $p->email,
                'nomor_kontak' => $p->nomor_kontak,
                'posisi_dilamar' => $p->posisi_dilamar,
                'status_tahap' => $p->status,
                'jenis_tahap' => $tahap,
                'is_current_stage' => $p->status === $tahap,
                'has_assessment' => $assessments->isNotEmpty(),
                'assessments_count' => $assessments->count(),
                'avg_nilai_akhir' => $avgNilaiAkhir,
                'avg_total_skor' => $avgTotalSkor,
                'dominant_rekomendasi' => $dominantRekomendasi,
                'parameter_scores' => $parameterScores,
                'my_assessment' => $myAssessment ? [
                    'id' => $myAssessment->id,
                    'status' => $myAssessment->status,
                    'nilai_akhir' => (float) $myAssessment->nilai_akhir,
                    'total_skor' => (float) $myAssessment->total_skor,
                    'rekomendasi' => $myAssessment->rekomendasi,
                    'tanggal_test' => $myAssessment->tanggal_test ? $myAssessment->tanggal_test->isoFormat('D MMMM Y') : null,
                ] : null,
                'assessments' => $assessments->map(function (PenilaianSkillTest $ass) use ($currentUserId) {
                    return [
                        'id' => $ass->id,
                        'tanggal_test' => $ass->tanggal_test ? $ass->tanggal_test->isoFormat('D MMMM Y') : null,
                        'total_skor' => (float) $ass->total_skor,
                        'nilai_akhir' => (float) $ass->nilai_akhir,
                        'rekomendasi' => $ass->rekomendasi,
                        'status' => $ass->status,
                        'nama_penguji' => $ass->nama_penguji ?: ($ass->penguji?->name ?? 'Penguji'),
                        'penguji_id' => $ass->penguji_id,
                        'is_mine' => $ass->penguji_id === $currentUserId,
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        // Compute overall vacancy summary metrics
        $assessedCandidates = collect($kandidats)->filter(fn($k) => $k['has_assessment'] && $k['avg_nilai_akhir'] !== null);
        $avgAllCandidates = $assessedCandidates->isNotEmpty()
            ? round($assessedCandidates->avg('avg_nilai_akhir'), 1)
            : null;
        $highestScore = $assessedCandidates->isNotEmpty()
            ? $assessedCandidates->max('avg_nilai_akhir')
            : null;
        $lowestScore = $assessedCandidates->isNotEmpty()
            ? $assessedCandidates->min('avg_nilai_akhir')
            : null;

        $countDisarankan = $assessedCandidates->filter(fn($k) => $k['dominant_rekomendasi'] === 'disarankan')->count();
        $countDipertimbangkan = $assessedCandidates->filter(fn($k) => $k['dominant_rekomendasi'] === 'dipertimbangkan')->count();
        $countTidakDisarankan = $assessedCandidates->filter(fn($k) => $k['dominant_rekomendasi'] === 'tidak_disarankan')->count();

        // Parameter-level average across all candidates
        $parameterSummary = $activeParams->map(function ($param) use ($assessedCandidates) {
            $scores = $assessedCandidates->flatMap->parameter_scores->where('parameter_id', $param->id)->filter(fn($ps) => $ps['avg_skor'] !== null);
            $avgSkor = $scores->isNotEmpty() ? round($scores->avg('avg_skor'), 2) : 0;
            $avgScale100 = round(($avgSkor / 5) * 100, 1);

            return [
                'parameter_id' => $param->id,
                'parameter_name' => $param->parameter,
                'bobot' => (int) $param->bobot,
                'avg_skor' => $avgSkor,
                'avg_nilai_100' => $avgScale100,
                'evaluasi_count' => $scores->count(),
            ];
        })->values()->all();

        // Top 3 Leaderboard performers
        $topPerformers = collect($kandidats)
            ->filter(fn($k) => $k['has_assessment'] && $k['avg_nilai_akhir'] !== null)
            ->sortByDesc('avg_nilai_akhir')
            ->take(3)
            ->values()
            ->all();

        return Inertia::render('penilaian-skill-test/LowonganKandidat', [
            'lowongan' => [
                'id' => $lowongan->id,
                'kode_lowongan' => $lowongan->kode_lowongan,
                'judul' => $lowongan->judul,
                'status' => $lowongan->status,
                'tgl_buka' => $lowongan->tgl_buka ? $lowongan->tgl_buka->isoFormat('D MMM Y') : null,
                'tgl_tutup' => $lowongan->tgl_tutup ? $lowongan->tgl_tutup->isoFormat('D MMM Y') : null,
                'tipe_pekerjaan' => $lowongan->tipe_pekerjaan,
                'lokasi_kerja' => $lowongan->lokasi_kerja,
                'jumlah_dibutuhkan' => (int) $lowongan->jumlah_dibutuhkan,
                'departement' => [
                    'id' => $lowongan->departement?->id,
                    'kd_departement' => $lowongan->departement?->kd_departement ?? '',
                    'deskripsi' => $lowongan->departement?->deskripsi ?? 'General',
                ],
                'jabatan' => [
                    'id' => $jabatan?->id,
                    'kd_jabatan' => $jabatan?->kd_jabatan ?? '',
                    'nama_jabatan' => $jabatan?->nama_jabatan ?? $lowongan->judul,
                ],
                'parameter_config' => [
                    'count' => $parameterCount,
                    'total_bobot' => $totalBobot,
                    'total_items_dinilai' => $totalItemsDinilai,
                    'is_ready' => $parameterCount > 0,
                    'parameters' => $activeParams->map(fn($param) => [
                        'id' => $param->id,
                        'parameter' => $param->parameter,
                        'bobot' => (int) $param->bobot,
                        'items_count' => $param->details->count(),
                    ])->values()->all(),
                ],
                'stats' => [
                    'total_stage' => $stagePelamars->count(),
                    'selesai' => $kandidatSelesai,
                    'draft' => $kandidatDraft,
                    'belum_dinilai' => $kandidatBelum,
                ],
            ],
            'summary' => [
                'total_kandidat' => $stagePelamars->count(),
                'total_dinilai' => $assessedCandidates->count(),
                'avg_all_candidates' => $avgAllCandidates,
                'highest_score' => $highestScore,
                'lowest_score' => $lowestScore,
                'recommendations' => [
                    'disarankan' => $countDisarankan,
                    'dipertimbangkan' => $countDipertimbangkan,
                    'tidak_disarankan' => $countTidakDisarankan,
                ],
                'parameters_summary' => $parameterSummary,
                'top_performers' => $topPerformers,
            ],
            'kandidats' => $kandidats,
            'currentUser' => [
                'id' => Auth::id(),
                'name' => Auth::user()?->name ?? 'Penguji',
                'role' => Auth::user()?->role?->name ?? '',
                'can_manage_recruitment' => Auth::user()?->can('manage-permintaan-rekrutmen') || in_array(Auth::user()?->role?->name, ['super-admin', 'hr', 'hr-manager', 'admin']),
            ],
            'tahapConfig' => $config,
        ]);
    }

    /**
     * Show the assessment form for a candidate in the resolved stage.
     */
    public function create(Request $request, Pelamar $pelamar): Response|RedirectResponse
    {
        $tahap = $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);
        $currentUserId = Auth::id();
        
        // If current user already has an assessment for this candidate in this stage, redirect to edit it
        $myAssessment = $pelamar->penilaianSkillTests()->where('penguji_id', $currentUserId)->where('jenis_tahap', $tahap)->first();
        if ($myAssessment && !$request->has('new')) {
            return redirect()->route("{$config['route_prefix']}.edit", $myAssessment->id);
        }

        $lowongan = $pelamar->lowongan;
        $jabatan = $lowongan?->jabatan;
        $kdJabatan = $jabatan?->kd_jabatan;

        // Fetch parameters configured for this position and stage
        $parameters = ParameterSkillTest::with('details')
            ->where('kd_jabatan', $kdJabatan)
            ->where('jenis_tahap', $tahap)
            ->where('active', true)
            ->orderBy('urutan')
            ->get()
            ->map(function (ParameterSkillTest $param) {
                return [
                    'id' => $param->id,
                    'parameter' => $param->parameter,
                    'bobot' => (int) $param->bobot,
                    'urutan' => (int) $param->urutan,
                    'details' => $param->details->map(fn(DetailParameterSkillTest $d) => [
                        'id' => $d->id,
                        'yang_dinilai' => $d->yang_dinilai,
                        'urutan' => (int) $d->urutan,
                    ])->all(),
                ];
            });

        // Load other examiners' assessments for context
        $otherAssessments = $pelamar->penilaianSkillTests()
            ->where('jenis_tahap', $tahap)
            ->with('penguji')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'nama_penguji' => $p->nama_penguji ?: ($p->penguji?->name ?? 'Penguji'),
                'tanggal_test' => $p->tanggal_test ? $p->tanggal_test->isoFormat('D MMMM Y') : null,
                'nilai_akhir' => (float) $p->nilai_akhir,
                'rekomendasi' => $p->rekomendasi,
                'status' => $p->status,
            ]);

        return Inertia::render('penilaian-skill-test/Form', [
            'pelamar' => [
                'id' => $pelamar->id,
                'no_pendaftaran' => $pelamar->no_pendaftaran,
                'nama_lengkap' => $pelamar->nama_lengkap,
                'email' => $pelamar->email,
                'nomor_kontak' => $pelamar->nomor_kontak,
                'posisi_dilamar' => $pelamar->posisi_dilamar,
                'kd_jabatan' => $kdJabatan,
                'nama_jabatan' => $jabatan?->nama_jabatan ?? $pelamar->posisi_dilamar,
                'departement' => $jabatan?->departement?->deskripsi ?? 'General',
            ],
            'parameters' => $parameters,
            'existingAssessment' => null,
            'otherAssessments' => $otherAssessments,
            'currentUser' => [
                'id' => Auth::id(),
                'name' => Auth::user()?->name ?? 'Penguji',
            ],
            'tahapConfig' => $config,
        ]);
    }

    /**
     * Store a newly created assessment for the resolved stage.
     */
    public function store(Request $request, Pelamar $pelamar): RedirectResponse
    {
        $tahap = $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $validated = $request->validate([
            'tanggal_test' => ['required', 'date'],
            'nama_penguji' => ['nullable', 'string', 'max:255'],
            'rekomendasi' => ['required', 'in:disarankan,dipertimbangkan,tidak_disarankan'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'in:draft,final'],
            'scores' => ['required', 'array', 'min:1'],
            'scores.*.parameter_skill_test_id' => ['required', 'exists:parameter_skill_tests,id'],
            'scores.*.detail_parameter_skill_test_id' => ['required', 'exists:detail_parameter_skill_tests,id'],
            'scores.*.skor' => ['required', 'integer', 'min:1', 'max:5'],
            'scores.*.catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $jabatan = $pelamar->lowongan?->jabatan;
        $kdJabatan = $jabatan?->kd_jabatan ?? $pelamar->posisi_dilamar;

        // Fetch active parameters for calculation
        $parameters = ParameterSkillTest::where('kd_jabatan', $kdJabatan)
            ->where('jenis_tahap', $tahap)
            ->where('active', true)
            ->with('details')
            ->get();

        $scoresCollection = collect($validated['scores']);
        $totalBobotSum = $parameters->sum('bobot') ?: 100;
        $weightedScoreSum = 0;

        foreach ($parameters as $param) {
            $paramDetailIds = $param->details->pluck('id');
            $matchingScores = $scoresCollection->whereIn('detail_parameter_skill_test_id', $paramDetailIds);
            
            $paramAverageSkor = $matchingScores->isNotEmpty() ? $matchingScores->avg('skor') : 3;
            $weightedScoreSum += ($paramAverageSkor * ($param->bobot / $totalBobotSum));
        }

        $totalSkor = round($weightedScoreSum, 2);
        $nilaiAkhir = round(($totalSkor / 5) * 100, 2);

        $penilaian = DB::transaction(function () use ($validated, $pelamar, $kdJabatan, $totalSkor, $nilaiAkhir, $tahap) {
            $penilaian = PenilaianSkillTest::create([
                'pelamar_id' => $pelamar->id,
                'kd_jabatan' => $kdJabatan,
                'jenis_tahap' => $tahap,
                'penguji_id' => Auth::id(),
                'nama_penguji' => $validated['nama_penguji'] ?: (Auth::user()?->name ?? 'Penguji'),
                'tanggal_test' => $validated['tanggal_test'],
                'total_skor' => $totalSkor,
                'nilai_akhir' => $nilaiAkhir,
                'rekomendasi' => $validated['rekomendasi'],
                'catatan' => $validated['catatan'] ?? null,
                'status' => $validated['status'],
            ]);

            foreach ($validated['scores'] as $scoreItem) {
                DetailPenilaianSkillTest::create([
                    'penilaian_skill_test_id' => $penilaian->id,
                    'parameter_skill_test_id' => $scoreItem['parameter_skill_test_id'],
                    'detail_parameter_skill_test_id' => $scoreItem['detail_parameter_skill_test_id'],
                    'skor' => $scoreItem['skor'],
                    'catatan' => $scoreItem['catatan'] ?? null,
                ]);
            }

            return $penilaian;
        });

        $msg = $validated['status'] === 'final'
            ? "Penilaian {$config['title']} untuk {$pelamar->nama_lengkap} berhasil disimpan dan difinalisasi."
            : "Draft penilaian {$config['title']} untuk {$pelamar->nama_lengkap} berhasil disimpan sebagai draft.";

        if ($pelamar->lowongan_id) {
            return redirect()->route("{$config['route_prefix']}.lowongan", $pelamar->lowongan_id)->with('success', $msg);
        }

        return redirect()->route("{$config['route_prefix']}.show", $penilaian->id)->with('success', $msg);
    }

    /**
     * Show the assessment detail / result report.
     */
    public function show(Request $request, PenilaianSkillTest $penilaian): Response
    {
        $penilaian->load([
            'pelamar.lowongan.departement',
            'pelamar.lowongan.jabatan',
            'penguji',
            'details.parameterSkillTest',
            'details.detailParameterSkillTest',
        ]);

        $tahap = $penilaian->jenis_tahap ?: $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $pelamar = $penilaian->pelamar;
        $lowongan = $pelamar?->lowongan;
        $jabatan = $lowongan?->jabatan;

        // Group details by parameter
        $groupedDetails = $penilaian->details->groupBy('parameter_skill_test_id')->map(function ($details, $paramId) {
            $param = $details->first()?->parameterSkillTest;
            $avgSkor = round($details->avg('skor'), 2);
            $nilaiScale100 = round(($avgSkor / 5) * 100, 1);

            return [
                'parameter_id' => $paramId,
                'parameter_name' => $param?->parameter ?? 'Parameter',
                'bobot' => (int) ($param?->bobot ?? 0),
                'avg_skor' => $avgSkor,
                'nilai_100' => $nilaiScale100,
                'items' => $details->map(fn($d) => [
                    'id' => $d->id,
                    'yang_dinilai' => $d->detailParameterSkillTest?->yang_dinilai ?? 'Item',
                    'skor' => (int) $d->skor,
                    'catatan' => $d->catatan,
                ])->values()->all(),
            ];
        })->values()->all();

        return Inertia::render('penilaian-skill-test/Show', [
            'penilaian' => [
                'id' => $penilaian->id,
                'tanggal_test' => $penilaian->tanggal_test ? $penilaian->tanggal_test->isoFormat('D MMMM Y') : null,
                'tanggal_test_raw' => $penilaian->tanggal_test ? $penilaian->tanggal_test->format('Y-m-d') : null,
                'total_skor' => (float) $penilaian->total_skor,
                'nilai_akhir' => (float) $penilaian->nilai_akhir,
                'rekomendasi' => $penilaian->rekomendasi,
                'catatan' => $penilaian->catatan,
                'status' => $penilaian->status,
                'nama_penguji' => $penilaian->nama_penguji ?: ($penilaian->penguji?->name ?? 'Penguji'),
                'created_at' => $penilaian->created_at ? $penilaian->created_at->isoFormat('D MMMM Y, HH:mm') : null,
                'pelamar' => [
                    'id' => $pelamar?->id,
                    'no_pendaftaran' => $pelamar?->no_pendaftaran,
                    'nama_lengkap' => $pelamar?->nama_lengkap,
                    'email' => $pelamar?->email,
                    'nomor_kontak' => $pelamar?->nomor_kontak,
                    'posisi_dilamar' => $pelamar?->posisi_dilamar,
                    'pendidikan_terakhir' => $pelamar?->pendidikan_terakhir,
                    'nama_institusi' => $pelamar?->nama_institusi,
                    'jurusan' => $pelamar?->jurusan,
                    'status' => $pelamar?->status,
                ],
                'lowongan' => $lowongan ? [
                    'id' => $lowongan->id,
                    'kode_lowongan' => $lowongan->kode_lowongan,
                    'judul' => $lowongan->judul,
                    'departemen_nama' => $lowongan->departement?->deskripsi ?? 'General',
                    'posisi_nama' => $jabatan?->nama_jabatan ?? $lowongan->judul,
                    'kd_jabatan' => $jabatan?->kd_jabatan ?? '',
                ] : null,
                'grouped_parameters' => $groupedDetails,
            ],
            'canEdit' => Auth::id() === $penilaian->penguji_id || in_array(Auth::user()?->role?->name, ['super-admin', 'hr', 'hr-manager', 'admin']),
            'tahapConfig' => $config,
        ]);
    }

    /**
     * Show the edit form for an existing assessment.
     */
    public function edit(Request $request, PenilaianSkillTest $penilaian): Response
    {
        $penilaian->load([
            'pelamar.lowongan.departement',
            'pelamar.lowongan.jabatan',
            'details',
        ]);

        $tahap = $penilaian->jenis_tahap ?: $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $pelamar = $penilaian->pelamar;
        $lowongan = $pelamar?->lowongan;
        $jabatan = $lowongan?->jabatan;
        $kdJabatan = $jabatan?->kd_jabatan;

        $parameters = ParameterSkillTest::with('details')
            ->where('kd_jabatan', $kdJabatan)
            ->where('jenis_tahap', $tahap)
            ->where('active', true)
            ->orderBy('urutan')
            ->get()
            ->map(function (ParameterSkillTest $param) {
                return [
                    'id' => $param->id,
                    'parameter' => $param->parameter,
                    'bobot' => (int) $param->bobot,
                    'urutan' => (int) $param->urutan,
                    'details' => $param->details->map(fn(DetailParameterSkillTest $d) => [
                        'id' => $d->id,
                        'yang_dinilai' => $d->yang_dinilai,
                        'urutan' => (int) $d->urutan,
                    ])->all(),
                ];
            });

        $scoresMap = $penilaian->details->mapWithKeys(function (DetailPenilaianSkillTest $d) {
            return [$d->detail_parameter_skill_test_id => [
                'skor' => (int) $d->skor,
                'catatan' => $d->catatan ?? '',
            ]];
        })->all();

        return Inertia::render('penilaian-skill-test/Form', [
            'pelamar' => [
                'id' => $pelamar?->id,
                'no_pendaftaran' => $pelamar?->no_pendaftaran,
                'nama_lengkap' => $pelamar?->nama_lengkap,
                'email' => $pelamar?->email,
                'nomor_kontak' => $pelamar?->nomor_kontak,
                'posisi_dilamar' => $pelamar?->posisi_dilamar,
                'kd_jabatan' => $kdJabatan,
                'nama_jabatan' => $jabatan?->nama_jabatan ?? $pelamar?->posisi_dilamar,
                'departement' => $jabatan?->departement?->deskripsi ?? 'General',
            ],
            'parameters' => $parameters,
            'existingAssessment' => [
                'id' => $penilaian->id,
                'tanggal_test' => $penilaian->tanggal_test ? $penilaian->tanggal_test->format('Y-m-d') : date('Y-m-d'),
                'nama_penguji' => $penilaian->nama_penguji,
                'rekomendasi' => $penilaian->rekomendasi,
                'catatan' => $penilaian->catatan,
                'status' => $penilaian->status,
                'scores_map' => $scoresMap,
            ],
            'currentUser' => [
                'id' => Auth::id(),
                'name' => Auth::user()?->name ?? 'Penguji',
            ],
            'tahapConfig' => $config,
        ]);
    }

    /**
     * Update an existing assessment.
     */
    public function update(Request $request, PenilaianSkillTest $penilaian): RedirectResponse
    {
        $tahap = $penilaian->jenis_tahap ?: $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $validated = $request->validate([
            'tanggal_test' => ['required', 'date'],
            'nama_penguji' => ['nullable', 'string', 'max:255'],
            'rekomendasi' => ['required', 'in:disarankan,dipertimbangkan,tidak_disarankan'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'in:draft,final'],
            'scores' => ['required', 'array', 'min:1'],
            'scores.*.parameter_skill_test_id' => ['required', 'exists:parameter_skill_tests,id'],
            'scores.*.detail_parameter_skill_test_id' => ['required', 'exists:detail_parameter_skill_tests,id'],
            'scores.*.skor' => ['required', 'integer', 'min:1', 'max:5'],
            'scores.*.catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $pelamar = $penilaian->pelamar;
        $kdJabatan = $penilaian->kd_jabatan;

        $parameters = ParameterSkillTest::where('kd_jabatan', $kdJabatan)
            ->where('jenis_tahap', $tahap)
            ->where('active', true)
            ->with('details')
            ->get();

        $scoresCollection = collect($validated['scores']);
        $totalBobotSum = $parameters->sum('bobot') ?: 100;
        $weightedScoreSum = 0;

        foreach ($parameters as $param) {
            $paramDetailIds = $param->details->pluck('id');
            $matchingScores = $scoresCollection->whereIn('detail_parameter_skill_test_id', $paramDetailIds);
            
            $paramAverageSkor = $matchingScores->isNotEmpty() ? $matchingScores->avg('skor') : 3;
            $weightedScoreSum += ($paramAverageSkor * ($param->bobot / $totalBobotSum));
        }

        $totalSkor = round($weightedScoreSum, 2);
        $nilaiAkhir = round(($totalSkor / 5) * 100, 2);

        DB::transaction(function () use ($validated, $penilaian, $totalSkor, $nilaiAkhir) {
            $penilaian->update([
                'nama_penguji' => $validated['nama_penguji'] ?: $penilaian->nama_penguji,
                'tanggal_test' => $validated['tanggal_test'],
                'total_skor' => $totalSkor,
                'nilai_akhir' => $nilaiAkhir,
                'rekomendasi' => $validated['rekomendasi'],
                'catatan' => $validated['catatan'] ?? null,
                'status' => $validated['status'],
            ]);

            $penilaian->details()->delete();

            foreach ($validated['scores'] as $scoreItem) {
                DetailPenilaianSkillTest::create([
                    'penilaian_skill_test_id' => $penilaian->id,
                    'parameter_skill_test_id' => $scoreItem['parameter_skill_test_id'],
                    'detail_parameter_skill_test_id' => $scoreItem['detail_parameter_skill_test_id'],
                    'skor' => $scoreItem['skor'],
                    'catatan' => $scoreItem['catatan'] ?? null,
                ]);
            }
        });

        $msg = $validated['status'] === 'final'
            ? "Penilaian {$config['title']} berhasil diperbarui dan difinalisasi."
            : "Draft penilaian {$config['title']} berhasil diperbarui.";

        if ($pelamar && $pelamar->lowongan_id) {
            return redirect()->route("{$config['route_prefix']}.lowongan", $pelamar->lowongan_id)->with('success', $msg);
        }

        return redirect()->route("{$config['route_prefix']}.show", $penilaian->id)->with('success', $msg);
    }

    /**
     * Remove an assessment.
     */
    public function destroy(Request $request, PenilaianSkillTest $penilaian): RedirectResponse
    {
        $tahap = $penilaian->jenis_tahap ?: $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);
        $lowonganId = $penilaian->pelamar?->lowongan_id;

        $penilaian->delete();

        if ($lowonganId) {
            return redirect()->route("{$config['route_prefix']}.lowongan", $lowonganId)->with('success', "Penilaian {$config['title']} berhasil dihapus.");
        }

        return redirect()->route("{$config['route_prefix']}.index")->with('success', "Penilaian {$config['title']} berhasil dihapus.");
    }
}
