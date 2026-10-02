<?php

namespace App\Http\Controllers;

use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EmailPreviewController extends Controller
{
    /**
     * Preview Hub / Dashboard for all 3 email templates.
     */
    public function index(Request $request)
    {
        $current = $request->query('email', 'otp');

        $emails = [
            [
                'id' => 'otp',
                'title' => 'Kode OTP Verifikasi',
                'description' => 'Email verifikasi 6 digit OTP akun kandidat saat pendaftaran/login.',
                'url' => route('preview.email.render.otp'),
            ],
            [
                'id' => 'status-lamaran',
                'title' => 'Pemberitahuan Status Seleksi',
                'description' => 'Email update tahapan lamaran (Lolos, Diterima, Tidak Lolos, dll).',
                'url' => route('preview.email.render.status', [
                    'status' => $request->query('status', 'interview_hr'),
                ]),
            ],
            [
                'id' => 'undangan-interview',
                'title' => 'Undangan & Pengingat Interview',
                'description' => 'Email resmi jadwal wawancara tatap muka / online Google Meet.',
                'url' => route('preview.email.render.interview', [
                    'type' => $request->query('type', 'online'),
                    'reminder' => $request->query('reminder', 0),
                ]),
            ],
        ];

        return view('emails.preview_dashboard', compact('emails', 'current'));
    }

    /**
     * Render emails.otp
     */
    public function renderOtp(Request $request)
    {
        $name = $request->query('name', 'Rafi Chandra');
        $otp = $request->query('otp', '729410');

        return view('emails.otp', compact('name', 'otp'));
    }

    /**
     * Render emails.status_lamaran_updated
     */
    public function renderStatusLamaran(Request $request)
    {
        $status = $request->query('status', 'interview_hr');

        $statusLabels = [
            'screening_cv' => 'Screening CV',
            'lengkapi_formulir' => 'Lengkapi Formulir Lamaran Kerja',
            'interview_hr' => 'Wawancara HR (Interview HR)',
            'interview_user' => 'Wawancara User (Interview User)',
            'skill_test' => 'Skill Test & Keterampilan Teknis',
            'interview_gm' => 'Wawancara General Manager (Interview GM)',
            'final_discussion' => 'Final Discussion / Offering',
            'accepted' => 'Diterima Bekerja',
            'rejected' => 'Tidak Lolos Seleksi',
        ];

        $statusLabel = $statusLabels[$status] ?? ucwords(str_replace('_', ' ', $status));

        // Use real pelamar if available, else mock
        $pelamar = Pelamar::with('lowongan')->first();
        if (!$pelamar) {
            $pelamar = (object) [
                'nama_lengkap' => $request->query('name', 'Rafi Chandra, S.Kom'),
                'no_pendaftaran' => 'REG-202610-0082',
                'posisi_dilamar' => 'Fullstack Developer',
                'lowongan' => (object) [
                    'judul' => 'Fullstack Developer',
                ],
            ];
        }

        $defaultCatatan = match ($status) {
            'accepted' => "Selamat bergabung dengan keluarga besar Citalent. Tim HR akan menghubungi Saudara/i untuk proses onboarding.",
            'rejected' => "Terima kasih atas partisipasi Saudara/i. Profil Anda tetap tersimpan di bank data talent kami.",
            'interview_hr' => "Harap membawa berkas fisik identitas (KTP), ijazah asli, dan portofolio karya terbaru.",
            default => "Harap memeriksa jadwal dan informasi terkini di dashboard kandidat Anda.",
        };

        $catatan = $request->query('catatan', $defaultCatatan);

        return view('emails.status_lamaran_updated', compact('pelamar', 'status', 'statusLabel', 'catatan'));
    }

    /**
     * Render emails.undangan_interview
     */
    public function renderUndanganInterview(Request $request)
    {
        $isReminder = (bool) $request->query('reminder', 0);
        $tipe = $request->query('type', 'online'); // 'online' or 'offline'

        // Use real pelamar if available, else mock
        $pelamar = Pelamar::with('lowongan')->first();
        if (!$pelamar) {
            $pelamar = (object) [
                'nama_lengkap' => $request->query('name', 'Rafi Chandra, S.Kom'),
                'no_pendaftaran' => 'REG-202610-0082',
                'posisi_dilamar' => 'Fullstack Developer',
                'lowongan' => (object) [
                    'judul' => 'Fullstack Developer',
                ],
            ];
        }

        $schedule = (object) [
            'tahap_label' => $request->query('tahap', 'Interview User & Technical Review'),
            'tanggal_interview' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'jam_mulai' => '10:00',
            'jam_selesai' => '11:30',
            'tipe_interview' => $tipe,
            'lokasi' => 'Head Office Citalent, Ruang Meeting Kreatif Lt. 5, Jl. Jend. Sudirman Kav. 45',
            'link_meeting' => 'https://meet.google.com/cjt-rekrutmen-it',
            'catatan_untuk_kandidat' => $tipe === 'online'
                ? "Harap hadir 10 menit lebih awal, aktifkan webcam dan pastikan audio bekerja dengan optimal. Siapkan demo portofolio coding jika diminta."
                : "Harap berpakaian formal, membawa dokumen pendukung cetak, dan melapor ke resepsionis lobi utama.",
        ];

        return view('emails.undangan_interview', compact('pelamar', 'schedule', 'isReminder'));
    }
}
