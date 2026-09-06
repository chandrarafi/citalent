<?php

namespace App\Http\Controllers;

use App\Http\Requests\PermintaanRekrutmenRequest;
use App\Models\Departement;
use App\Models\Jabatan;
use App\Models\Lowongan;
use App\Models\PermintaanRekrutmen;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PermintaanRekrutmenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = PermintaanRekrutmen::with(['departement', 'jabatan', 'requester', 'lowongan'])
            ->orderBy('id', 'desc');

        // Jika bukan super-admin atau HR, hanya tampilkan data milik user login
        if ($user && !$user->hasRole(['super-admin', 'hr', 'hr-manager'])) {
            $query->where('requester_id', $user->id);
        }

        $permintaans = $query->get()
            ->map(function ($p) {
                $lowongan = $p->lowongan ? [
                    'id' => $p->lowongan->id,
                    'kode_lowongan' => $p->lowongan->kode_lowongan,
                    'slug' => $p->lowongan->slug,
                    'judul' => $p->lowongan->judul,
                    'lokasi_kerja' => $p->lowongan->lokasi_kerja,
                    'tipe_pekerjaan' => $p->lowongan->tipe_pekerjaan,
                    'deskripsi' => $p->lowongan->deskripsi,
                    'kualifikasi' => $p->lowongan->kualifikasi,
                    'tgl_buka' => $p->lowongan->tgl_buka ? $p->lowongan->tgl_buka->format('Y-m-d') : null,
                    'tgl_tutup' => $p->lowongan->tgl_tutup ? $p->lowongan->tgl_tutup->format('Y-m-d') : null,
                    'status' => $p->lowongan->status,
                    'share_url' => url('/karir/' . $p->lowongan->slug),
                ] : null;

                return [
                    'id' => $p->id,
                    'kode_permintaan' => $p->kode_permintaan,
                    'kd_departement' => $p->kd_departement,
                    'departement' => $p->departement ? [
                        'id' => $p->departement->id,
                        'kd_departement' => $p->departement->kd_departement,
                        'deskripsi' => $p->departement->deskripsi,
                    ] : null,
                    'posisi_id' => $p->posisi_id,
                    'jabatan' => $p->jabatan ? [
                        'id' => $p->jabatan->id,
                        'kd_departement' => $p->jabatan->kd_departement,
                        'kd_jabatan' => $p->jabatan->kd_jabatan,
                        'nama_jabatan' => $p->jabatan->nama_jabatan,
                    ] : null,
                    'requester_id' => $p->requester_id,
                    'requester' => $p->requester ? [
                        'id' => $p->requester->id,
                        'name' => $p->requester->name,
                        'email' => $p->requester->email,
                    ] : null,
                    'jumlah' => $p->jumlah,
                    'tgl_permintaan' => $p->tgl_permintaan ? $p->tgl_permintaan->format('Y-m-d') : null,
                    'target_join' => $p->target_join ? $p->target_join->format('Y-m-d') : null,
                    'prioritas' => $p->prioritas,
                    'status_persetujuan' => $p->status_persetujuan,
                    'lowongan' => $lowongan,
                    'created_at' => $p->created_at ? $p->created_at->format('Y-m-d H:i') : null,
                ];
            });

        $departements = Departement::orderBy('kd_departement')
            ->get(['id', 'kd_departement', 'deskripsi', 'active']);

        $jabatans = Jabatan::orderBy('nama_jabatan')
            ->get(['id', 'kd_departement', 'kd_jabatan', 'nama_jabatan', 'active']);

        return Inertia::render('permintaan-rekrutmen/Index', [
            'permintaans' => $permintaans,
            'departements' => $departements,
            'jabatans' => $jabatans,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PermintaanRekrutmenRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['status_persetujuan'] = $data['status_persetujuan'] ?? 'pending';
        $data['requester_id'] = $request->user()?->id;

        PermintaanRekrutmen::create($data);

        return redirect()->route('permintaan-rekrutmen.index')
            ->with('success', 'Permintaan rekrutmen berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PermintaanRekrutmenRequest $request, PermintaanRekrutmen $permintaanrekrutman): RedirectResponse
    {
        $user = $request->user();
        if ($user && !$user->hasRole(['super-admin', 'hr', 'hr-manager']) && $permintaanrekrutman->requester_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah data ini.');
        }

        $permintaanrekrutman->update($request->validated());

        return redirect()->route('permintaan-rekrutmen.index')
            ->with('success', 'Permintaan rekrutmen berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, PermintaanRekrutmen $permintaanrekrutman): RedirectResponse
    {
        $user = $request->user();
        if ($user && !$user->hasRole(['super-admin', 'hr', 'hr-manager']) && $permintaanrekrutman->requester_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus data ini.');
        }

        $permintaanrekrutman->delete();

        return redirect()->route('permintaan-rekrutmen.index')
            ->with('success', 'Permintaan rekrutmen berhasil dihapus.');
    }

    /**
     * Approve the recruitment request (HR / Super Admin only).
     */
    public function approve(Request $request, PermintaanRekrutmen $permintaanrekrutman): RedirectResponse
    {
        $user = $request->user();
        if (!$user || !$user->hasRole(['super-admin', 'hr', 'hr-manager'])) {
            abort(403, 'Hanya HR atau Super Admin yang dapat menyetujui permintaan.');
        }

        $permintaanrekrutman->update([
            'status_persetujuan' => 'disetujui',
        ]);

        return redirect()->route('permintaan-rekrutmen.index')
            ->with('success', "Permintaan '{$permintaanrekrutman->kode_permintaan}' berhasil disetujui. Anda dapat mempublikasikan lowongan pekerjaan.");
    }

    /**
     * Reject the recruitment request (HR / Super Admin only).
     */
    public function reject(Request $request, PermintaanRekrutmen $permintaanrekrutman): RedirectResponse
    {
        $user = $request->user();
        if (!$user || !$user->hasRole(['super-admin', 'hr', 'hr-manager'])) {
            abort(403, 'Hanya HR atau Super Admin yang dapat menolak permintaan.');
        }

        $permintaanrekrutman->update([
            'status_persetujuan' => 'ditolak',
        ]);

        return redirect()->route('permintaan-rekrutmen.index')
            ->with('success', "Permintaan '{$permintaanrekrutman->kode_permintaan}' telah ditolak.");
    }

    /**
     * Publish recruitment request as a public job vacancy (Lowongan).
     */
    public function publish(Request $request, PermintaanRekrutmen $permintaanrekrutman): RedirectResponse
    {
        $user = $request->user();
        if (!$user || !$user->hasRole(['super-admin', 'hr', 'hr-manager'])) {
            abort(403, 'Hanya HR atau Super Admin yang dapat mempublikasikan lowongan.');
        }

        $validated = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'lokasi_kerja' => ['required', 'string', 'max:150'],
            'tipe_pekerjaan' => ['required', 'string', 'max:50'],
            'deskripsi' => ['nullable', 'string'],
            'kualifikasi' => ['nullable', 'string'],
            'tgl_buka' => ['required', 'date'],
            'tgl_tutup' => ['nullable', 'date', 'after_or_equal:tgl_buka'],
        ], [
            'judul.required' => 'Judul lowongan wajib diisi.',
            'lokasi_kerja.required' => 'Lokasi kerja wajib diisi.',
            'tipe_pekerjaan.required' => 'Tipe pekerjaan wajib dipilih.',
            'tgl_buka.required' => 'Tanggal buka wajib diisi.',
            'tgl_tutup.after_or_equal' => 'Tanggal tutup harus sama atau setelah tanggal buka.',
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
        while (Lowongan::where('slug', $slug)->where('permintaan_rekrutmen_id', '!=', $permintaanrekrutman->id)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        // Set request to approved
        $permintaanrekrutman->update(['status_persetujuan' => 'disetujui']);

        // Create or update Lowongan
        $lowongan = Lowongan::updateOrCreate(
            ['permintaan_rekrutmen_id' => $permintaanrekrutman->id],
            [
                'kode_lowongan' => $kodeLowongan,
                'slug' => $slug,
                'judul' => $validated['judul'],
                'kd_departement' => $permintaanrekrutman->kd_departement,
                'posisi_id' => $permintaanrekrutman->posisi_id,
                'jumlah_dibutuhkan' => $permintaanrekrutman->jumlah,
                'lokasi_kerja' => $validated['lokasi_kerja'],
                'tipe_pekerjaan' => $validated['tipe_pekerjaan'],
                'deskripsi' => $validated['deskripsi'] ?? null,
                'kualifikasi' => $validated['kualifikasi'] ?? null,
                'tgl_buka' => $validated['tgl_buka'],
                'tgl_tutup' => $validated['tgl_tutup'] ?? null,
                'status' => 'aktif',
                'created_by' => $user->id,
            ]
        );

        $shareUrl = url('/karir/' . $lowongan->slug);

        return redirect()->route('permintaan-rekrutmen.index')
            ->with('success', "Lowongan pekerjaan '{$lowongan->judul}' berhasil dipublikasikan! Link pendaftaran kandidat: {$shareUrl}");
    }
}
