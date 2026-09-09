<?php

namespace App\Http\Controllers;

use App\Mail\StatusLamaranUpdatedMail;
use App\Models\Lowongan;
use App\Models\Pelamar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PelamarController extends Controller
{
    /**
     * Display a listing of candidates/applicants and their details.
     */
    public function index(Request $request): Response
    {
        $query = Pelamar::with(['lowongan.departement', 'lowongan.jabatan'])
            ->whereHas('lowongan', function ($q) {
                $q->where('status', 'aktif');
            })
            ->orderBy('id', 'desc');

        if ($request->filled('lowongan_id')) {
            $query->where('lowongan_id', $request->lowongan_id);
        }

        $pelamars = $query->get()->map(function (Pelamar $p) {
            return [
                'id' => $p->id,
                'no_pendaftaran' => $p->no_pendaftaran,
                'nama_lengkap' => $p->nama_lengkap,
                'tempat_lahir' => $p->tempat_lahir,
                'tanggal_lahir' => $p->tanggal_lahir ? $p->tanggal_lahir->format('Y-m-d') : null,
                'jenis_kelamin' => $p->jenis_kelamin,
                'status_pernikahan' => $p->status_pernikahan,
                'agama' => $p->agama,
                'alamat' => $p->alamat,
                'domisili' => $p->domisili,
                'nomor_kontak' => $p->nomor_kontak,
                'email' => $p->email,
                'pendidikan_terakhir' => $p->pendidikan_terakhir,
                'nama_institusi' => $p->nama_institusi,
                'jurusan' => $p->jurusan,
                'tahun_lulus' => $p->tahun_lulus,
                'posisi_dilamar' => $p->posisi_dilamar,
                'foto_url' => $p->foto_url,
                'cv_url' => $p->cv_url,
                'surat_lamaran_url' => $p->surat_lamaran_path ? asset('storage/' . $p->surat_lamaran_path) : null,
                'status' => $p->status,
                'catatan' => $p->catatan,
                'lowongan' => $p->lowongan ? [
                    'id' => $p->lowongan->id,
                    'kode_lowongan' => $p->lowongan->kode_lowongan,
                    'judul' => $p->lowongan->judul,
                    'departemen_nama' => $p->lowongan->departement?->deskripsi,
                    'posisi_nama' => $p->lowongan->jabatan?->nama_jabatan,
                    'kd_jabatan' => $p->lowongan->jabatan?->kd_jabatan,
                ] : null,
                'created_at' => $p->created_at ? $p->created_at->format('Y-m-d H:i') : null,
            ];
        });

        $lowongans = Lowongan::where('status', 'aktif')
            ->orderBy('id', 'desc')
            ->get(['id', 'kode_lowongan', 'judul']);

        return Inertia::render('pelamar/Index', [
            'pelamars' => $pelamars,
            'lowongans' => $lowongans,
            'selectedLowonganId' => $request->lowongan_id ?? null,
        ]);
    }

    /**
     * Display the specified candidate detail page.
     */
    public function show(Pelamar $pelamar): Response
    {
        $pelamar->load([
            'lowongan.departement',
            'lowongan.jabatan',
            'formulirLamaran',
            'latestPenilaianSkillTest.penguji',
        ]);

        return Inertia::render('pelamar/Show', [
            'pelamar' => [
                'id' => $pelamar->id,
                'no_pendaftaran' => $pelamar->no_pendaftaran,
                'nama_lengkap' => $pelamar->nama_lengkap,
                'tempat_lahir' => $pelamar->tempat_lahir,
                'tanggal_lahir' => $pelamar->tanggal_lahir ? $pelamar->tanggal_lahir->format('Y-m-d') : null,
                'jenis_kelamin' => $pelamar->jenis_kelamin,
                'status_pernikahan' => $pelamar->status_pernikahan,
                'agama' => $pelamar->agama,
                'alamat' => $pelamar->alamat,
                'domisili' => $pelamar->domisili,
                'nomor_kontak' => $pelamar->nomor_kontak,
                'email' => $pelamar->email,
                'pendidikan_terakhir' => $pelamar->pendidikan_terakhir,
                'nama_institusi' => $pelamar->nama_institusi,
                'jurusan' => $pelamar->jurusan,
                'tahun_lulus' => $pelamar->tahun_lulus,
                'posisi_dilamar' => $pelamar->posisi_dilamar,
                'sumber_informasi' => $pelamar->sumber_informasi,
                'foto_url' => $pelamar->foto_url,
                'cv_url' => $pelamar->cv_url,
                'surat_lamaran_url' => $pelamar->surat_lamaran_path ? asset('storage/' . $pelamar->surat_lamaran_path) : null,
                'has_formulir' => (bool) $pelamar->formulirLamaran,
                'formulir_submitted' => (bool) $pelamar->formulirLamaran?->is_submitted,
                'status' => $pelamar->status,
                'tahap_gagal' => $pelamar->effective_tahap_gagal,
                'catatan' => $pelamar->catatan,
                'lowongan' => $pelamar->lowongan ? [
                    'id' => $pelamar->lowongan->id,
                    'kode_lowongan' => $pelamar->lowongan->kode_lowongan,
                    'judul' => $pelamar->lowongan->judul,
                    'departemen_nama' => $pelamar->lowongan->departement?->deskripsi,
                    'posisi_nama' => $pelamar->lowongan->jabatan?->nama_jabatan,
                    'kd_jabatan' => $pelamar->lowongan->jabatan?->kd_jabatan,
                ] : null,
                'skill_test_assessment' => $pelamar->latestPenilaianSkillTest ? [
                    'id' => $pelamar->latestPenilaianSkillTest->id,
                    'total_skor' => (float) $pelamar->latestPenilaianSkillTest->total_skor,
                    'nilai_akhir' => (float) $pelamar->latestPenilaianSkillTest->nilai_akhir,
                    'rekomendasi' => $pelamar->latestPenilaianSkillTest->rekomendasi,
                    'status' => $pelamar->latestPenilaianSkillTest->status,
                    'tanggal_test' => $pelamar->latestPenilaianSkillTest->tanggal_test ? $pelamar->latestPenilaianSkillTest->tanggal_test->isoFormat('D MMMM Y') : null,
                    'nama_penguji' => $pelamar->latestPenilaianSkillTest->nama_penguji ?: ($pelamar->latestPenilaianSkillTest->penguji?->name ?? 'Penguji'),
                ] : null,
                'created_at' => $pelamar->created_at ? $pelamar->created_at->format('Y-m-d H:i') : null,
            ],
        ]);
    }

    /**
     * Update recruitment stage / selection status of a candidate.
     */
    public function updateStatus(Request $request, Pelamar $pelamar): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:submitted,screening_cv,lengkapi_formulir,interview_hr,skill_test,interview_user,interview_gm,final_discussion,accepted,rejected,review,interview'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ], [
            'status.required' => 'Tahapan seleksi wajib dipilih.',
            'status.in' => 'Tahapan seleksi tidak valid.',
        ]);

        $updateData = $validated;
        if ($validated['status'] === 'rejected') {
            if ($pelamar->status !== 'rejected') {
                $updateData['tahap_gagal'] = $pelamar->status;
            }
        } else {
            $updateData['tahap_gagal'] = null;
        }

        $pelamar->update($updateData);

        if (!empty($pelamar->email)) {
            try {
                Mail::to($pelamar->email)->queue(
                    new StatusLamaranUpdatedMail(
                        $pelamar->fresh(['lowongan.departement', 'lowongan.jabatan']),
                        $validated['status'],
                        $validated['catatan'] ?? null
                    )
                );
            } catch (\Throwable $e) {
                Log::error("Gagal queue email status pelamar ID {$pelamar->id}: " . $e->getMessage());
            }
        }

        $stageLabels = [
            'submitted' => 'Submit Lamaran',
            'screening_cv' => 'Screening CV',
            'lengkapi_formulir' => 'Lengkapi Formulir Lamaran Kerja',
            'interview_hr' => 'Interview HR',
            'skill_test' => 'Skill Test',
            'interview_user' => 'Interview User',
            'interview_gm' => 'Interview GM',
            'final_discussion' => 'Final Discussion',
            'accepted' => 'Diterima (Accepted)',
            'rejected' => 'Ditolak (Rejected)',
            'review' => 'Screening CV',
            'interview' => 'Interview HR',
        ];

        $label = $stageLabels[$pelamar->status] ?? $pelamar->status;

        return back()->with('success', "Tahapan seleksi '{$pelamar->nama_lengkap}' berhasil diperbarui menjadi {$label} & notifikasi email telah diantrekan.");
    }

    /**
     * Bulk update selection status of multiple candidates.
     */
    public function bulkUpdateStatus(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pelamar_ids' => ['required', 'array', 'min:1'],
            'pelamar_ids.*' => ['required', Rule::exists(Pelamar::class, 'id')],
            'status' => ['required', 'in:submitted,screening_cv,lengkapi_formulir,interview_hr,skill_test,interview_user,interview_gm,final_discussion,accepted,rejected'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        $pelamars = Pelamar::with(['lowongan.departement', 'lowongan.jabatan'])
            ->whereIn('id', $validated['pelamar_ids'])
            ->get();

        $count = 0;
        foreach ($pelamars as $p) {
            $updateData = [
                'status' => $validated['status'],
                'catatan' => $validated['catatan'] ?? null,
            ];

            if ($validated['status'] === 'rejected') {
                if ($p->status !== 'rejected') {
                    $updateData['tahap_gagal'] = $p->status;
                }
            } else {
                $updateData['tahap_gagal'] = null;
            }

            $p->update($updateData);
            $count++;

            if (!empty($p->email)) {
                try {
                    Mail::to($p->email)->queue(
                        new StatusLamaranUpdatedMail(
                            $p,
                            $validated['status'],
                            $validated['catatan'] ?? null
                        )
                    );
                } catch (\Throwable $e) {
                    Log::error("Gagal queue email bulk status pelamar ID {$p->id}: " . $e->getMessage());
                }
            }
        }

        $stageLabels = [
            'interview_hr' => 'Interview HR',
            'interview_user' => 'Interview User',
            'skill_test' => 'Skill Test',
            'accepted' => 'Diterima',
            'rejected' => 'Ditolak / Gagal',
        ];

        $label = $stageLabels[$validated['status']] ?? $validated['status'];

        return back()->with('success', "Sebanyak {$count} kandidat berhasil diperbarui ke tahap: {$label} & notifikasi email telah diantrekan.");
    }

    /**
     * Remove the candidate application from storage.
     */
    public function destroy(Pelamar $pelamar): RedirectResponse
    {
        $name = $pelamar->nama_lengkap;

        if ($pelamar->foto_path && Storage::disk('public')->exists($pelamar->foto_path)) {
            Storage::disk('public')->delete($pelamar->foto_path);
        }

        if ($pelamar->cv_path && Storage::disk('public')->exists($pelamar->cv_path)) {
            Storage::disk('public')->delete($pelamar->cv_path);
        }

        if ($pelamar->surat_lamaran_path && Storage::disk('public')->exists($pelamar->surat_lamaran_path)) {
            Storage::disk('public')->delete($pelamar->surat_lamaran_path);
        }

        $pelamar->delete();

        return redirect()->route('pelamar.index')->with('success', "Data pelamar '{$name}' berhasil dihapus.");
    }
}
