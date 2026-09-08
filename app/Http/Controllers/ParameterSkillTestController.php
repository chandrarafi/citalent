<?php

namespace App\Http\Controllers;

use App\Models\DetailParameterSkillTest;
use App\Models\Jabatan;
use App\Models\ParameterSkillTest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ParameterSkillTestController extends Controller
{
    /**
     * Resolve the recruitment stage (tahap) from the request URI or parameter.
     */
    protected function resolveTahap(Request $request): string
    {
        $path = $request->path();
        if (str_contains($path, 'parameter-interview-gm')) {
            return 'interview_gm';
        }
        if (str_contains($path, 'parameter-interview-user')) {
            return 'interview_user';
        }
        if (str_contains($path, 'parameter-interview-hr')) {
            return 'interview_hr';
        }
        return $request->input('jenis_tahap', 'skill_test');
    }

    /**
     * Get stage configuration and metadata.
     */
    protected function getTahapConfig(string $tahap): array
    {
        return match ($tahap) {
            'interview_hr' => [
                'tahap' => 'interview_hr',
                'title' => 'Parameter Penilaian Interview HR',
                'subtitle' => 'Konfigurasi aspek kepribadian, latar belakang, kesesuaian budaya kerja, dan kualifikasi umum per jabatan.',
                'route_prefix' => 'parameter-interview-hr',
                'permission' => 'manage-parameter-interview-hr',
                'allowed_jabatans' => null,
            ],
            'interview_user' => [
                'tahap' => 'interview_user',
                'title' => 'Parameter Penilaian Interview User',
                'subtitle' => 'Konfigurasi aspek kompetensi kerja mendalam, pemecahan masalah teknis, dan kesiapan tim per jabatan.',
                'route_prefix' => 'parameter-interview-user',
                'permission' => 'manage-parameter-interview-user',
                'allowed_jabatans' => null,
            ],
            'interview_gm' => [
                'tahap' => 'interview_gm',
                'title' => 'Parameter Penilaian Interview GM',
                'subtitle' => 'Konfigurasi parameter penilaian tahap General Manager khusus untuk posisi pimpinan / manajerial (JBT-6 dan JBT-37).',
                'route_prefix' => 'parameter-interview-gm',
                'permission' => 'manage-parameter-interview-gm',
                'allowed_jabatans' => ['JBT-6', 'JBT-37'],
            ],
            default => [
                'tahap' => 'skill_test',
                'title' => 'Parameter Penilaian Skill Test',
                'subtitle' => 'Konfigurasi aspek teknis, bobot penilaian, dan kriteria uji kompetensi keahlian per jabatan.',
                'route_prefix' => 'parameter-skill-test',
                'permission' => 'manage-parameter-skill-test',
                'allowed_jabatans' => ['JBT-5', 'JBT-26', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31'],
            ],
        };
    }

    /**
     * Display a listing of parameters grouped by Jabatan (position).
     */
    public function index(Request $request): Response
    {
        $tahap = $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);
        $selectedKdJabatan = $request->input('kd_jabatan');

        $query = ParameterSkillTest::with(['jabatan.departement', 'details'])
            ->where('jenis_tahap', $tahap)
            ->orderBy('kd_jabatan')
            ->orderBy('urutan');

        if ($config['allowed_jabatans']) {
            $query->whereIn('kd_jabatan', $config['allowed_jabatans']);
        }

        if ($selectedKdJabatan) {
            $query->where('kd_jabatan', $selectedKdJabatan);
        }

        $allParameters = $query->get();

        // Group by position
        $groupedPositions = $allParameters->groupBy('kd_jabatan')->map(function ($items, $kdJabatan) use ($tahap) {
            $first = $items->first();
            $params = $items->map(function (ParameterSkillTest $param) {
                return [
                    'id' => $param->id,
                    'kd_jabatan' => $param->kd_jabatan,
                    'jenis_tahap' => $param->jenis_tahap,
                    'parameter' => $param->parameter,
                    'bobot' => (int) $param->bobot,
                    'icon' => $param->icon ?: 'settings',
                    'urutan' => (int) $param->urutan,
                    'active' => (bool) $param->active,
                    'yang_dinilai' => $param->details->map(fn($d) => [
                        'id' => $d->id,
                        'yang_dinilai' => $d->yang_dinilai,
                        'urutan' => (int) $d->urutan,
                    ])->all(),
                ];
            })->values()->all();

            return [
                'kd_jabatan' => $kdJabatan,
                'jenis_tahap' => $tahap,
                'nama_jabatan' => $first->jabatan?->nama_jabatan ?? $kdJabatan,
                'departement' => $first->jabatan?->departement?->deskripsi ?? 'General',
                'total_bobot' => (int) $items->sum('bobot'),
                'total_parameters' => $items->count(),
                'total_items_dinilai' => $items->sum(fn($i) => $i->details->count()),
                'parameters' => $params,
            ];
        })->values();

        // Master jabatan options (filtered if specific jabatans allowed)
        $jabatanQuery = Jabatan::with('departement')->orderBy('nama_jabatan');
        if ($config['allowed_jabatans']) {
            $jabatanQuery->whereIn('kd_jabatan', $config['allowed_jabatans']);
        }

        $jabatans = $jabatanQuery->get()->map(function (Jabatan $j) {
            return [
                'id' => $j->id,
                'kd_jabatan' => $j->kd_jabatan,
                'nama_jabatan' => $j->nama_jabatan,
                'departement' => $j->departement?->deskripsi ?? 'General',
            ];
        });

        return Inertia::render('parameter-skill-test/Index', [
            'positions' => $groupedPositions,
            'jabatans' => $jabatans,
            'selectedKdJabatan' => $selectedKdJabatan,
            'tahapConfig' => $config,
        ]);
    }

    /**
     * Bulk save / synchronize all parameters and criteria for a Jabatan.
     */
    public function saveJabatan(Request $request): RedirectResponse
    {
        $tahap = $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $validated = $request->validate([
            'kd_jabatan' => ['required', 'string', 'max:50'],
            'parameters' => ['required', 'array', 'min:1'],
            'parameters.*.id' => ['nullable', 'integer'],
            'parameters.*.parameter' => ['required', 'string', 'max:255'],
            'parameters.*.bobot' => ['required', 'integer', 'min:1', 'max:100'],
            'parameters.*.icon' => ['nullable', 'string', 'max:50'],
            'parameters.*.urutan' => ['nullable', 'integer'],
            'parameters.*.active' => ['nullable', 'boolean'],
            'parameters.*.yang_dinilai' => ['required', 'array', 'min:1'],
            'parameters.*.yang_dinilai.*' => ['required', 'string', 'max:500'],
        ]);

        $kdJabatan = $validated['kd_jabatan'];

        // Enforce restriction for GM
        if ($config['allowed_jabatans'] && !in_array($kdJabatan, $config['allowed_jabatans'])) {
            return back()->with('error', 'Jabatan ini tidak diizinkan untuk konfigurasi tahap ' . $config['title']);
        }

        DB::transaction(function () use ($validated, $kdJabatan, $tahap) {
            $submittedIds = collect($validated['parameters'])->pluck('id')->filter()->all();

            // Delete removed parameters for this position and stage
            ParameterSkillTest::where('kd_jabatan', $kdJabatan)
                ->where('jenis_tahap', $tahap)
                ->whereNotIn('id', $submittedIds)
                ->delete();

            foreach ($validated['parameters'] as $idx => $paramData) {
                $paramId = $paramData['id'] ?? null;
                $param = null;

                if ($paramId) {
                    $param = ParameterSkillTest::where('kd_jabatan', $kdJabatan)
                        ->where('jenis_tahap', $tahap)
                        ->where('id', $paramId)
                        ->first();
                }

                if ($param) {
                    $param->update([
                        'parameter' => $paramData['parameter'],
                        'bobot' => $paramData['bobot'],
                        'icon' => $paramData['icon'] ?? 'settings',
                        'urutan' => $paramData['urutan'] ?? ($idx + 1),
                        'active' => $paramData['active'] ?? true,
                    ]);
                } else {
                    $param = ParameterSkillTest::create([
                        'kd_jabatan' => $kdJabatan,
                        'jenis_tahap' => $tahap,
                        'parameter' => $paramData['parameter'],
                        'bobot' => $paramData['bobot'],
                        'icon' => $paramData['icon'] ?? 'settings',
                        'urutan' => $paramData['urutan'] ?? ($idx + 1),
                        'active' => $paramData['active'] ?? true,
                    ]);
                }

                // Sync details (Yang Dinilai)
                $param->details()->delete();
                $itemIndex = 1;
                foreach ($paramData['yang_dinilai'] as $item) {
                    if (trim($item) !== '') {
                        DetailParameterSkillTest::create([
                            'parameter_skill_test_id' => $param->id,
                            'yang_dinilai' => trim($item),
                            'urutan' => $itemIndex++,
                        ]);
                    }
                }
            }
        });

        return back()->with('success', "Konfigurasi parameter {$config['title']} posisi jabatan berhasil disimpan.");
    }

    /**
     * Store a single newly created parameter.
     */
    public function store(Request $request): RedirectResponse
    {
        $tahap = $this->resolveTahap($request);
        $config = $this->getTahapConfig($tahap);

        $validated = $request->validate([
            'kd_jabatan' => ['required', 'string', 'max:50'],
            'parameter' => ['required', 'string', 'max:255'],
            'bobot' => ['required', 'integer', 'min:1', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'urutan' => ['nullable', 'integer', 'min:1'],
            'active' => ['nullable', 'boolean'],
            'yang_dinilai' => ['required', 'array', 'min:1'],
            'yang_dinilai.*' => ['required', 'string', 'max:500'],
        ]);

        if ($config['allowed_jabatans'] && !in_array($validated['kd_jabatan'], $config['allowed_jabatans'])) {
            return back()->with('error', 'Jabatan ini tidak diizinkan untuk konfigurasi tahap ' . $config['title']);
        }

        DB::transaction(function () use ($validated, $request, $tahap) {
            $param = ParameterSkillTest::create([
                'kd_jabatan' => $validated['kd_jabatan'],
                'jenis_tahap' => $tahap,
                'parameter' => $validated['parameter'],
                'bobot' => $validated['bobot'],
                'icon' => $validated['icon'] ?? 'settings',
                'urutan' => $validated['urutan'] ?? (ParameterSkillTest::where('kd_jabatan', $validated['kd_jabatan'])->where('jenis_tahap', $tahap)->count() + 1),
                'active' => $request->boolean('active', true),
            ]);

            foreach ($validated['yang_dinilai'] as $idx => $item) {
                if (trim($item) !== '') {
                    DetailParameterSkillTest::create([
                        'parameter_skill_test_id' => $param->id,
                        'yang_dinilai' => trim($item),
                        'urutan' => $idx + 1,
                    ]);
                }
            }
        });

        return back()->with('success', "Parameter {$config['title']} berhasil ditambahkan.");
    }

    /**
     * Update a single parameter.
     */
    public function update(Request $request, ParameterSkillTest $parameterSkillTest): RedirectResponse
    {
        $validated = $request->validate([
            'kd_jabatan' => ['required', 'string', 'max:50'],
            'parameter' => ['required', 'string', 'max:255'],
            'bobot' => ['required', 'integer', 'min:1', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'urutan' => ['nullable', 'integer', 'min:1'],
            'active' => ['nullable', 'boolean'],
            'yang_dinilai' => ['required', 'array', 'min:1'],
            'yang_dinilai.*' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($validated, $request, $parameterSkillTest) {
            $parameterSkillTest->update([
                'kd_jabatan' => $validated['kd_jabatan'],
                'parameter' => $validated['parameter'],
                'bobot' => $validated['bobot'],
                'icon' => $validated['icon'] ?? $parameterSkillTest->icon,
                'urutan' => $validated['urutan'] ?? $parameterSkillTest->urutan,
                'active' => $request->boolean('active', true),
            ]);

            $parameterSkillTest->details()->delete();

            foreach ($validated['yang_dinilai'] as $idx => $item) {
                if (trim($item) !== '') {
                    DetailParameterSkillTest::create([
                        'parameter_skill_test_id' => $parameterSkillTest->id,
                        'yang_dinilai' => trim($item),
                        'urutan' => $idx + 1,
                    ]);
                }
            }
        });

        return back()->with('success', 'Parameter berhasil diperbarui.');
    }

    /**
     * Toggle active status of the parameter.
     */
    public function toggleStatus(ParameterSkillTest $parameterSkillTest): RedirectResponse
    {
        $parameterSkillTest->active = ! $parameterSkillTest->active;
        $parameterSkillTest->save();

        return back()->with('success', 'Status parameter berhasil diubah.');
    }

    /**
     * Remove an entire position's configuration for the resolved stage.
     */
    public function destroyJabatan(Request $request, string $kdJabatan): RedirectResponse
    {
        $tahap = $this->resolveTahap($request);
        ParameterSkillTest::where('kd_jabatan', $kdJabatan)->where('jenis_tahap', $tahap)->delete();

        return back()->with('success', 'Semua parameter untuk posisi tersebut berhasil dihapus.');
    }

    /**
     * Remove a single parameter.
     */
    public function destroy(ParameterSkillTest $parameterSkillTest): RedirectResponse
    {
        $parameterSkillTest->delete();

        return back()->with('success', 'Parameter berhasil dihapus.');
    }
}
