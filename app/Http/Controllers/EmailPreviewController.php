<?php

namespace App\Http\Controllers;

use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EmailPreviewController extends Controller
{
    /**
     * Preview Hub / Dashboard for email templates.
     */
    public function index(Request $request)
    {
        $current = $request->query('email', 'lamaran-lulus');

        // Backward compatibility
        if ($current === 'status-lamaran') {
            $current = ($request->query('status') === 'rejected') ? 'lamaran-gagal' : 'lamaran-lulus';
        }

        $emails = [
            [
                'id' => 'lamaran-lulus',
                'title' => 'Pengumuman Lulus / Lolos Seleksi',
                'description' => 'Email ucapan selamat kepada kandidat yang lolos ke tahap berikutnya atau diterima bekerja.',
                'url' => route('preview.email.render.lulus', [
                    'status' => $request->query('status', 'interview_hr'),
                ]),
            ],
            [
                'id' => 'lamaran-gagal',
                'title' => 'Pengumuman Tidak Lolos (Gagal)',
                'description' => 'Email evaluasi seleksi & talent pool (surat penolakan resmi yang sopan dan profesional).',
                'url' => route('preview.email.render.gagal'),
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
            [
                'id' => 'otp',
                'title' => 'Kode OTP Verifikasi',
                'description' => 'Email verifikasi 6 digit OTP akun kandidat saat pendaftaran/login.',
                'url' => route('preview.email.render.otp'),
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
        $type = $request->query('type', 'activation');

        return view('emails.otp', compact('name', 'otp', 'type'));
    }

    /**
     * Render emails.lamaran_lulus (Kandidat Lolos / Lulus)
     */
    public function renderLamaranLulus(Request $request)
    {
        $status = $request->query('status', 'interview_hr');
        if ($status === 'rejected') {
            $status = 'interview_hr';
        }

        $statusLabels = [
            'screening_cv' => 'Screening CV',
            'lengkapi_formulir' => 'Lengkapi Formulir Lamaran Kerja',
            'interview_hr' => 'Wawancara HR (Interview HR)',
            'interview_user' => 'Wawancara User (Interview User)',
            'skill_test' => 'Skill Test & Keterampilan Teknis',
            'interview_gm' => 'Wawancara General Manager (Interview GM)',
            'final_discussion' => 'Final Discussion / Offering',
            'accepted' => 'Diterima Bekerja',
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
            'interview_hr' => "Harap membawa berkas fisik identitas (KTP), ijazah asli, dan portofolio karya terbaru.",
            'skill_test' => "Ujian teknis live coding akan berlangsung selama 90 menit. Siapkan laptop dengan koneksi internet stabil.",
            default => "Harap memeriksa jadwal dan informasi terkini di dashboard kandidat Anda.",
        };

        $catatan = $request->query('catatan', $defaultCatatan);

        return view('emails.lamaran_lulus', compact('pelamar', 'status', 'statusLabel', 'catatan'));
    }

    /**
     * Render emails.lamaran_gagal (Kandidat Tidak Lolos)
     */
    public function renderLamaranGagal(Request $request)
    {
        $status = 'rejected';
        $statusLabel = 'Tidak Lolos Seleksi';

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

        $defaultCatatan = "Terima kasih atas partisipasi Saudara/i. Kualifikasi dan minat Anda sangat kami hargai, dan profil Anda tetap tersimpan di bank data talent pool kami untuk peluang karir mendatang.";
        $catatan = $request->query('catatan', $defaultCatatan);

        return view('emails.lamaran_gagal', compact('pelamar', 'status', 'statusLabel', 'catatan'));
    }

    /**
     * Render emails.status_lamaran_updated (Forwarder compatibility)
     */
    public function renderStatusLamaran(Request $request)
    {
        $status = $request->query('status', 'interview_hr');

        if ($status === 'rejected') {
            return $this->renderLamaranGagal($request);
        }

        return $this->renderLamaranLulus($request);
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
