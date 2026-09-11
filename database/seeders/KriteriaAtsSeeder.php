<?php

namespace Database\Seeders;

use App\Models\KriteriaAts;
use App\Models\Lowongan;
use Illuminate\Database\Seeder;

class KriteriaAtsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        KriteriaAts::truncate();

        // ────────────────────────────────────────────────────────────────────────
        // 1. H1 (Marketing & Sales - Sesuai Gambar ATS)
        // ────────────────────────────────────────────────────────────────────────
        $h1Criteria = [
            [
                'divisi' => 'H1',
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan Relevan',
                'kebutuhan' => 'Minimal D3/S1 Manajemen Pemasaran / Komunikasi / Bisnis',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => ['pemasaran', 'marketing', 'manajemen', 'komunikasi', 'bisnis', 'humas', 'ilmu komunikasi'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
            ],
            [
                'divisi' => 'H1',
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman Marketing & Sales',
                'kebutuhan' => 'Minimal 1-2 tahun bidang pemasaran atau penjualan',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => ['marketing', 'sales', 'penjualan', 'account executive', 'promosi'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
            ],
            [
                'divisi' => 'H1',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Digital Marketing & Ads (Google / Meta)',
                'kebutuhan' => 'Wajib (Digital Marketing, Google Ads, Meta Ads, SEO/SEM)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['digital marketing', 'google ads', 'meta ads', 'facebook ads', 'instagram ads', 'seo', 'sem', 'social media', 'tiktok'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 3,
            ],
            [
                'divisi' => 'H1',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Target Penjualan & Negosiasi',
                'kebutuhan' => 'Mampu mencapai target penjualan dan negosiasi pelanggan',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['target penjualan', 'negosiasi', 'closing', 'target', 'omzet', 'persuasi'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 4,
            ],
            [
                'divisi' => 'H1',
                'kategori' => 'Keahlian Tambahan',
                'nama_kriteria' => 'Public Speaking, Canva & CRM',
                'kebutuhan' => 'Public speaking, kemampuan desain Canva, dan CRM',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['public speaking', 'presentasi', 'canva', 'desain', 'crm', 'kreatif', 'copywriting'],
                'bobot' => 15,
                'is_wajib' => false,
                'urutan' => 5,
            ],
        ];

        // ────────────────────────────────────────────────────────────────────────
        // 2. HC3 (Pelayanan Customer / Honda Customer Care Center)
        // ────────────────────────────────────────────────────────────────────────
        $hc3Criteria = [
            [
                'divisi' => 'HC3',
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan Formal',
                'kebutuhan' => 'Minimal SMA/SMK / D3 / S1 Semua Jurusan (Komunikasi nilai tambah)',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => ['komunikasi', 'sastra', 'manajemen', 'semua jurusan', 'administrasi'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
            ],
            [
                'divisi' => 'HC3',
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman CS / Pelayanan Konsumen',
                'kebutuhan' => 'Minimal 1 tahun customer service / call center / frontliner',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => ['customer service', 'call center', 'frontliner', 'cs', 'resepsionis', 'pelayanan', 'hc3'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
            ],
            [
                'divisi' => 'HC3',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Customer Handling & Complaint Handling',
                'kebutuhan' => 'Wajib (Komunikasi aktif, penanganan keluhan dan problem solving)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['customer handling', 'complaint handling', 'komunikasi', 'keluhan', 'ramah', 'service excellent'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 3,
            ],
            [
                'divisi' => 'HC3',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'CRM (mis. Zendesk) & Call Center',
                'kebutuhan' => 'Penguasaan sistem CRM atau aplikasi call center',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['crm', 'zendesk', 'call center', 'telephony', 'ticketing', 'live chat'],
                'bobot' => 15,
                'is_wajib' => true,
                'urutan' => 4,
            ],
            [
                'divisi' => 'HC3',
                'kategori' => 'Keahlian Tambahan',
                'nama_kriteria' => 'Microsoft Office & Bahasa Asing',
                'kebutuhan' => 'Microsoft Office (Excel/Word) & bahasa asing jika diperlukan',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['microsoft office', 'excel', 'word', 'bahasa inggris', 'english', 'mandarin'],
                'bobot' => 15,
                'is_wajib' => false,
                'urutan' => 5,
            ],
        ];

        // ────────────────────────────────────────────────────────────────────────
        // 3. H2 (Service Motor / Teknisi / Tech Service)
        // ────────────────────────────────────────────────────────────────────────
        $h2Criteria = [
            [
                'divisi' => 'H2',
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan SMK Otomotif',
                'kebutuhan' => 'Minimal SMK Otomotif / Teknik Sepeda Motor / Mesin',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => ['otomotif', 'teknik sepeda motor', 'mesin', 'tsm', 'tkr', 'kendaraan ringan'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
            ],
            [
                'divisi' => 'H2',
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman Bengkel',
                'kebutuhan' => 'Minimal 1-2 tahun mekanik / teknisi bengkel motor',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => ['bengkel', 'mekanik', 'teknisi motor', 'service', 'ahass', 'service advisor', 'h2'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
            ],
            [
                'divisi' => 'H2',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Diagnosis Motor, Injeksi & Kelistrikan',
                'kebutuhan' => 'Wajib (Sistem Injeksi PGM-FI, Kelistrikan Motor, Pengetahuan Engine)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['diagnosis motor', 'injeksi', 'kelistrikan', 'engine', 'pgm-fi', 'efi', 'mesin'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 3,
            ],
            [
                'divisi' => 'H2',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Tune Up & Penggunaan Scanner',
                'kebutuhan' => 'Penggunaan alat diagnostic scanner engine & servis tune-up',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['tune up', 'scanner', 'hids', 'alat ukur', 'diagnostic tool', 'multitester'],
                'bobot' => 15,
                'is_wajib' => true,
                'urutan' => 4,
            ],
            [
                'divisi' => 'H2',
                'kategori' => 'Sertifikasi',
                'nama_kriteria' => 'Sertifikat Pabrikan (Honda/Yamaha)',
                'kebutuhan' => 'Sertifikat pelatihan mekanik (Honda/Yamaha/BNSP)',
                'tipe_penilaian' => 'sertifikasi',
                'keywords' => ['honda', 'yamaha', 'sertifikat', 'bnsp', 'ahass', 'training mekanik', 'ttl 1', 'ttl 2'],
                'bobot' => 15,
                'is_wajib' => false,
                'urutan' => 5,
            ],
        ];

        // ────────────────────────────────────────────────────────────────────────
        // 4. IT (Teknologi Informasi)
        // ────────────────────────────────────────────────────────────────────────
        $itCriteria = [
            [
                'divisi' => 'IT',
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan IT',
                'kebutuhan' => 'Minimal D3/S1 Teknik Informatika / Sistem Informasi / Ilmu Komputer',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => ['informatika', 'komputer', 'sistem informasi', 'teknologi informasi', 'software', 'ilmu komputer'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
            ],
            [
                'divisi' => 'IT',
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman Kerja IT',
                'kebutuhan' => 'Minimal 2 tahun di bidang IT / Programmer / Network / Support',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => ['programmer', 'developer', 'it support', 'network', 'administrator', 'software engineer'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
            ],
            [
                'divisi' => 'IT',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'SQL / Database',
                'kebutuhan' => 'Wajib (Query, RDBMS, MySQL, PostgreSQL, Database Design)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['sql', 'database', 'mysql', 'postgresql', 'oracle', 'sql server', 'query', 'erd'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 3,
            ],
            [
                'divisi' => 'IT',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Networking (Mikrotik / Cisco)',
                'kebutuhan' => 'Wajib (Konfigurasi Jaringan LAN/WAN, Mikrotik, Cisco, Routing)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['networking', 'jaringan', 'mikrotik', 'cisco', 'lan', 'wan', 'routing', 'switching', 'tcp/ip', 'firewall'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 4,
            ],
            [
                'divisi' => 'IT',
                'kategori' => 'Keahlian Tambahan',
                'nama_kriteria' => 'Windows Server / Linux & Troubleshooting / Python',
                'kebutuhan' => 'OS Server, Linux, Python/Programming, IT Support & Troubleshooting',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['windows server', 'linux', 'python', 'php', 'laravel', 'it support', 'troubleshooting', 'sertifikasi', 'ccna', 'mtcna'],
                'bobot' => 15,
                'is_wajib' => false,
                'urutan' => 5,
            ],
        ];

        // ────────────────────────────────────────────────────────────────────────
        // 5. HRD (Human Resources Development)
        // ────────────────────────────────────────────────────────────────────────
        $hrdCriteria = [
            [
                'divisi' => 'HRD',
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan Relevan',
                'kebutuhan' => 'Minimal S1 Psikologi / Hukum / Manajemen SDM',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => ['psikologi', 'hukum', 'manajemen sdm', 'sdm', 'manajemen sumber daya manusia'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
            ],
            [
                'divisi' => 'HRD',
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman HRD',
                'kebutuhan' => 'Minimal 1-2 tahun di bidang Human Resources / Rekrutmen',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => ['hrd', 'human resources', 'recruiter', 'personalia', 'talent acquisition'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
            ],
            [
                'divisi' => 'HRD',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Recruitment & Training Development',
                'kebutuhan' => 'Wajib (End-to-end recruitment, sourcing, interview & pelatihan karyawan)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['recruitment', 'training', 'development', 'sourcing', 'psikotes', 'onboarding'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 3,
            ],
            [
                'divisi' => 'HRD',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Payroll, UU Ketenagakerjaan & BPJS',
                'kebutuhan' => 'Wajib (Pemahaman UU Ketenagakerjaan, BPJS Ketenagakerjaan/Kesehatan, Payroll)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['payroll', 'uu ketenagakerjaan', 'bpjs', 'penggajian', 'cipta kerja', 'pp 35'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 4,
            ],
            [
                'divisi' => 'HRD',
                'kategori' => 'Keahlian Tambahan',
                'nama_kriteria' => 'Employee Relations & Administrasi HR',
                'kebutuhan' => 'Hubungan industrial, administrasi HR, dan Microsoft Office',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['employee relations', 'administrasi hr', 'hubungan industrial', 'microsoft office', 'excel'],
                'bobot' => 15,
                'is_wajib' => false,
                'urutan' => 5,
            ],
        ];

        // ────────────────────────────────────────────────────────────────────────
        // 6. FINANCE (Finance & Accounting)
        // ────────────────────────────────────────────────────────────────────────
        $financeCriteria = [
            [
                'divisi' => 'Finance',
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan Akuntansi',
                'kebutuhan' => 'Minimal D3/S1 Akuntansi / Keuangan / Perbankan',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => ['akuntansi', 'accounting', 'keuangan', 'finance', 'perbankan'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
            ],
            [
                'divisi' => 'Finance',
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman Finance & Accounting',
                'kebutuhan' => 'Minimal 1-2 tahun finance, accounting, atau audit',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => ['finance', 'accounting', 'akuntan', 'kasir', 'keuangan', 'audit'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
            ],
            [
                'divisi' => 'Finance',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Excel (Advanced) & Financial Reporting',
                'kebutuhan' => 'Wajib (Excel tingkat mahir, laporan keuangan, analisa keuangan)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['excel', 'financial reporting', 'laporan keuangan', 'analisa keuangan', 'pivot', 'vlookup'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 3,
            ],
            [
                'divisi' => 'Finance',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Accurate / SAP / Jurnal',
                'kebutuhan' => 'Menguasai software akuntansi (Accurate, SAP, Jurnal, MYOB)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['accurate', 'sap', 'jurnal', 'myob', 'zahir', 'erp finance', 'buku besar'],
                'bobot' => 15,
                'is_wajib' => true,
                'urutan' => 4,
            ],
            [
                'divisi' => 'Finance',
                'kategori' => 'Sertifikasi / Pajak',
                'nama_kriteria' => 'Pajak, Brevet & Audit',
                'kebutuhan' => 'Pemahaman perpajakan (PPh/PPN), sertifikat Brevet A/B, audit (jika ada)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['pajak', 'tax', 'brevet', 'brevet a', 'brevet b', 'pph', 'ppn', 'efaktur', 'audit'],
                'bobot' => 15,
                'is_wajib' => false,
                'urutan' => 5,
            ],
        ];

        // ────────────────────────────────────────────────────────────────────────
        // 7. H3 (Part Motor / Sparepart Dept.)
        // ────────────────────────────────────────────────────────────────────────
        $h3Criteria = [
            [
                'divisi' => 'H3',
                'kategori' => 'Pendidikan',
                'nama_kriteria' => 'Pendidikan Formal',
                'kebutuhan' => 'Minimal SMA/SMK / D3 Logistik / Teknik / Administrasi',
                'tipe_penilaian' => 'pendidikan',
                'keywords' => ['logistik', 'pergudangan', 'teknik', 'administrasi', 'semua jurusan'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 1,
            ],
            [
                'divisi' => 'H3',
                'kategori' => 'Pengalaman Kerja',
                'nama_kriteria' => 'Pengalaman di Bidang Sparepart / Gudang',
                'kebutuhan' => 'Minimal 1 tahun pergudangan atau suku cadang motor',
                'tipe_penilaian' => 'pengalaman',
                'keywords' => ['sparepart', 'gudang', 'warehouse', 'suku cadang', 'parts', 'logistik', 'h3'],
                'bobot' => 25,
                'is_wajib' => true,
                'urutan' => 2,
            ],
            [
                'divisi' => 'H3',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Inventory Management & Gudang',
                'kebutuhan' => 'Wajib (Manajemen stok gudang, FIFO/LIFO, tata letak barang)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['inventory management', 'gudang', 'manajemen stok', 'fifo', 'inbound', 'outbound'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 3,
            ],
            [
                'divisi' => 'H3',
                'kategori' => 'Keahlian / Skill',
                'nama_kriteria' => 'Stock Opname & Pengetahuan Kode Part',
                'kebutuhan' => 'Wajib (Stock opname berkala, pemahaman katalog & kode part motor)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['stock opname', 'kode part', 'katalog part', 'sparepart motor', 'honda part', 'hgp'],
                'bobot' => 20,
                'is_wajib' => true,
                'urutan' => 4,
            ],
            [
                'divisi' => 'H3',
                'kategori' => 'Keahlian Tambahan',
                'nama_kriteria' => 'ERP / Sistem Inventory & Microsoft Office',
                'kebutuhan' => 'Penggunaan sistem ERP inventory & Microsoft Office (Excel)',
                'tipe_penilaian' => 'keyword',
                'keywords' => ['erp', 'sistem inventory', 'microsoft office', 'excel', 'barcode', 'wms'],
                'bobot' => 15,
                'is_wajib' => false,
                'urutan' => 5,
            ],
        ];

        // Insert default templates (where lowongan_id = null)
        $allTemplates = array_merge(
            $h1Criteria,
            $hc3Criteria,
            $h2Criteria,
            $itCriteria,
            $hrdCriteria,
            $financeCriteria,
            $h3Criteria
        );

        foreach ($allTemplates as $tpl) {
            KriteriaAts::create($tpl);
        }

        // ────────────────────────────────────────────────────────────────────────
        // SINKRONISASI KE SELURUH LOWONGAN DI DATABASE
        // ────────────────────────────────────────────────────────────────────────
        $lowongans = Lowongan::with(['departement', 'jabatan'])->get();
        foreach ($lowongans as $l) {
            $kdDept = strtoupper($l->departement?->kd_departement ?? '');
            $judul = strtolower($l->judul);
            $namaJabatan = strtolower($l->jabatan?->nama_jabatan ?? '');

            // Determine exact division code: H1, HC3, H2, IT, HRD, Finance, H3
            $targetDivisi = 'IT';
            if ($kdDept === 'H1') {
                $targetDivisi = 'H1';
            } elseif ($kdDept === 'H2') {
                $targetDivisi = 'H2';
            } elseif ($kdDept === 'H3') {
                $targetDivisi = 'H3';
            } elseif ($kdDept === 'HC3') {
                $targetDivisi = 'HC3';
            } elseif ($kdDept === 'IT') {
                $targetDivisi = 'IT';
            } elseif ($kdDept === 'HR') {
                $targetDivisi = 'HRD';
            } elseif ($kdDept === 'FINANCE') {
                $targetDivisi = 'Finance';
            } else {
                // Fallback by title / position
                if (str_contains($judul, 'market') || str_contains($namaJabatan, 'sales')) {
                    $targetDivisi = 'H1';
                } elseif (str_contains($judul, 'customer') || str_contains($judul, 'cs')) {
                    $targetDivisi = 'HC3';
                } elseif (str_contains($judul, 'service') || str_contains($judul, 'mekanik')) {
                    $targetDivisi = 'H2';
                } elseif (str_contains($judul, 'part') || str_contains($judul, 'sparepart')) {
                    $targetDivisi = 'H3';
                } elseif (str_contains($judul, 'finance') || str_contains($judul, 'akuntan')) {
                    $targetDivisi = 'Finance';
                } elseif (str_contains($judul, 'hr') || str_contains($judul, 'recruitment')) {
                    $targetDivisi = 'HRD';
                }
            }

            // Copy criteria template specifically for this lowongan so HR can customize it!
            $sourceTemplates = KriteriaAts::whereNull('lowongan_id')
                ->where('divisi', $targetDivisi)
                ->get();

            foreach ($sourceTemplates as $st) {
                KriteriaAts::create([
                    'divisi' => $targetDivisi,
                    'lowongan_id' => $l->id,
                    'kategori' => $st->kategori,
                    'nama_kriteria' => $st->nama_kriteria,
                    'kebutuhan' => $st->kebutuhan,
                    'tipe_penilaian' => $st->tipe_penilaian,
                    'keywords' => $st->keywords,
                    'bobot' => $st->bobot,
                    'is_wajib' => $st->is_wajib,
                    'urutan' => $st->urutan,
                    'active' => true,
                ]);
            }
        }
    }
}
