<?php

namespace Database\Seeders;

use App\Models\KriteriaAts;
use App\Models\Lowongan;
use Illuminate\Database\Seeder;

class KriteriaAtsCdbVerifikatorSeeder extends Seeder
{
    /**
     * Run the database seeds for Lowongan CDB Verifikator (LOW-2026-006).
     */
    public function run(): void
    {
        // Find Lowongan CDB Verifikator by ID or Kode Lowongan
        $lowongan = Lowongan::where('kode_lowongan', 'LOW-2026-006')
            ->orWhere('id', 20)
            ->first();

        if (!$lowongan) {
            $this->command->error('Lowongan CDB Verifikator (LOW-2026-006 / ID: 20) tidak ditemukan.');
            return;
        }

        $lowonganId = $lowongan->id;
        $divisi = $lowongan->departement?->kd_departement ?? 'HC3';

        // Remove existing criteria for this lowongan if any to prevent duplicates
        KriteriaAts::where('lowongan_id', $lowonganId)->delete();

        $criteria = [
            [
                'divisi' => $divisi,
                'lowongan_id' => $lowonganId,
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan Formal (D3 / S1)',
                'kebutuhan' => 'Pendidikan Minimal D3/S1 Lebih Diutamakan Semua Jurusan (Komunikasi, Manajemen, Administrasi, Sistem Informasi nilai tambah)',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => [
                    'd3',
                    's1',
                    'diploma',
                    'sarjana',
                    'semua jurusan',
                    'manajemen',
                    'komunikasi',
                    'administrasi',
                    'sistem informasi',
                    'teknik informatika',
                    'akuntansi',
                    'ilmu komunikasi',
                ],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
                'active' => true,
            ],
            [
                'divisi' => $divisi,
                'lowongan_id' => $lowonganId,
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Microsoft Office & Excel Olah Data',
                'kebutuhan' => 'Mampu mengoperasikan Microsoft Office terutama Excel (formula data, VLOOKUP, HLOOKUP, Pivot Table, sorting, filtering dan validasi data)',
                'tipe_penilaian' => 'keyword',
                'keywords' => [
                    'excel',
                    'microsoft excel',
                    'ms excel',
                    'vlookup',
                    'hlookup',
                    'pivot table',
                    'spreadsheets',
                    'olah data',
                    'data entry',
                    'formula excel',
                    'microsoft office',
                    'ms office',
                ],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
                'active' => true,
            ],
            [
                'divisi' => $divisi,
                'lowongan_id' => $lowonganId,
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman Verifikasi / Data Entry / Administrasi',
                'kebutuhan' => 'Pengalaman di bidang verifikasi data, validasi dokumen customer, input database, administrasi data, atau customer service',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => [
                    'verifikator',
                    'verifikasi data',
                    'data entry',
                    'administrasi',
                    'database',
                    'validasi data',
                    'input data',
                    'customer database',
                    'staff administrasi',
                    'admin',
                    'back office',
                ],
                'bobot' => 20,
                'is_wajib' => false,
                'urutan' => 3,
                'active' => true,
            ],
            [
                'divisi' => $divisi,
                'lowongan_id' => $lowonganId,
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Komunikasi & Follow-up Customer',
                'kebutuhan' => 'Memiliki kemampuan komunikasi yang baik, mampu melakukan follow-up dan klarifikasi data kepada customer serta koordinasi tim',
                'tipe_penilaian' => 'keyword',
                'keywords' => [
                    'komunikasi',
                    'customer service',
                    'customer care',
                    'follow up',
                    'klarifikasi',
                    'pelayanan konsumen',
                    'telepon',
                    'call center',
                    'customer relationship',
                    'interpersonal',
                    'koordinasi',
                ],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 4,
                'active' => true,
            ],
            [
                'divisi' => $divisi,
                'lowongan_id' => $lowonganId,
                'kategori' => 'Karakter & Soft Skill',
                'nama_kriteria' => 'Ketelitian, Kerja Tim & Pelaporan',
                'kebutuhan' => 'Teliti, detail, disiplin, bertanggung jawab, mampu bekerja secara individu maupun tim, dan mampu membuat laporan hasil verifikasi',
                'tipe_penilaian' => 'keyword',
                'keywords' => [
                    'teliti',
                    'detail',
                    'laporan',
                    'reporting',
                    'kerja tim',
                    'teamwork',
                    'disiplin',
                    'tanggung jawab',
                    'analitis',
                    'laporan verifikasi',
                ],
                'bobot' => 15,
                'is_wajib' => true,
                'urutan' => 5,
                'active' => true,
            ],
        ];

        foreach ($criteria as $item) {
            KriteriaAts::create($item);
        }

        $this->command->info("Berhasil membuat " . count($criteria) . " kriteria ATS untuk Lowongan '{$lowongan->judul}' (Kode: {$lowongan->kode_lowongan}). Total Bobot: 100%");
    }
}
