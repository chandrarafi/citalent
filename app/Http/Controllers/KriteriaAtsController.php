<?php

namespace App\Http\Controllers;

use App\Models\KriteriaAts;
use App\Models\Lowongan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KriteriaAtsController extends Controller
{
    /**
     * Display a listing of the ATS criteria based on Lowongan.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $lowonganId = $request->input('lowongan_id');
        $tipe = $request->input('tipe'); // 'all', 'pendidikan', 'pengalaman', 'keyword', 'sertifikasi'
        $status = $request->input('status'); // 'all', 'active', 'inactive'

        $query = KriteriaAts::with(['lowongan.departement'])
            ->orderBy('lowongan_id')
            ->orderBy('urutan')
            ->orderBy('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_kriteria', 'ilike', "%{$search}%")
                    ->orWhere('kebutuhan', 'ilike', "%{$search}%")
                    ->orWhere('kategori', 'ilike', "%{$search}%")
                    ->orWhereHas('lowongan', function ($lq) use ($search) {
                        $lq->where('judul', 'ilike', "%{$search}%")
                           ->orWhere('kode_lowongan', 'ilike', "%{$search}%");
                    })
                    ->orWhereRaw("keywords::text ilike ?", ["%{$search}%"]);
            });
        }

        if ($lowonganId && $lowonganId !== 'all') {
            $query->where('lowongan_id', $lowonganId);
        }

        if ($tipe && $tipe !== 'all') {
            $query->where('tipe_penilaian', $tipe);
        }

        if ($status === 'active') {
            $query->where('active', true);
        } elseif ($status === 'inactive') {
            $query->where('active', false);
        }

        $kriteriaList = $query->get();

        // Available Lowongans for filter & form selector
        $lowongans = Lowongan::with('departement')
            ->select('id', 'judul', 'kode_lowongan', 'kd_departement')
            ->orderBy('judul')
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'judul' => $l->judul,
                'kode_lowongan' => $l->kode_lowongan,
                'departement' => $l->departement?->deskripsi ?? '',
            ]);

        // Distinct categories for quick suggestions
        $dbKategori = KriteriaAts::select('kategori')
            ->distinct()
            ->whereNotNull('kategori')
            ->orderBy('kategori')
            ->pluck('kategori')
            ->toArray();

        $defaultKategori = ['Pendidikan', 'Pengalaman Kerja', 'Keahlian / Skill', 'Sertifikasi', 'Keahlian Tambahan', 'Bahasa'];
        $allKategori = array_values(array_unique(array_merge($dbKategori, $defaultKategori)));

        // Statistics
        $allCount = KriteriaAts::count();
        $configuredLowonganCount = KriteriaAts::whereNotNull('lowongan_id')->distinct('lowongan_id')->count('lowongan_id');
        $activeCount = KriteriaAts::where('active', true)->count();
        $wajibCount = KriteriaAts::where('is_wajib', true)->count();

        return Inertia::render('kriteria-ats/Index', [
            'kriteriaList' => $kriteriaList,
            'lowonganOptions' => $lowongans,
            'kategoriOptions' => $allKategori,
            'stats' => [
                'total' => $allCount,
                'lowonganTerkonfigurasi' => $configuredLowonganCount,
                'active' => $activeCount,
                'wajib' => $wajibCount,
            ],
            'filters' => [
                'search' => $search ?? '',
                'lowongan_id' => $lowonganId ?? 'all',
                'tipe' => $tipe ?? 'all',
                'status' => $status ?? 'all',
            ],
        ]);
    }

    /**
     * Store a newly created criteria for a Lowongan.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateKriteria($request);

        $kriteria = KriteriaAts::create($validated);
        $lowonganJudul = $kriteria->lowongan?->judul ?? 'Lowongan';

        return back()->with('success', "Kriteria ATS '{$kriteria->nama_kriteria}' untuk {$lowonganJudul} berhasil ditambahkan.");
    }

    /**
     * Update the specified criteria.
     */
    public function update(Request $request, KriteriaAts $kriteria): RedirectResponse
    {
        $validated = $this->validateKriteria($request);

        $kriteria->update($validated);
        $lowonganJudul = $kriteria->lowongan?->judul ?? 'Lowongan';

        return back()->with('success', "Kriteria ATS '{$kriteria->nama_kriteria}' untuk {$lowonganJudul} berhasil diperbarui.");
    }

    /**
     * Remove the specified criteria.
     */
    public function destroy(KriteriaAts $kriteria): RedirectResponse
    {
        $name = $kriteria->nama_kriteria;
        $lowonganJudul = $kriteria->lowongan?->judul ?? '';
        $kriteria->delete();

        return back()->with('success', "Kriteria ATS '{$name}' " . ($lowonganJudul ? "({$lowonganJudul}) " : "") . "berhasil dihapus.");
    }

    /**
     * Quick toggle active status.
     */
    public function toggleActive(KriteriaAts $kriteria): RedirectResponse
    {
        $kriteria->update(['active' => !$kriteria->active]);
        $statusText = $kriteria->active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Kriteria ATS '{$kriteria->nama_kriteria}' berhasil {$statusText}.");
    }

    /**
     * Duplicate an existing criteria to another Lowongan.
     */
    public function duplicate(Request $request, KriteriaAts $kriteria): RedirectResponse
    {
        $validated = $request->validate([
            'target_lowongan_id' => ['required', Rule::exists(Lowongan::class, 'id')],
        ]);

        $targetLowongan = Lowongan::with('departement')->findOrFail($validated['target_lowongan_id']);

        $new = $kriteria->replicate();
        $new->lowongan_id = $targetLowongan->id;
        $new->divisi = $targetLowongan->departement?->kd_departement ?? 'General';
        $new->nama_kriteria = $kriteria->nama_kriteria . ' (Salinan)';
        $new->save();

        return back()->with('success', "Kriteria ATS berhasil disalin ke lowongan '{$targetLowongan->judul}'.");
    }

    /**
     * Validate request payload for store/update.
     */
    protected function validateKriteria(Request $request): array
    {
        $validated = $request->validate([
            'lowongan_id' => ['required', Rule::exists(Lowongan::class, 'id')],
            'kategori' => ['required', 'string', 'max:100'],
            'nama_kriteria' => ['required', 'string', 'max:255'],
            'kebutuhan' => ['required', 'string'],
            'tipe_penilaian' => ['required', 'in:pendidikan,pengalaman,keyword,sertifikasi'],
            'keywords' => ['nullable'],
            'bobot' => ['required', 'integer', 'min:1', 'max:100'],
            'is_wajib' => ['nullable', 'boolean'],
            'urutan' => ['nullable', 'integer', 'min:1'],
            'active' => ['nullable', 'boolean'],
        ]);

        // Auto-fill divisi based on lowongan's department code
        $lowongan = Lowongan::with('departement')->findOrFail($validated['lowongan_id']);
        $validated['divisi'] = $lowongan->departement?->kd_departement ?? 'General';

        $validated['keywords'] = $this->normalizeKeywords($validated['keywords'] ?? []);
        $validated['is_wajib'] = (bool) ($validated['is_wajib'] ?? false);
        $validated['active'] = (bool) ($validated['active'] ?? true);
        $validated['urutan'] = (int) ($validated['urutan'] ?? 1);
        $validated['lowongan_id'] = (int) $validated['lowongan_id'];

        return $validated;
    }

    /**
     * Clean and normalize keywords array/string.
     */
    protected function normalizeKeywords(mixed $keywords): array
    {
        if (is_array($keywords)) {
            return array_values(array_filter(array_map('trim', $keywords)));
        }

        if (is_string($keywords)) {
            $parts = preg_split('/[,\r\n]+/', $keywords);
            return array_values(array_filter(array_map('trim', $parts)));
        }

        return [];
    }
}
