<?php

namespace App\Services;

use App\Models\AtsScreening;
use App\Models\KriteriaAts;
use App\Models\Pelamar;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AtsScreeningService
{
    protected PdfToMarkdownService $pdfToMarkdownService;

    public function __construct(PdfToMarkdownService $pdfToMarkdownService)
    {
        $this->pdfToMarkdownService = $pdfToMarkdownService;
    }

    /**
     * Run automated ATS CV screening for a candidate.
     */
    public function screen(Pelamar $pelamar): AtsScreening
    {
        $pelamar->loadMissing([
            'lowongan.departement',
            'lowongan.jabatan',
            'formulirLamaran',
        ]);

        $divisi = $this->determineDivisi($pelamar);
        $extractedText = $this->extractCandidateText($pelamar);
        $parsedData = $this->parseCandidateData($pelamar, $extractedText);

        // 1. Try AI-Powered Screening via Vendorarouter / 9Router
        $aiResult = $this->evaluateWithAi($divisi, $pelamar, $parsedData, $extractedText);

        if ($aiResult && !empty($aiResult['kriteria'])) {
            $totalSkor = $aiResult['total_skor'];
            $rekomendasi = $aiResult['rekomendasi'];
            $catatanAts = $aiResult['catatan_ats'];
            $kriteriaEvaluation = $aiResult['kriteria'];
        } else {
            // 2. Safe Fallback: Rule-Based Evaluation
            $evaluation = $this->evaluateCriteria($divisi, $pelamar, $parsedData, $extractedText);
            $totalSkor = $evaluation['total_skor'];
            $rekomendasi = $this->determineRekomendasi($totalSkor);
            $catatanAts = $this->generateSummaryNotes($divisi, $totalSkor, $rekomendasi, $evaluation['kriteria']);
            $kriteriaEvaluation = $evaluation['kriteria'];
        }

        $screening = AtsScreening::updateOrCreate(
            ['pelamar_id' => $pelamar->id],
            [
                'lowongan_id' => $pelamar->lowongan_id,
                'divisi' => $divisi,
                'total_skor' => $totalSkor,
                'rekomendasi' => $rekomendasi,
                'status_konfirmasi' => 'menunggu_konfirmasi', // Menunggu konfirmasi HR
                'kriteria_penilaian' => $kriteriaEvaluation,
                'cv_parsed_data' => $parsedData,
                'catatan_ats' => $catatanAts,
            ]
        );

        return $screening;
    }

    /**
     * Determine the position division matching the exact codes:
     * H1 (Marketing), HC3 (Pelayanan Customer), H2 (Service Motor), IT, HRD, Finance, H3 (Part Motor).
     */
    public function determineDivisi(Pelamar $pelamar): string
    {
        $kdDept = strtoupper($pelamar->lowongan?->departement?->kd_departement ?? '');
        if ($kdDept === 'H1') {
            return 'H1';
        }
        if ($kdDept === 'H2') {
            return 'H2';
        }
        if ($kdDept === 'H3') {
            return 'H3';
        }
        if ($kdDept === 'HC3') {
            return 'HC3';
        }
        if ($kdDept === 'IT') {
            return 'IT';
        }
        if ($kdDept === 'HR' || $kdDept === 'HRD') {
            return 'HRD';
        }
        if ($kdDept === 'FINANCE' || $kdDept === 'FIN') {
            return 'Finance';
        }

        $textToMatch = strtolower(implode(' ', [
            $pelamar->posisi_dilamar ?? '',
            $pelamar->lowongan?->judul ?? '',
            $pelamar->lowongan?->jabatan?->nama_jabatan ?? '',
            $pelamar->lowongan?->departement?->deskripsi ?? '',
        ]));

        if (preg_match('/(service|teknisi|mekanik|bengkel|mesin|otomotif|motor|tune up|h2)/i', $textToMatch)) {
            return 'H2';
        }
        if (preg_match('/(part|sparepart|suku cadang|gudang|inventory|logistik|h3)/i', $textToMatch)) {
            return 'H3';
        }
        if (preg_match('/(customer|pelayanan|call center|cs|front office|helpdesk|hc3)/i', $textToMatch)) {
            return 'HC3';
        }
        if (preg_match('/(market|sales|penjualan|promo|branding|digital market|h1)/i', $textToMatch)) {
            return 'H1';
        }
        if (preg_match('/(it|program|developer|engineer|software|jaringan|network|sistem informasi|database|sql|qa|komputer)/i', $textToMatch)) {
            return 'IT';
        }
        if (preg_match('/(finance|akuntan|accounting|pajak|tax|kasir|keuangan|audit|brevet)/i', $textToMatch)) {
            return 'Finance';
        }
        if (preg_match('/(hrd|human resource|recruitment|personalia|sdm|payroll)/i', $textToMatch)) {
            return 'HRD';
        }

        return 'H1';
    }

    /**
     * Get or generate structured Markdown document from candidate's profile, form, and PDF CV.
     * Cached in database `rekrutmen.pelamars.cv_markdown` for 0ms subsequent reads.
     */
    public function getCandidateMarkdown(Pelamar $pelamar): string
    {
        // 1. Return immediately if already parsed & cached in database
        if (!empty($pelamar->cv_markdown)) {
            return $pelamar->cv_markdown;
        }

        $mdSections = [];

        // Header identity
        $mdSections[] = "# " . strtoupper($pelamar->nama_lengkap ?? 'KANDIDAT');
        $mdSections[] = "**Posisi Dilamar**: " . ($pelamar->posisi_dilamar ?: $pelamar->lowongan?->judul ?: '-');
        $mdSections[] = "**Pendidikan Terakhir**: " . ($pelamar->pendidikan_terakhir ?: '-') . " - " . ($pelamar->jurusan ?: '-') . " (" . ($pelamar->nama_institusi ?: '-') . ")";
        $mdSections[] = "**Tahun Lulus**: " . ($pelamar->tahun_lulus ?: '-');
        if (!empty($pelamar->email)) {
            $mdSections[] = "**Email**: " . $pelamar->email;
        }
        if (!empty($pelamar->nomor_kontak)) {
            $mdSections[] = "**Kontak**: " . $pelamar->nomor_kontak;
        }

        // Formulir Lamaran sections if available
        if ($pelamar->formulirLamaran) {
            $f = $pelamar->formulirLamaran;
            if (!empty($f->pengalaman_kerja)) {
                $mdSections[] = "\n## Riwayat Pengalaman Kerja";
                $expList = is_array($f->pengalaman_kerja) ? $f->pengalaman_kerja : json_decode($f->pengalaman_kerja, true);
                if (is_array($expList)) {
                    foreach ($expList as $item) {
                        if (is_array($item)) {
                            $posisi = $item['posisi'] ?? $item['jabatan'] ?? 'Pekerjaan';
                            $perusahaan = $item['perusahaan'] ?? $item['nama_perusahaan'] ?? '';
                            $lama = $item['lama_bekerja'] ?? $item['tahun'] ?? '';
                            $deskripsi = $item['deskripsi_tugas'] ?? $item['deskripsi'] ?? '';
                            $mdSections[] = "- **{$posisi}** di {$perusahaan} ({$lama})" . ($deskripsi ? ": {$deskripsi}" : "");
                        }
                    }
                }
            }

            if (!empty($f->minat_keahlian)) {
                $mdSections[] = "\n## Keterampilan & Keahlian";
                $skills = is_array($f->minat_keahlian) ? $f->minat_keahlian : json_decode($f->minat_keahlian, true);
                if (is_array($skills)) {
                    foreach ($skills as $s) {
                        $val = is_string($s) ? $s : ($s['nama'] ?? $s['keahlian'] ?? '');
                        if (!empty($val)) {
                            $mdSections[] = "- {$val}";
                        }
                    }
                }
            }
        }

        // High accuracy PDF CV conversion to Markdown via Smalot & PdfToMarkdownService
        if (!empty($pelamar->cv_path) && !str_starts_with($pelamar->cv_path, 'http')) {
            $pdfMarkdown = $this->pdfToMarkdownService->convertPdfToMarkdown($pelamar->cv_path);
            if (!empty($pdfMarkdown)) {
                $mdSections[] = "\n## Isi Dokumen CV (PDF)\n" . $pdfMarkdown;
            }
        }

        $fullMarkdown = trim(implode("\n", $mdSections));

        // Save to database so all future screenings are 0ms
        if (!empty($fullMarkdown)) {
            try {
                $pelamar->updateQuietly(['cv_markdown' => $fullMarkdown]);
            } catch (\Throwable $e) {
                Log::warning("Gagal menyimpan cv_markdown pelamar {$pelamar->id}: " . $e->getMessage());
            }
        }

        return $fullMarkdown;
    }

    /**
     * Extract full searchable text from candidate record, profile, formulir, and Markdown CV.
     */
    public function extractCandidateText(Pelamar $pelamar): string
    {
        $markdown = $this->getCandidateMarkdown($pelamar);
        if (!empty($markdown)) {
            return strtolower($markdown);
        }

        $chunks = [
            $pelamar->nama_lengkap,
            $pelamar->pendidikan_terakhir,
            $pelamar->nama_institusi,
            $pelamar->jurusan,
            $pelamar->tahun_lulus,
            $pelamar->posisi_dilamar,
            $pelamar->catatan,
        ];

        return strtolower(implode(' ', array_filter($chunks)));
    }

    /**
     * Parse structured attributes from candidate data.
     */
    protected function parseCandidateData(Pelamar $pelamar, string $fullText): array
    {
        $currentYear = (int) date('Y');
        $gradYear = (int) ($pelamar->tahun_lulus ?: $currentYear);
        $yearsSinceGrad = max(0, $currentYear - $gradYear);

        // Estimate experience years
        $expYears = 1;
        if ($yearsSinceGrad >= 4) {
            $expYears = 3;
        } elseif ($yearsSinceGrad >= 2) {
            $expYears = 2;
        } elseif ($yearsSinceGrad >= 1) {
            $expYears = 1;
        }

        // Check if formulir has experiences
        if ($pelamar->formulirLamaran && !empty($pelamar->formulirLamaran->pengalaman_kerja)) {
            $expList = is_array($pelamar->formulirLamaran->pengalaman_kerja)
                ? $pelamar->formulirLamaran->pengalaman_kerja
                : json_decode($pelamar->formulirLamaran->pengalaman_kerja, true);
            if (is_array($expList) && count($expList) > 0) {
                $expYears = max($expYears, count($expList));
            }
        }

        // Detect keywords present
        $detectedSkills = [];
        $allKnownKeywords = [
            'sql', 'database', 'mysql', 'postgresql', 'networking', 'mikrotik', 'cisco',
            'windows server', 'linux', 'python', 'php', 'laravel', 'react', 'typescript',
            'javascript', 'it support', 'troubleshooting', 'docker', 'git', 'api',
            'marketing', 'digital marketing', 'target penjualan', 'negosiasi', 'public speaking',
            'seo', 'sem', 'google ads', 'meta ads', 'canva', 'desain', 'crm',
            'customer handling', 'complaint handling', 'call center', 'zendesk', 'microsoft office',
            'excel', 'word', 'powerpoint', 'komunikasi',
            'smk otomotif', 'bengkel', 'honda', 'yamaha', 'diagnosis motor', 'injeksi',
            'kelistrikan', 'tune up', 'scanner', 'engine', 'mekanik',
            'recruitment', 'payroll', 'training', 'uu ketenagakerjaan', 'bpjs',
            'employee relations', 'administrasi hr', 'psikotes',
            'akuntansi', 'accurate', 'sap', 'jurnal', 'pajak', 'brevet', 'financial reporting', 'audit',
            'inventory management', 'gudang', 'sparepart', 'stock opname', 'erp', 'kode part',
        ];

        foreach ($allKnownKeywords as $kw) {
            if (str_contains($fullText, $kw)) {
                $detectedSkills[] = ucwords($kw);
            }
        }

        return [
            'nama_kandidat' => $pelamar->nama_lengkap,
            'pendidikan' => ($pelamar->pendidikan_terakhir ?? '-') . ' - ' . ($pelamar->jurusan ?? '-'),
            'institusi' => $pelamar->nama_institusi ?? '-',
            'tahun_lulus' => $pelamar->tahun_lulus ?? '-',
            'pengalaman_tahun' => $expYears,
            'pengalaman_label' => "{$expYears} Tahun",
            'skills' => array_slice(array_unique($detectedSkills), 0, 10),
            'bahasa' => str_contains($fullText, 'inggris') || str_contains($fullText, 'english') ? ['Indonesia', 'Inggris'] : ['Indonesia'],
            'sertifikasi' => str_contains($fullText, 'sertifikat') || str_contains($fullText, 'brevet') || str_contains($fullText, 'cisco') ? 'Ada' : '-',
        ];
    }

    /**
     * Dynamically evaluate candidate criteria from the `rekrutmen.kriteria_ats` database table!
     */
    public function evaluateCriteria(string $divisi, Pelamar $pelamar, array $parsed, string $fullText): array
    {
        $kriteriaModels = KriteriaAts::getCriteriaFor($pelamar->lowongan_id, $divisi);

        $kriteria = [];
        $totalSkorRaw = 0;
        $totalBobotMax = 0;

        $pendidikan = strtolower($pelamar->pendidikan_terakhir ?? '');
        $jurusan = strtolower($pelamar->jurusan ?? '');
        $expYears = $parsed['pengalaman_tahun'];

        foreach ($kriteriaModels as $crit) {
            $bobotMax = (int) $crit->bobot;
            $totalBobotMax += $bobotMax;
            $keywords = $crit->keywords ?? [];

            $nilai = 0;
            $dataKandidat = '';
            $statusCocok = false;

            switch ($crit->tipe_penilaian) {
                case 'pendidikan':
                    $matchesEduMajor = false;
                    foreach ($keywords as $kw) {
                        if (str_contains($jurusan, strtolower($kw)) || str_contains($fullText, strtolower($kw))) {
                            $matchesEduMajor = true;
                            break;
                        }
                    }

                    $isHigherEdu = in_array(strtoupper($pendidikan), ['S1', 'D4', 'S2', 'D3']);
                    if ($crit->divisi === 'H2') { 
                        $isSmk = str_contains($pendidikan, 'smk') || str_contains($pendidikan, 'sma');
                        if ($matchesEduMajor && $isSmk) {
                            $nilai = $bobotMax;
                            $statusCocok = true;
                        } elseif ($matchesEduMajor) {
                            $nilai = (int) round($bobotMax * 0.85);
                            $statusCocok = true;
                        } else {
                            $nilai = (int) round($bobotMax * 0.50);
                        }
                    } else {
                        if ($matchesEduMajor && $isHigherEdu) {
                            $nilai = $bobotMax;
                            $statusCocok = true;
                        } elseif ($matchesEduMajor || $isHigherEdu) {
                            $nilai = (int) round($bobotMax * 0.80);
                            $statusCocok = true;
                        } else {
                            $nilai = (int) round($bobotMax * 0.50);
                        }
                    }

                    $dataKandidat = "{$pelamar->pendidikan_terakhir} {$pelamar->jurusan}";
                    break;

                case 'pengalaman':
                    // Check required experience years
                    $minExpRequired = 1;
                    if (str_contains(strtolower($crit->kebutuhan), '2 tahun')) {
                        $minExpRequired = 2;
                    }

                    if ($expYears >= $minExpRequired) {
                        $nilai = $bobotMax;
                        $statusCocok = true;
                    } elseif ($expYears >= 1) {
                        $nilai = (int) round($bobotMax * 0.75);
                        $statusCocok = true;
                    } else {
                        $nilai = (int) round($bobotMax * 0.40);
                    }

                    $dataKandidat = "{$expYears} tahun (" . ($pelamar->nama_institusi ?? 'Pengalaman Terdaftar') . ')';
                    break;

                case 'sertifikasi':
                    $foundCert = false;
                    $matchedCerts = [];
                    foreach ($keywords as $kw) {
                        if (str_contains($fullText, strtolower($kw))) {
                            $foundCert = true;
                            $matchedCerts[] = ucwords($kw);
                        }
                    }

                    if ($foundCert) {
                        $nilai = $bobotMax;
                        $statusCocok = true;
                        $dataKandidat = 'Ada (' . implode(', ', array_slice($matchedCerts, 0, 2)) . ')';
                    } else {
                        $nilai = (int) round($bobotMax * 0.40);
                        $dataKandidat = 'Belum bersertifikat pabrikan';
                    }
                    break;

                default: // 'keyword' / Skill
                    $matchedKeywords = [];
                    foreach ($keywords as $kw) {
                        if (str_contains($fullText, strtolower($kw))) {
                            $matchedKeywords[] = ucwords($kw);
                        }
                    }

                    if (count($matchedKeywords) >= 2) {
                        $nilai = $bobotMax;
                        $statusCocok = true;
                        $dataKandidat = 'Ada (' . implode(', ', array_slice($matchedKeywords, 0, 3)) . ')';
                    } elseif (count($matchedKeywords) === 1) {
                        $nilai = (int) round($bobotMax * 0.85);
                        $statusCocok = true;
                        $dataKandidat = 'Ada (' . $matchedKeywords[0] . ')';
                    } else {
                        $nilai = (int) round($bobotMax * 0.45);
                        $dataKandidat = 'Dasar / Belum terdeteksi';
                    }
                    break;
            }

            $totalSkorRaw += $nilai;

            $kriteria[] = [
                'kriteria' => $crit->nama_kriteria,
                'kebutuhan' => $crit->kebutuhan,
                'data_kandidat' => $dataKandidat,
                'nilai' => $nilai,
                'bobot_max' => $bobotMax,
                'status_cocok' => $statusCocok,
            ];
        }

        // Normalize total score to 100
        $normalizedScore = $totalBobotMax > 0
            ? min(100.0, round(($totalSkorRaw / $totalBobotMax) * 100))
            : $totalSkorRaw;

        return [
            'total_skor' => (float) $normalizedScore,
            'kriteria' => $kriteria,
        ];
    }

    /**
     * Determine ATS recommendation from score.
     */
    protected function determineRekomendasi(float $score): string
    {
        if ($score >= 75) {
            return 'sangat_disarankan'; // Top Candidate
        }
        if ($score >= 50) {
            return 'dipertimbangkan';
        }
        return 'tidak_disarankan';
    }

    /**
     * Generate textual ATS evaluation notes.
     */
    protected function generateSummaryNotes(string $divisi, float $score, string $rekomendasi, array $kriteria): string
    {
        $passedCount = count(array_filter($kriteria, fn ($k) => $k['status_cocok']));
        $totalCount = count($kriteria);

        $divisiLabels = [
            'H1' => 'H1 (Marketing & Sales)',
            'H2' => 'H2 (Service Motor / Teknisi)',
            'H3' => 'H3 (Part Motor / Sparepart)',
            'HC3' => 'HC3 (Pelayanan Customer)',
            'IT' => 'IT (Teknologi Informasi)',
            'HRD' => 'HRD (Personalia)',
            'Finance' => 'Finance & Accounting',
        ];
        $divisiName = $divisiLabels[$divisi] ?? $divisi;

        if ($rekomendasi === 'sangat_disarankan') {
            return "Kandidat memenuhi {$passedCount} dari {$totalCount} kriteria kebutuhan divisi {$divisiName} dengan sangat baik (Skor: {$score}/100). Direkomendasikan masuk dalam daftar Top Candidates untuk diloloskan ke tahapan seleksi berikutnya.";
        }

        if ($rekomendasi === 'dipertimbangkan') {
            return "Kandidat memenuhi {$passedCount} dari {$totalCount} kriteria kebutuhan divisi {$divisiName} (Skor: {$score}/100). Kualifikasi cukup memadai dan dipertimbangkan untuk tahapan seleksi lanjutan.";
        }

        return "Kandidat hanya memenuhi {$passedCount} dari {$totalCount} kriteria kebutuhan divisi {$divisiName} (Skor: {$score}/100). Beberapa kompetensi kunci belum terdeteksi secara optimal.";
    }

    /**
     * Resolve the active AI model name from config or fallback default.
     */
    public function resolveAiModel(): string
    {
        $configured = config('services.ai_router.model');
        if (!empty($configured)) {
            return $configured;
        }

        $cached = Cache::get('ai_router_active_model');
        if (!empty($cached)) {
            return $cached;
        }

        // Default verified model for vendorarouter
        return 'gemini-3.8-flash-high';
    }

    /**
     * AI-Powered CV Evaluation using Vendorarouter / 9Router (OpenAI-compatible)
    /**
     * Build system and user prompts for AI evaluation.
     */
    public function buildAiPrompts(string $divisi, Pelamar $pelamar, array $parsed, string $fullText, iterable $kriteriaModels): array
    {
        $criteriaList = [];
        foreach ($kriteriaModels as $crit) {
            $bobot = (int) $crit->bobot;
            $criteriaList[] = [
                'kriteria' => $crit->nama_kriteria,
                'kebutuhan' => $crit->kebutuhan,
                'bobot_max' => $bobot,
                'tipe_penilaian' => $crit->tipe_penilaian,
                'is_wajib' => (bool) $crit->is_wajib,
                'kata_kunci_terkait' => $crit->keywords ?? [],
            ];
        }

        $candidateMarkdown = $this->getCandidateMarkdown($pelamar);

        $candidateSummary = [
            'nama_lengkap' => $pelamar->nama_lengkap,
            'posisi_dilamar' => $pelamar->posisi_dilamar ?? $pelamar->lowongan?->judul ?? '-',
            'divisi_departemen' => $divisi,
            'pendidikan_terakhir' => ($pelamar->pendidikan_terakhir ?? '-') . ' ' . ($pelamar->jurusan ?? ''),
            'institusi_kampus' => $pelamar->nama_institusi ?? '-',
            'tahun_lulus' => $pelamar->tahun_lulus ?? '-',
            'estimasi_pengalaman' => $parsed['pengalaman_label'] ?? '-',
            'keahlian_terdeteksi' => $parsed['skills'] ?? [],
            'dokumen_cv_markdown' => !empty($candidateMarkdown) ? mb_substr($candidateMarkdown, 0, 3500) : mb_substr($fullText, 0, 2500),
        ];

        $systemPrompt = <<<PROMPT
Anda adalah AI Recruiter Expert ATS (Applicant Tracking System) untuk perusahaan rekrutmen profesional.
Tugas Anda adalah mengevaluasi kecocokan profil kandidat pelamar kerja dengan kriteria lowongan posisi secara objektif, kritis, profesional, dan adil berdasarkan profil dan isi CV kandidat dalam format Markdown terstruktur (.md).

ATURAN PENILAIAN:
1. Evaluasi SETIAP kriteria dari daftar yang diberikan tanpa ada yang terlewat.
   - "kriteria": nama kriteria persis seperti input
   - "kebutuhan": teks kebutuhan kriteria
   - "data_kandidat": ringkasan temuan fakta/bukti spesifik dari CV kandidat terkait kriteria tersebut (maksimal 1 kalimat padat). Jika tidak ditemukan di CV, tulis jujur 'Tidak ditemukan bukti di CV'.
   - "nilai": skor numerik (0 sampai bobot_max). Berikan nilai penuh jika kandidat memenuhi dengan baik, nilai proporsional jika sebagian, atau nilai rendah/0 jika tidak memenuhi sama sekali.
   - "bobot_max": nilai bobot maksimum dari kriteria tersebut
   - "status_cocok": boolean (true jika memenuhi syarat kriteria, false jika tidak memenuhi)
2. "total_skor": hitung total nilai seluruh kriteria, lalu normalisasi ke skala 0 - 100 (bulatkan integer).
3. "rekomendasi":
   - "sangat_disarankan" jika total_skor >= 75
   - "dipertimbangkan" jika total_skor antara 50 dan 74
   - "tidak_disarankan" jika total_skor < 50
4. "catatan_ats": buat 2-3 kalimat rangkuman analisis evaluasi profesional yang menjelaskan alasan rekomendasi, keunggulan utama kandidat, dan catatan pertimbangan untuk HR.

FORMAT OUTPUT:
KEMBALIKAN HANYA JSON MURNI (tanpa markdown atau teks pembuka/penutup). Format JSON:
{
  "total_skor": 85,
  "rekomendasi": "sangat_disarankan",
  "catatan_ats": "Kandidat memiliki latar belakang...",
  "kriteria_penilaian": [
    {
      "kriteria": "...",
      "kebutuhan": "...",
      "data_kandidat": "...",
      "nilai": 20,
      "bobot_max": 20,
      "status_cocok": true
    }
  ]
}
PROMPT;

        $userPrompt = "Kriteria yang harus dinilai:\n" . json_encode($criteriaList, JSON_UNESCAPED_UNICODE) .
            "\n\nProfil & Isi Dokumen CV Kandidat:\n" . json_encode($candidateSummary, JSON_UNESCAPED_UNICODE);

        return [
            'system_prompt' => $systemPrompt,
            'user_prompt' => $userPrompt,
        ];
    }

    /**
     * Parse raw AI response to structured evaluation array.
     */
    public function parseAiResponse(\Illuminate\Http\Client\Response $response, string $divisi, string $model): ?array
    {
        $rawContent = trim($response->json('choices.0.message.content') ?? '');
        if (empty($rawContent)) {
            return null;
        }

        // Extract JSON if wrapped in markdown codeblock
        if (preg_match('/```(?:json)?\s*(\{[\s\S]*?\})\s*```/s', $rawContent, $matches)) {
            $rawContent = $matches[1];
        } elseif (preg_match('/\{[\s\S]*\}/s', $rawContent, $matches)) {
            $rawContent = $matches[0];
        }

        $decoded = json_decode($rawContent, true);
        if (!is_array($decoded) || empty($decoded['kriteria_penilaian'])) {
            Log::warning("AtsScreeningService: Failed to parse AI JSON response: {$rawContent}");
            return null;
        }

        $totalSkor = (float) ($decoded['total_skor'] ?? 0);
        $rekomendasi = $decoded['rekomendasi'] ?? $this->determineRekomendasi($totalSkor);
        $catatanAts = $decoded['catatan_ats'] ?? $this->generateSummaryNotes($divisi, $totalSkor, $rekomendasi, $decoded['kriteria_penilaian']);

        return [
            'total_skor' => min(100.0, max(0.0, $totalSkor)),
            'rekomendasi' => $rekomendasi,
            'catatan_ats' => $catatanAts,
            'kriteria' => $decoded['kriteria_penilaian'],
            'model_used' => $response->json('model') ?? $model,
        ];
    }

    /**
     * Run high-speed concurrent batch ATS screening for multiple candidates (5 per pool).
     *
     * @param iterable<Pelamar> $pelamars
     * @return array<AtsScreening>
     */
    public function screenBatch(iterable $pelamars): array
    {
        $prepared = [];
        $results = [];

        $apiKey = config('services.ai_router.api_key');
        $baseUrl = rtrim(config('services.ai_router.base_url', 'https://vendorarouter.web.id/api/v1'), '/');
        $model = $this->resolveAiModel();
        $useAi = !empty($apiKey);

        foreach ($pelamars as $idx => $pelamar) {
            $pelamar->loadMissing([
                'lowongan.departement',
                'lowongan.jabatan',
                'formulirLamaran',
            ]);

            $divisi = $this->determineDivisi($pelamar);
            $extractedText = $this->extractCandidateText($pelamar);
            $parsedData = $this->parseCandidateData($pelamar, $extractedText);
            $kriteriaModels = KriteriaAts::getCriteriaFor($pelamar->lowongan_id, $divisi);

            $payload = null;
            if ($useAi && $kriteriaModels->isNotEmpty()) {
                $payload = $this->buildAiPrompts($divisi, $pelamar, $parsedData, $extractedText, $kriteriaModels);
            }

            $prepared[$idx] = [
                'pelamar' => $pelamar,
                'divisi' => $divisi,
                'extractedText' => $extractedText,
                'parsedData' => $parsedData,
                'kriteriaModels' => $kriteriaModels,
                'payload' => $payload,
            ];
        }

        // Execute concurrent HTTP requests in parallel if AI is active
        $httpResponses = [];
        if ($useAi) {
            try {
                $httpResponses = Http::pool(function (Pool $pool) use ($prepared, $apiKey, $baseUrl, $model) {
                    foreach ($prepared as $idx => $item) {
                        if (empty($item['payload'])) {
                            continue;
                        }
                        $pool->as("req_{$idx}")
                            ->withToken($apiKey)
                            ->withoutVerifying()
                            ->timeout(45)
                            ->post("{$baseUrl}/chat/completions", [
                                'model' => $model,
                                'messages' => [
                                    ['role' => 'system', 'content' => $item['payload']['system_prompt']],
                                    ['role' => 'user', 'content' => $item['payload']['user_prompt']],
                                ],
                                'temperature' => 0.2,
                                'max_tokens' => 800,
                            ]);
                    }
                });
            } catch (\Throwable $e) {
                Log::warning("AtsScreeningService screenBatch Http::pool exception: " . $e->getMessage());
            }
        }

        // Process and save results for each candidate
        foreach ($prepared as $idx => $item) {
            $pelamar = $item['pelamar'];
            $divisi = $item['divisi'];
            $extractedText = $item['extractedText'];
            $parsedData = $item['parsedData'];

            $aiResult = null;
            if (isset($httpResponses["req_{$idx}"])) {
                $res = $httpResponses["req_{$idx}"];
                if ($res instanceof \Illuminate\Http\Client\Response && $res->successful()) {
                    $aiResult = $this->parseAiResponse($res, $divisi, $model);
                }
            }

            if ($aiResult && !empty($aiResult['kriteria'])) {
                $totalSkor = $aiResult['total_skor'];
                $rekomendasi = $aiResult['rekomendasi'];
                $catatanAts = $aiResult['catatan_ats'];
                $kriteriaEvaluation = $aiResult['kriteria'];
            } else {
                // High-precision Rule-Based Fallback
                $evaluation = $this->evaluateCriteria($divisi, $pelamar, $parsedData, $extractedText);
                $totalSkor = $evaluation['total_skor'];
                $rekomendasi = $this->determineRekomendasi($totalSkor);
                $catatanAts = $this->generateSummaryNotes($divisi, $totalSkor, $rekomendasi, $evaluation['kriteria']);
                $kriteriaEvaluation = $evaluation['kriteria'];
            }

            $screening = AtsScreening::updateOrCreate(
                ['pelamar_id' => $pelamar->id],
                [
                    'lowongan_id' => $pelamar->lowongan_id,
                    'divisi' => $divisi,
                    'total_skor' => $totalSkor,
                    'rekomendasi' => $rekomendasi,
                    'status_konfirmasi' => 'menunggu_konfirmasi',
                    'kriteria_penilaian' => $kriteriaEvaluation,
                    'cv_parsed_data' => $parsedData,
                    'catatan_ats' => $catatanAts,
                ]
            );

            $results[] = $screening;
        }

        return $results;
    }

    /**
     * AI-Powered CV Evaluation using Vendorarouter / 9Router (OpenAI-compatible)
     */
    public function evaluateWithAi(string $divisi, Pelamar $pelamar, array $parsed, string $fullText): ?array
    {
        $apiKey = config('services.ai_router.api_key');
        if (empty($apiKey)) {
            return null; // Fallback to rule-based
        }

        $baseUrl = rtrim(config('services.ai_router.base_url', 'https://vendorarouter.web.id/api/v1'), '/');
        $model = $this->resolveAiModel();

        $kriteriaModels = KriteriaAts::getCriteriaFor($pelamar->lowongan_id, $divisi);
        if ($kriteriaModels->isEmpty()) {
            return null;
        }

        $prompts = $this->buildAiPrompts($divisi, $pelamar, $parsed, $fullText, $kriteriaModels);

        try {
            $client = Http::withToken($apiKey)->timeout(config('services.ai_router.timeout', 60));
            if (!config('services.ai_router.verify_ssl', false)) {
                $client = $client->withoutVerifying();
            }

            $response = $client->post("{$baseUrl}/chat/completions", [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $prompts['system_prompt']],
                    ['role' => 'user', 'content' => $prompts['user_prompt']],
                ],
                'temperature' => 0.2,
                'max_tokens' => 800,
            ]);

            if (!$response->successful()) {
                Log::warning("AtsScreeningService AI error (Status {$response->status()}): " . $response->body());
                return null;
            }

            return $this->parseAiResponse($response, $divisi, $model);
        } catch (\Throwable $e) {
            Log::warning("AtsScreeningService evaluateWithAi exception: " . $e->getMessage());
            return null;
        }
    }
}
