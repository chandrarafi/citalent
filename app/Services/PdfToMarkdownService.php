<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;

class PdfToMarkdownService
{
    protected Parser $pdfParser;

    public function __construct()
    {
        $this->pdfParser = new Parser();
    }

    /**
     * Convert PDF file from public storage to structured Markdown (.md).
     */
    public function convertPdfToMarkdown(?string $storagePath): string
    {
        if (empty($storagePath)) {
            return '';
        }

        try {
            $fullPath = Storage::disk('public')->path($storagePath);
            if (!file_exists($fullPath)) {
                return '';
            }

            // Parse PDF using Smalot Parser
            $pdf = $this->pdfParser->parseFile($fullPath);
            $rawText = $pdf->getText();

            if (empty(trim($rawText))) {
                return '';
            }

            return $this->formatTextToMarkdown($rawText);
        } catch (\Throwable $e) {
            Log::warning("PdfToMarkdownService error for {$storagePath}: " . $e->getMessage());
            return '';
        }
    }

    /**
     * Transform unstructured PDF text lines into clean, hierarchical Markdown.
     */
    public function formatTextToMarkdown(string $text): string
    {
        // Normalize line breaks
        $text = str_replace(["\r\n", "\r"], "\n", $text);

        // Remove control characters except newlines and tabs
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);

        $lines = explode("\n", $text);
        $markdownLines = [];
        $currentSection = '';

        // Known Section Header Patterns
        $sectionPatterns = [
            'identitas' => '/^(profil|tentang saya|ringkasan|summary|about me|personal profile|data pribadi)/i',
            'pendidikan' => '/^(pendidikan|riwayat pendidikan|education|academic background|latar belakang pendidikan)/i',
            'pengalaman' => '/^(pengalaman|pengalaman kerja|riwayat kerja|work experience|employment history|experience|career history)/i',
            'keahlian' => '/^(keahlian|keterampilan|skills|kemampuan|kompetensi|hard skills|soft skills|technical skills)/i',
            'sertifikasi' => '/^(sertifikasi|sertifikat|licenses?|certifications?|pelatihan|training|kursus)/i',
            'organisasi' => '/^(organisasi|pengalaman organisasi|organizational experience|volunteering)/i',
            'bahasa' => '/^(bahasa|kemampuan bahasa|languages?)/i',
            'kontak' => '/^(kontak|informasi kontak|contact|contact information)/i',
        ];

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '') {
                continue;
            }

            // Clean multiple inner spaces
            $cleaned = preg_replace('/\s+/', ' ', $trimmed);

            // Check if line matches a Section Heading
            $isHeading = false;
            foreach ($sectionPatterns as $sectionKey => $pattern) {
                if (preg_match($pattern, $cleaned) && mb_strlen($cleaned) < 50) {
                    $markdownLines[] = "\n## " . ucwords($cleaned);
                    $currentSection = $sectionKey;
                    $isHeading = true;
                    break;
                }
            }

            if ($isHeading) {
                continue;
            }

            // Check if line looks like an existing bullet point (•, -, *, o)
            if (preg_match('/^[•\-\*·o]\s*(.*)$/u', $cleaned, $bulletMatch)) {
                $markdownLines[] = "- " . trim($bulletMatch[1]);
                continue;
            }

            // Check if line contains a job position or institution header (e.g., contains year 2018 - 2023)
            if (preg_match('/\b(19\d{2}|20\d{2})\s*[-–—]\s*(19\d{2}|20\d{2}|sekarang|present|saat ini)\b/i', $cleaned)) {
                $markdownLines[] = "\n### " . $cleaned;
                continue;
            }

            // Format skills or items in skill/language sections as bullet points if comma-separated
            if (in_array($currentSection, ['keahlian', 'bahasa', 'sertifikasi']) && str_contains($cleaned, ',')) {
                $items = array_map('trim', explode(',', $cleaned));
                foreach ($items as $item) {
                    if (!empty($item)) {
                        $markdownLines[] = "- " . $item;
                    }
                }
                continue;
            }

            // Normal text line
            $markdownLines[] = $cleaned;
        }

        $result = implode("\n", $markdownLines);

        // Normalize multiple blank lines to at most two
        $result = preg_replace("/\n{3,}/", "\n\n", $result);

        return trim($result);
    }
}
