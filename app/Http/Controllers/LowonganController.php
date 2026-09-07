<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Jabatan;
use App\Models\Lowongan;
use App\Models\PermintaanRekrutmen;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LowonganController extends Controller
{
    /**
     * Display a listing of the published vacancies based on recruitment requests.
     */
    public function index(Request $request): Response
    {
        $lowongans = Lowongan::with(['departement', 'jabatan', 'permintaanRekrutmen.requester', 'creator'])
            ->withCount('pelamars')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (Lowongan $l) {
                return [
                    'id' => $l->id,
                    'kode_lowongan' => $l->kode_lowongan,
                    'slug' => $l->slug,
                    'judul' => $l->judul,
                    'kd_departement' => $l->kd_departement,
                    'departement' => $l->departement ? [
                        'id' => $l->departement->id,
                        'kd_departement' => $l->departement->kd_departement,
                        'deskripsi' => $l->departement->deskripsi,
                    ] : null,
                    'posisi_id' => $l->posisi_id,
                    'jabatan' => $l->jabatan ? [
                        'id' => $l->jabatan->id,
                        'nama_jabatan' => $l->jabatan->nama_jabatan,
                    ] : null,
                    'permintaan_rekrutmen' => $l->permintaanRekrutmen ? [
                        'id' => $l->permintaanRekrutmen->id,
                        'kode_permintaan' => $l->permintaanRekrutmen->kode_permintaan,
                        'requester_name' => $l->permintaanRekrutmen->requester?->name,
                        'target_join' => $l->permintaanRekrutmen->target_join?->format('Y-m-d'),
                        'prioritas' => $l->permintaanRekrutmen->prioritas,
                    ] : null,
                    'jumlah_dibutuhkan' => $l->jumlah_dibutuhkan,
                    'pelamars_count' => $l->pelamars_count,
                    'lokasi_kerja' => $l->lokasi_kerja,
                    'tipe_pekerjaan' => $l->tipe_pekerjaan,
                    'deskripsi' => $l->deskripsi,
                    'kualifikasi' => $l->kualifikasi,
                    'tgl_buka' => $l->tgl_buka ? $l->tgl_buka->format('Y-m-d') : null,
                    'tgl_tutup' => $l->tgl_tutup ? $l->tgl_tutup->format('Y-m-d') : null,
                    'status' => $l->status,
                    'share_url' => url('/karir/' . $l->slug),
                    'created_at' => $l->created_at ? $l->created_at->format('Y-m-d H:i') : null,
                ];
            });

        $departements = Departement::orderBy('kd_departement')->get(['id', 'kd_departement', 'deskripsi']);
        $jabatans = Jabatan::orderBy('nama_jabatan')->get(['id', 'kd_departement', 'kd_jabatan', 'nama_jabatan']);

        return Inertia::render('lowongan/Index', [
            'lowongans' => $lowongans,
            'departements' => $departements,
            'jabatans' => $jabatans,
        ]);
    }

    /**
     * Show form for creating a new vacancy.
     */
    public function create(Request $request): Response
    {
        $permintaanId = $request->query('permintaan_id');
        $permintaan = null;
        if ($permintaanId) {
            $permintaan = PermintaanRekrutmen::with(['departement', 'jabatan', 'requester'])
                ->find($permintaanId);
        }

        $departements = Departement::orderBy('kd_departement')->get(['id', 'kd_departement', 'deskripsi']);
        $jabatans = Jabatan::orderBy('nama_jabatan')->get(['id', 'kd_departement', 'kd_jabatan', 'nama_jabatan']);

        // Approved requests without active vacancy
        $availablePermintaans = PermintaanRekrutmen::with(['departement', 'jabatan', 'requester'])
            ->where('status_persetujuan', 'disetujui')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'kode_permintaan' => $p->kode_permintaan,
                'posisi_nama' => $p->jabatan?->nama_jabatan ?? "Posisi #{$p->posisi_id}",
                'departement_nama' => $p->departement?->deskripsi ?? "Dept #{$p->kd_departement}",
                'kd_departement' => $p->kd_departement,
                'posisi_id' => $p->posisi_id,
                'jumlah' => $p->jumlah,
                'target_join' => $p->target_join?->format('Y-m-d'),
                'requester_name' => $p->requester?->name,
            ]);

        return Inertia::render('lowongan/Create', [
            'selectedPermintaan' => $permintaan ? [
                'id' => $permintaan->id,
                'kode_permintaan' => $permintaan->kode_permintaan,
                'posisi_nama' => $permintaan->jabatan?->nama_jabatan ?? "Posisi #{$permintaan->posisi_id}",
                'departement_nama' => $permintaan->departement?->deskripsi ?? "Dept #{$permintaan->kd_departement}",
                'kd_departement' => $permintaan->kd_departement,
                'posisi_id' => $permintaan->posisi_id,
                'jumlah' => $permintaan->jumlah,
                'target_join' => $permintaan->target_join?->format('Y-m-d'),
                'requester_name' => $permintaan->requester?->name,
            ] : null,
            'availablePermintaans' => $availablePermintaans,
            'departements' => $departements,
            'jabatans' => $jabatans,
        ]);
    }

    /**
     * Store a newly created vacancy.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'permintaan_rekrutmen_id' => ['nullable', Rule::exists(PermintaanRekrutmen::class, 'id')],
            'judul' => ['required', 'string', 'max:255'],
            'kd_departement' => ['required', Rule::exists(Departement::class, 'id')],
            'posisi_id' => ['required', Rule::exists(Jabatan::class, 'id')],
            'jumlah_dibutuhkan' => ['required', 'integer', 'min:1'],
            'lokasi_kerja' => ['required', 'string', 'max:150'],
            'tipe_pekerjaan' => ['required', 'string', 'max:50'],
            'deskripsi' => ['nullable', 'string'],
            'kualifikasi' => ['nullable', 'string'],
            'tgl_buka' => ['required', 'date'],
            'tgl_tutup' => ['nullable', 'date', 'after_or_equal:tgl_buka'],
            'status' => ['required', 'in:aktif,ditutup,draft'],
        ], [
            'judul.required' => 'Judul lowongan wajib diisi.',
            'kd_departement.required' => 'Departemen wajib dipilih.',
            'posisi_id.required' => 'Posisi / jabatan wajib dipilih.',
            'jumlah_dibutuhkan.required' => 'Jumlah kebutuhan wajib diisi.',
            'lokasi_kerja.required' => 'Lokasi kerja wajib diisi.',
            'tipe_pekerjaan.required' => 'Tipe pekerjaan wajib dipilih.',
            'tgl_buka.required' => 'Tanggal buka wajib diisi.',
            'tgl_tutup.after_or_equal' => 'Tanggal tutup harus sama atau setelah tanggal buka.',
            'status.required' => 'Status lowongan wajib dipilih.',
        ]);

        // Auto generate kode lowongan: LOW-YYYY-SEQ
        $year = date('Y');
        $prefix = "LOW-{$year}-";
        $latest = Lowongan::where('kode_lowongan', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        $nextSeq = 1;
        if ($latest && preg_match('/LOW-\d{4}-(\d+)/', $latest->kode_lowongan, $matches)) {
            $nextSeq = ((int) $matches[1]) + 1;
        }
        $kodeLowongan = $prefix . str_pad((string) $nextSeq, 3, '0', STR_PAD_LEFT);

        // Generate Slug
        $baseSlug = Str::slug($validated['judul']) . '-' . strtolower(str_replace('-', '', $kodeLowongan));
        $slug = $baseSlug;
        $counter = 1;
        while (Lowongan::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $validated['kode_lowongan'] = $kodeLowongan;
        $validated['slug'] = $slug;
        $validated['created_by'] = $user?->id;

        $lowongan = Lowongan::create($validated);

        if (!empty($validated['permintaan_rekrutmen_id'])) {
            PermintaanRekrutmen::where('id', $validated['permintaan_rekrutmen_id'])
                ->update(['status_persetujuan' => 'disetujui']);
        }

        $message = $validated['status'] === 'draft'
            ? "Lowongan '{$lowongan->judul}' berhasil disimpan sebagai Draft."
            : "Lowongan '{$lowongan->judul}' berhasil dipublikasikan!";

        return redirect()->route('lowongan.index')->with('success', $message);
    }

    /**
     * Display the specified vacancy detail page.
     */
    public function show(Lowongan $lowongan): Response
    {
        $lowongan->load([
            'departement',
            'jabatan',
            'permintaanRekrutmen.requester',
            'creator',
            'pelamars' => function ($q) {
                $q->orderBy('id', 'desc');
            },
        ]);

        return Inertia::render('lowongan/Show', [
            'lowongan' => [
                'id' => $lowongan->id,
                'kode_lowongan' => $lowongan->kode_lowongan,
                'slug' => $lowongan->slug,
                'judul' => $lowongan->judul,
                'kd_departement' => $lowongan->kd_departement,
                'departement' => $lowongan->departement ? [
                    'id' => $lowongan->departement->id,
                    'kd_departement' => $lowongan->departement->kd_departement,
                    'deskripsi' => $lowongan->departement->deskripsi,
                ] : null,
                'posisi_id' => $lowongan->posisi_id,
                'jabatan' => $lowongan->jabatan ? [
                    'id' => $lowongan->jabatan->id,
                    'nama_jabatan' => $lowongan->jabatan->nama_jabatan,
                ] : null,
                'permintaan_rekrutmen' => $lowongan->permintaanRekrutmen ? [
                    'id' => $lowongan->permintaanRekrutmen->id,
                    'kode_permintaan' => $lowongan->permintaanRekrutmen->kode_permintaan,
                    'requester_name' => $lowongan->permintaanRekrutmen->requester?->name,
                    'target_join' => $lowongan->permintaanRekrutmen->target_join?->format('Y-m-d'),
                    'prioritas' => $lowongan->permintaanRekrutmen->prioritas,
                ] : null,
                'jumlah_dibutuhkan' => $lowongan->jumlah_dibutuhkan,
                'pelamars_count' => $lowongan->pelamars->count(),
                'lokasi_kerja' => $lowongan->lokasi_kerja,
                'tipe_pekerjaan' => $lowongan->tipe_pekerjaan,
                'deskripsi' => $lowongan->deskripsi,
                'kualifikasi' => $lowongan->kualifikasi,
                'tgl_buka' => $lowongan->tgl_buka ? $lowongan->tgl_buka->format('Y-m-d') : null,
                'tgl_tutup' => $lowongan->tgl_tutup ? $lowongan->tgl_tutup->format('Y-m-d') : null,
                'status' => $lowongan->status,
                'share_url' => url('/karir/' . $lowongan->slug),
                'created_at' => $lowongan->created_at ? $lowongan->created_at->format('Y-m-d H:i') : null,
                'pelamars' => $lowongan->pelamars->map(fn ($p) => [
                    'id' => $p->id,
                    'no_pendaftaran' => $p->no_pendaftaran,
                    'nama_lengkap' => $p->nama_lengkap,
                    'foto_url' => $p->foto_path ? asset('storage/' . $p->foto_path) : null,
                    'email' => $p->email,
                    'nomor_kontak' => $p->nomor_kontak,
                    'pendidikan_terakhir' => $p->pendidikan_terakhir,
                    'nama_institusi' => $p->nama_institusi,
                    'jurusan' => $p->jurusan,
                    'status' => $p->status,
                    'created_at' => $p->created_at ? $p->created_at->format('Y-m-d H:i') : null,
                ]),
            ],
        ]);
    }

    /**
     * Show form for editing a vacancy.
     */
    public function edit(Lowongan $lowongan): Response
    {
        $lowongan->load(['departement', 'jabatan', 'permintaanRekrutmen.requester']);

        $departements = Departement::orderBy('kd_departement')->get(['id', 'kd_departement', 'deskripsi']);
        $jabatans = Jabatan::orderBy('nama_jabatan')->get(['id', 'kd_departement', 'kd_jabatan', 'nama_jabatan']);

        return Inertia::render('lowongan/Edit', [
            'lowongan' => [
                'id' => $lowongan->id,
                'kode_lowongan' => $lowongan->kode_lowongan,
                'slug' => $lowongan->slug,
                'judul' => $lowongan->judul,
                'kd_departement' => $lowongan->kd_departement,
                'posisi_id' => $lowongan->posisi_id,
                'jumlah_dibutuhkan' => $lowongan->jumlah_dibutuhkan,
                'lokasi_kerja' => $lowongan->lokasi_kerja,
                'tipe_pekerjaan' => $lowongan->tipe_pekerjaan,
                'deskripsi' => $lowongan->deskripsi,
                'kualifikasi' => $lowongan->kualifikasi,
                'tgl_buka' => $lowongan->tgl_buka ? $lowongan->tgl_buka->format('Y-m-d') : null,
                'tgl_tutup' => $lowongan->tgl_tutup ? $lowongan->tgl_tutup->format('Y-m-d') : null,
                'status' => $lowongan->status,
                'permintaan_rekrutmen' => $lowongan->permintaanRekrutmen ? [
                    'id' => $lowongan->permintaanRekrutmen->id,
                    'kode_permintaan' => $lowongan->permintaanRekrutmen->kode_permintaan,
                    'posisi_nama' => $lowongan->jabatan?->nama_jabatan,
                    'departement_nama' => $lowongan->departement?->deskripsi,
                    'requester_name' => $lowongan->permintaanRekrutmen->requester?->name,
                ] : null,
            ],
            'departements' => $departements,
            'jabatans' => $jabatans,
        ]);
    }

    /**
     * Update the specified vacancy.
     */
    public function update(Request $request, Lowongan $lowongan): RedirectResponse
    {
        $validated = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'lokasi_kerja' => ['required', 'string', 'max:150'],
            'tipe_pekerjaan' => ['required', 'string', 'max:50'],
            'deskripsi' => ['nullable', 'string'],
            'kualifikasi' => ['nullable', 'string'],
            'tgl_buka' => ['required', 'date'],
            'tgl_tutup' => ['nullable', 'date', 'after_or_equal:tgl_buka'],
            'status' => ['required', 'in:aktif,ditutup,draft'],
        ], [
            'judul.required' => 'Judul lowongan wajib diisi.',
            'lokasi_kerja.required' => 'Lokasi kerja wajib diisi.',
            'tipe_pekerjaan.required' => 'Tipe pekerjaan wajib dipilih.',
            'tgl_buka.required' => 'Tanggal buka wajib diisi.',
            'tgl_tutup.after_or_equal' => 'Tanggal tutup harus sama atau setelah tanggal buka.',
            'status.required' => 'Status lowongan wajib dipilih.',
        ]);

        $lowongan->update($validated);

        return back()->with('success', "Lowongan '{$lowongan->judul}' berhasil diperbarui.");
    }

    /**
     * Toggle status between aktif and ditutup.
     */
    public function toggleStatus(Lowongan $lowongan): RedirectResponse
    {
        $newStatus = $lowongan->status === 'aktif' ? 'ditutup' : 'aktif';
        $lowongan->update(['status' => $newStatus]);

        $statusText = $newStatus === 'aktif' ? 'dibuka kembali' : 'ditutup';
        return back()->with('success', "Lowongan '{$lowongan->judul}' berhasil {$statusText}.");
    }

    /**
     * Remove the specified vacancy from storage.
     */
    public function destroy(Lowongan $lowongan): RedirectResponse
    {
        $judul = $lowongan->judul;
        $lowongan->delete();

        return redirect()->route('lowongan.index')->with('success', "Lowongan '{$judul}' berhasil dihapus.");
    }
}
