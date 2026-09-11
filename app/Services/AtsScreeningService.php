<?php

namespace App\Services;

use App\Models\AtsScreening;
use App\Models\KriteriaAts;
use App\Models\Pelamar;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AtsScreeningService
{
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

        $evaluation = $this->evaluateCriteria($divisi, $pelamar, $parsedData, $extractedText);

        $totalSkor = $evaluation['total_skor'];
        $rekomendasi = $this->determineRekomendasi($totalSkor);
        $catatanAts = $this->generateSummaryNotes($divisi, $totalSkor, $rekomendasi, $evaluation['kriteria']);

        $screening = AtsScreening::updateOrCreate(
            ['pelamar_id' => $pelamar->id],
            [
                'lowongan_id' => $pelamar->lowongan_id,
                'divisi' => $divisi,
                'total_skor' => $totalSkor,
                'rekomendasi' => $rekomendasi,
                'status_konfirmasi' => 'menunggu_konfirmasi', // Menunggu konfirmasi HR
                'kriteria_penilaian' => $evaluation['kriteria'],
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
     * Extract full searchable text from candidate record, profile, formulir, and PDF CV.
     */
    public function extractCandidateText(Pelamar $pelamar): string
    {
        $chunks = [
            $pelamar->nama_lengkap,
            $pelamar->pendidikan_terakhir,
            $pelamar->nama_institusi,
            $pelamar->jurusan,
            $pelamar->tahun_lulus,
            $pelamar->posisi_dilamar,
            $pelamar->catatan,
        ];

        // Formulir lamaran text if available
        if ($pelamar->formulirLamaran) {
            $f = $pelamar->formulirLamaran;
            $chunks[] = $f->data_pribadi ? json_encode($f->data_pribadi) : '';
            $chunks[] = $f->riwayat_pendidikan ? json_encode($f->riwayat_pendidikan) : '';
            $chunks[] = $f->pengalaman_kerja ? json_encode($f->pengalaman_kerja) : '';
            $chunks[] = $f->keterampilan_bahasa ? json_encode($f->keterampilan_bahasa) : '';
            $chunks[] = $f->minat_keahlian ? json_encode($f->minat_keahlian) : '';
        }

        // PDF text extraction if cv_path exists
        if ($pelamar->cv_path) {
            $pdfText = $this->extractTextFromPdf($pelamar->cv_path);
            if (!empty($pdfText)) {
                $chunks[] = $pdfText;
            }
        }

        return strtolower(implode(' ', array_filter($chunks)));
    }

    /**
     * Extract text from PDF file stored in local/public disk.
     */
    protected function extractTextFromPdf(string $path): string
    {
        try {
            $fullPath = Storage::disk('public')->path($path);
            if (!file_exists($fullPath)) {
                return '';
            }

            $content = @file_get_contents($fullPath);
            if (!$content) {
                return '';
            }

            // Extract text objects from PDF streams
            $text = '';
            if (preg_match_all('/stream(.*?)endstream/s', $content, $matches)) {
                foreach ($matches[1] as $stream) {
                    $uncompressed = @gzuncompress(trim($stream));
                    if ($uncompressed) {
                        $stream = $uncompressed;
                    }
                    if (preg_match_all('/\[\s*(.*?)\s*\]\s*TJ|(\([^\)]*\))\s*Tj/s', $stream, $textMatches)) {
                        foreach ($textMatches[0] as $match) {
                            $cleaned = preg_replace('/[\\\\(\)\[\]]/', '', $match);
                            $text .= ' ' . $cleaned;
                        }
                    }
                }
            }

            return trim(preg_replace('/\s+/', ' ', $text));
        } catch (\Throwable $e) {
            Log::warning("AtsScreeningService PDF extraction error for {$path}: " . $e->getMessage());
            return '';
        }
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
        // Query criteria tailored for this lowongan, or fallback to division template
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
                    if ($crit->divisi === 'H2') { // SMK Otomotif
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
}
