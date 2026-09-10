<?php

namespace App\Http\Controllers;

use App\Mail\UndanganInterviewMail;
use App\Models\Lowongan;
use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PenjadwalanInterviewController extends Controller
{
    /**
     * Display a listing of scheduled interviews and summary metrics.
     */
    public function index(Request $request): Response
    {
        $query = PenjadwalanInterview::with([
            'pelamar.lowongan',
            'lowongan.departement',
            'lowongan.jabatan',
            'creator',
        ]);

        // Search candidate name or registration number
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->whereHas('pelamar', function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('no_pendaftaran', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('posisi_dilamar', 'like', "%{$search}%");
            });
        }

        // Filter Lowongan
        if ($request->filled('lowongan_id')) {
            $query->where('lowongan_id', $request->lowongan_id);
        }

        // Filter Tahap
        if ($request->filled('tahap') && $request->tahap !== 'all') {
            $query->where('tahap', $request->tahap);
        }

        // Filter Tipe (online/offline)
        if ($request->filled('tipe') && $request->tipe !== 'all') {
            $query->where('tipe_interview', $request->tipe);
        }

        // Filter Status Kehadiran
        if ($request->filled('status_kehadiran') && $request->status_kehadiran !== 'all') {
            $query->where('status_kehadiran', $request->status_kehadiran);
        }

        // Filter Date Range / Quick Date
        if ($request->filled('date_filter')) {
            if ($request->date_filter === 'today') {
                $query->whereDate('tanggal_interview', today());
            } elseif ($request->date_filter === 'upcoming') {
                $query->whereDate('tanggal_interview', '>=', today());
            } elseif ($request->date_filter === 'past') {
                $query->whereDate('tanggal_interview', '<', today());
            }
        }

        $schedules = $query->orderBy('tanggal_interview', 'desc')
            ->orderBy('jam_mulai', 'asc')
            ->get()
            ->map(function (PenjadwalanInterview $s) {
                $isToday = $s->tanggal_interview?->isToday();
                $isPast = $s->tanggal_interview?->isPast() && !$isToday;

                return [
                    'id' => $s->id,
                    'pelamar_id' => $s->pelamar_id,
                    'lowongan_id' => $s->lowongan_id,
                    'kandidat_nama' => $s->pelamar?->nama_lengkap ?? 'Kandidat',
                    'kandidat_email' => $s->pelamar?->email ?? '',
                    'kandidat_phone' => $s->pelamar?->nomor_kontak ?? '',
                    'kandidat_no_pendaftaran' => $s->pelamar?->no_pendaftaran ?? '',
                    'kandidat_foto' => $s->pelamar?->foto_url ?? '/assets/images/user.png',
                    'posisi_nama' => $s->pelamar?->posisi_dilamar ?: ($s->lowongan?->judul ?? 'Lowongan'),
                    'kode_lowongan' => $s->lowongan?->kode_lowongan ?? '',
                    'tahap' => $s->tahap,
                    'tahap_label' => $s->tahap_label,
                    'tanggal_interview' => $s->tanggal_interview?->format('Y-m-d'),
                    'tanggal_formatted' => $s->tanggal_interview ? Carbon::parse($s->tanggal_interview)->locale('id')->isoFormat('dddd, D MMMM Y') : '-',
                    'jam_mulai' => $s->jam_mulai,
                    'jam_selesai' => $s->jam_selesai,
                    'waktu_formatted' => $s->jam_mulai . ($s->jam_selesai ? " - {$s->jam_selesai} WIB" : ' WIB'),
                    'tipe_interview' => $s->tipe_interview,
                    'lokasi' => $s->lokasi,
                    'link_meeting' => $s->link_meeting,
                    'pewawancara_nama' => $s->pewawancara_nama,
                    'catatan_untuk_kandidat' => $s->catatan_untuk_kandidat,
                    'status_kehadiran' => $s->status_kehadiran,
                    'reminder_sent_at' => $s->reminder_sent_at ? Carbon::parse($s->reminder_sent_at)->locale('id')->isoFormat('D MMM Y, HH:mm') : null,
                    'creator_name' => $s->creator?->name ?? 'HR System',
                    'is_today' => $isToday,
                    'is_past' => $isPast,
                ];
            });

        // Summary Stats
        $stats = [
            'total_hari_ini' => PenjadwalanInterview::whereDate('tanggal_interview', today())->count(),
            'total_mendatang' => PenjadwalanInterview::whereDate('tanggal_interview', '>', today())
                ->whereIn('status_kehadiran', ['scheduled', 'reschedule'])
                ->count(),
            'total_hr' => PenjadwalanInterview::where('tahap', 'interview_hr')->count(),
            'total_user' => PenjadwalanInterview::where('tahap', 'interview_user')->count(),
            'total_gm' => PenjadwalanInterview::where('tahap', 'interview_gm')->count(),
        ];

        // Active Lowongans for dropdown filter & schedule form
        $lowongans = Lowongan::with(['departement', 'jabatan'])
            ->where('status', 'aktif')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Lowongan $l) => [
                'id' => $l->id,
                'kode_lowongan' => $l->kode_lowongan,
                'judul' => $l->judul,
                'posisi_nama' => $l->jabatan?->nama_jabatan ?? $l->judul,
                'departement_nama' => $l->departement?->deskripsi ?? 'General',
            ]);

        // Candidates eligible for interview (active candidates in interview stages or skill test passers)
        $eligiblePelamars = Pelamar::with('lowongan')
            ->whereIn('status', ['lengkapi_formulir', 'skill_test', 'interview_hr', 'interview_user', 'interview_gm', 'interview'])
            ->orderBy('nama_lengkap')
            ->get()
            ->map(fn (Pelamar $p) => [
                'id' => $p->id,
                'no_pendaftaran' => $p->no_pendaftaran,
                'nama_lengkap' => $p->nama_lengkap,
                'email' => $p->email,
                'nomor_kontak' => $p->nomor_kontak,
                'lowongan_id' => $p->lowongan_id,
                'posisi_dilamar' => $p->posisi_dilamar,
                'status' => $p->status,
                'foto_url' => $p->foto_url ?? '/assets/images/user.png',
            ]);

        return Inertia::render('penjadwalan-interview/Index', [
            'schedules' => $schedules,
            'stats' => $stats,
            'lowongans' => $lowongans,
            'eligiblePelamars' => $eligiblePelamars,
            'filters' => [
                'search' => $request->query('search', ''),
                'lowongan_id' => $request->query('lowongan_id', ''),
                'tahap' => $request->query('tahap', 'all'),
                'tipe' => $request->query('tipe', 'all'),
                'status_kehadiran' => $request->query('status_kehadiran', 'all'),
                'date_filter' => $request->query('date_filter', 'all'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new interview schedule.
     */
    public function create(Request $request): Response
    {
        $eligiblePelamars = Pelamar::with(['lowongan.departement', 'lowongan.jabatan'])
            ->whereIn('status', ['lengkapi_formulir', 'skill_test', 'interview_hr', 'interview_user', 'interview_gm', 'interview'])
            ->orderBy('nama_lengkap')
            ->get()
            ->map(fn (Pelamar $p) => [
                'id' => $p->id,
                'no_pendaftaran' => $p->no_pendaftaran,
                'nama_lengkap' => $p->nama_lengkap,
                'email' => $p->email,
                'nomor_kontak' => $p->nomor_kontak,
                'lowongan_id' => $p->lowongan_id,
                'lowongan_judul' => $p->lowongan?->judul ?? '',
                'posisi_dilamar' => $p->posisi_dilamar,
                'status' => $p->status,
                'foto_url' => $p->foto_url ?? '/assets/images/user.png',
            ]);

        $lowongans = Lowongan::with(['departement', 'jabatan'])
            ->where('status', 'aktif')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Lowongan $l) => [
                'id' => $l->id,
                'kode_lowongan' => $l->kode_lowongan,
                'judul' => $l->judul,
                'posisi_nama' => $l->jabatan?->nama_jabatan ?? $l->judul,
                'departement_nama' => $l->departement?->deskripsi ?? 'General',
            ]);

        return Inertia::render('penjadwalan-interview/Create', [
            'eligiblePelamars' => $eligiblePelamars,
            'lowongans' => $lowongans,
            'preselectedPelamarId' => $request->query('pelamar_id') ? (int) $request->query('pelamar_id') : null,
            'preselectedTahap' => $request->query('tahap', 'interview_hr'),
        ]);
    }

    /**
     * Show the form for editing an existing interview schedule.
     */
    public function edit(PenjadwalanInterview $penjadwalanInterview): Response
    {
        $penjadwalanInterview->load(['pelamar.lowongan', 'lowongan']);

        $eligiblePelamars = Pelamar::with(['lowongan.departement', 'lowongan.jabatan'])
            ->whereIn('status', ['lengkapi_formulir', 'skill_test', 'interview_hr', 'interview_user', 'interview_gm', 'interview'])
            ->orWhere('id', $penjadwalanInterview->pelamar_id)
            ->orderBy('nama_lengkap')
            ->get()
            ->map(fn (Pelamar $p) => [
                'id' => $p->id,
                'no_pendaftaran' => $p->no_pendaftaran,
                'nama_lengkap' => $p->nama_lengkap,
                'email' => $p->email,
                'nomor_kontak' => $p->nomor_kontak,
                'lowongan_id' => $p->lowongan_id,
                'lowongan_judul' => $p->lowongan?->judul ?? '',
                'posisi_dilamar' => $p->posisi_dilamar,
                'status' => $p->status,
                'foto_url' => $p->foto_url ?? '/assets/images/user.png',
            ]);

        $lowongans = Lowongan::with(['departement', 'jabatan'])
            ->where('status', 'aktif')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Lowongan $l) => [
                'id' => $l->id,
                'kode_lowongan' => $l->kode_lowongan,
                'judul' => $l->judul,
                'posisi_nama' => $l->jabatan?->nama_jabatan ?? $l->judul,
                'departement_nama' => $l->departement?->deskripsi ?? 'General',
            ]);

        return Inertia::render('penjadwalan-interview/Edit', [
            'schedule' => [
                'id' => $penjadwalanInterview->id,
                'pelamar_id' => $penjadwalanInterview->pelamar_id,
                'lowongan_id' => $penjadwalanInterview->lowongan_id,
                'kandidat_nama' => $penjadwalanInterview->pelamar?->nama_lengkap ?? '',
                'kandidat_no_pendaftaran' => $penjadwalanInterview->pelamar?->no_pendaftaran ?? '',
                'kandidat_email' => $penjadwalanInterview->pelamar?->email ?? '',
                'kandidat_phone' => $penjadwalanInterview->pelamar?->nomor_kontak ?? '',
                'posisi_nama' => $penjadwalanInterview->pelamar?->posisi_dilamar ?? '',
                'tahap' => $penjadwalanInterview->tahap,
                'tanggal_interview' => $penjadwalanInterview->tanggal_interview?->format('Y-m-d'),
                'jam_mulai' => $penjadwalanInterview->jam_mulai,
                'jam_selesai' => $penjadwalanInterview->jam_selesai,
                'tipe_interview' => $penjadwalanInterview->tipe_interview,
                'lokasi' => $penjadwalanInterview->lokasi,
                'link_meeting' => $penjadwalanInterview->link_meeting,
                'pewawancara_nama' => $penjadwalanInterview->pewawancara_nama,
                'catatan_untuk_kandidat' => $penjadwalanInterview->catatan_untuk_kandidat,
                'status_kehadiran' => $penjadwalanInterview->status_kehadiran,
            ],
            'eligiblePelamars' => $eligiblePelamars,
            'lowongans' => $lowongans,
        ]);
    }

    /**
     * Store a new interview schedule and send invitation email.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pelamar_id' => ['required', 'exists:App\Models\Pelamar,id'],
            'lowongan_id' => ['nullable', 'exists:App\Models\Lowongan,id'],
            'tahap' => ['required', 'in:interview_hr,interview_user,interview_gm'],
            'tanggal_interview' => ['required', 'date'],
            'jam_mulai' => ['required', 'string', 'max:10'],
            'jam_selesai' => ['nullable', 'string', 'max:10'],
            'tipe_interview' => ['required', 'in:offline,online'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'link_meeting' => ['nullable', 'url', 'max:500'],
            'pewawancara_nama' => ['nullable', 'string', 'max:255'],
            'catatan_untuk_kandidat' => ['nullable', 'string', 'max:1000'],
            'send_email' => ['nullable', 'boolean'],
            'send_notification' => ['nullable', 'boolean'],
        ], [
            'pelamar_id.required' => 'Pilih kandidat yang akan dijadwalkan.',
            'tahap.required' => 'Pilih tahap interview.',
            'tanggal_interview.required' => 'Tanggal wawancara wajib diisi.',
            'jam_mulai.required' => 'Jam mulai wawancara wajib diisi.',
            'tipe_interview.required' => 'Pilih tipe pelaksanaan (online/offline).',
            'link_meeting.url' => 'Format tautan online meeting tidak valid (contoh: https://meet.google.com/xyz).',
        ]);

        $pelamar = Pelamar::with('lowongan')->findOrFail($validated['pelamar_id']);
        $lowonganId = $validated['lowongan_id'] ?? $pelamar->lowongan_id;

        $schedule = PenjadwalanInterview::create([
            'pelamar_id' => $validated['pelamar_id'],
            'lowongan_id' => $lowonganId,
            'tahap' => $validated['tahap'],
            'tanggal_interview' => $validated['tanggal_interview'],
            'jam_mulai' => $validated['jam_mulai'],
            'jam_selesai' => $validated['jam_selesai'] ?? null,
            'tipe_interview' => $validated['tipe_interview'],
            'lokasi' => $validated['lokasi'] ?? null,
            'link_meeting' => $validated['link_meeting'] ?? null,
            'pewawancara_nama' => $validated['pewawancara_nama'] ?? null,
            'catatan_untuk_kandidat' => $validated['catatan_untuk_kandidat'] ?? null,
            'status_kehadiran' => 'scheduled',
            'created_by' => Auth::id(),
        ]);

        // Sync candidate's status to the scheduled interview stage if not already
        if ($pelamar->status !== $validated['tahap']) {
            $pelamar->status = $validated['tahap'];
            $pelamar->save();
        }

        // Send Email Invitation
        $sendEmail = $request->boolean('send_notification', true) && $request->boolean('send_email', true);
        if ($sendEmail && !empty($pelamar->email)) {
            try {
                Mail::to($pelamar->email)->queue(new UndanganInterviewMail($pelamar, $schedule, false));
                $schedule->reminder_sent_at = now();
                $schedule->save();
            } catch (\Throwable $e) {
                Log::error('Gagal mengirim email undangan interview: ' . $e->getMessage());
            }
        }

        return redirect()->route('penjadwalan-interview.index')->with('success', 'Jadwal interview berhasil dibuat.');
    }

    /**
     * Update existing interview schedule.
     */
    public function update(Request $request, PenjadwalanInterview $penjadwalanInterview): RedirectResponse
    {
        $validated = $request->validate([
            'tahap' => ['required', 'in:interview_hr,interview_user,interview_gm'],
            'tanggal_interview' => ['required', 'date'],
            'jam_mulai' => ['required', 'string', 'max:10'],
            'jam_selesai' => ['nullable', 'string', 'max:10'],
            'tipe_interview' => ['required', 'in:offline,online'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'link_meeting' => ['nullable', 'url', 'max:500'],
            'pewawancara_nama' => ['nullable', 'string', 'max:255'],
            'catatan_untuk_kandidat' => ['nullable', 'string', 'max:1000'],
            'status_kehadiran' => ['nullable', 'string'],
            'send_email' => ['nullable', 'boolean'],
            'send_notification' => ['nullable', 'boolean'],
        ]);

        $statusKehadiran = $validated['status_kehadiran'] ?? $penjadwalanInterview->status_kehadiran;

        $penjadwalanInterview->update([
            'tahap' => $validated['tahap'],
            'tanggal_interview' => $validated['tanggal_interview'],
            'jam_mulai' => $validated['jam_mulai'],
            'jam_selesai' => $validated['jam_selesai'] ?? null,
            'tipe_interview' => $validated['tipe_interview'],
            'lokasi' => $validated['lokasi'] ?? null,
            'link_meeting' => $validated['link_meeting'] ?? null,
            'pewawancara_nama' => $validated['pewawancara_nama'] ?? null,
            'catatan_untuk_kandidat' => $validated['catatan_untuk_kandidat'] ?? null,
            'status_kehadiran' => $statusKehadiran,
        ]);

        $pelamar = $penjadwalanInterview->pelamar;

        // Send Update Email Notification
        $sendEmail = $request->boolean('send_notification', false) || $request->boolean('send_email', false);
        if ($sendEmail && $pelamar && !empty($pelamar->email)) {
            try {
                Mail::to($pelamar->email)->queue(new UndanganInterviewMail($pelamar, $penjadwalanInterview, true));
                $penjadwalanInterview->update(['reminder_sent_at' => now()]);
            } catch (\Throwable $e) {
                Log::error("Gagal mengirim email update interview ke {$pelamar->email}: " . $e->getMessage());
            }
        }

        return redirect()->route('penjadwalan-interview.index')->with('success', "Jadwal interview berhasil diperbarui.");
    }

    /**
     * Update attendance / presence status.
     */
    public function updateStatus(Request $request, PenjadwalanInterview $penjadwalanInterview): RedirectResponse
    {
        $validated = $request->validate([
            'status_kehadiran' => ['required', 'in:scheduled,hadir,tidak_hadir,reschedule,selesai'],
        ]);

        $penjadwalanInterview->update([
            'status_kehadiran' => $validated['status_kehadiran'],
        ]);

        return back()->with('success', "Status kehadiran interview berhasil diubah menjadi: {$validated['status_kehadiran']}.");
    }

    /**
     * Send or resend interview reminder email to candidate.
     */
    public function sendReminder(PenjadwalanInterview $penjadwalanInterview): RedirectResponse
    {
        $pelamar = $penjadwalanInterview->pelamar;

        if (!$pelamar || empty($pelamar->email)) {
            return back()->with('error', 'Data email kandidat tidak ditemukan.');
        }

        try {
            Mail::to($pelamar->email)->queue(new UndanganInterviewMail($pelamar, $penjadwalanInterview, true));
            $penjadwalanInterview->update(['reminder_sent_at' => now()]);

            return back()->with('success', "Reminder jadwal interview berhasil dikirimkan ke email kandidat ({$pelamar->email}).");
        } catch (\Throwable $e) {
            Log::error("Gagal mengirim reminder interview: " . $e->getMessage());
            return back()->with('error', 'Terjadi kendala saat mengirim email reminder: ' . $e->getMessage());
        }
    }

    /**
     * Delete interview schedule.
     */
    public function destroy(PenjadwalanInterview $penjadwalanInterview): RedirectResponse
    {
        $kandidatNama = $penjadwalanInterview->pelamar?->nama_lengkap ?? 'Kandidat';
        $penjadwalanInterview->delete();

        return back()->with('success', "Jadwal interview untuk {$kandidatNama} berhasil dihapus.");
    }
}
