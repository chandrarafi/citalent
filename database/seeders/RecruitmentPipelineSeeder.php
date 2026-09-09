<?php

namespace Database\Seeders;

use App\Models\Departement;
use App\Models\DetailParameterSkillTest;
use App\Models\DetailPenilaianSkillTest;
use App\Models\FormulirLamaran;
use App\Models\Jabatan;
use App\Models\KandidatProfile;
use App\Models\Lowongan;
use App\Models\ParameterSkillTest;
use App\Models\Pelamar;
use App\Models\PenilaianSkillTest;
use App\Models\PermintaanRekrutmen;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RecruitmentPipelineSeeder extends Seeder
{

    public function run(): void
    {
        DB::disableQueryLog();

        // 1. Role Kandidat
        $kandidatRole = Role::firstOrCreate(['name' => 'kandidat'], [
            'label' => 'Kandidat',
            'description' => 'Role untuk pelamar kerja / kandidat rekrutmen.',
        ]);
        $kandidatRoleId = $kandidatRole->id;

        $adminUser = User::where('email', 'admin@citalent.com')->first() ?: User::first();
        $adminId = $adminUser ? $adminUser->id : 1;
        $evaluatorId = $adminId;

        // Hash password once for all 2,750 candidates for blazing fast performance
        $defaultPassword = Hash::make('password123');

        // 2. Setup 4 Target Positions & Lowongans
        $positionsConfig = [
            'it_support' => [
                'kd_jabatan' => 'JBT-29',
                'posisi_id' => 79,
                'kd_departement' => 20,
                'kode_permintaan' => 'REQ-2026-IT-001',
                'kode_lowongan' => 'LOW-2026-001',
                'slug' => 'it-support-specialist-sumbar',
                'judul' => 'IT Support Specialist',
                'jumlah_dibutuhkan' => 1,
                'total_kandidat' => 200,
                'total_accepted' => 1,
                'distribution' => [
                    'accepted' => 1,
                    'final_discussion' => 2,
                    'interview_user' => 4,
                    'interview_hr' => 8,
                    'skill_test' => 15,
                    'lengkapi_formulir' => 20,
                    'screening_cv' => 40,
                    'submitted' => 60,
                    'rejected' => 50,
                ],
                'lokasi_kerja' => 'Kota Padang & Wilayah Sumbar',
                'tipe_pekerjaan' => 'Full-time',
                'deskripsi' => '<p>Bertanggung jawab atas pemeliharaan perangkat keras, sistem operasi, jaringan LAN/WLAN, troubleshooting sistem ERP dealer, serta memberikan bantuan teknis harian kepada seluruh pengguna di kantor pusat dan cabang dealer wilayah Sumatera Barat.</p>',
                'kualifikasi' => '<ul><li>Pendidikan minimal D3/S1 Teknik Informatika, Sistem Informasi, atau Teknik Komputer</li><li>Menguasai troubleshooting hardware PC, Laptop, Printer, dan OS Windows/Linux</li><li>Memahami konfigurasi jaringan LAN, Wi-Fi, Mikrotik dasar, dan IP addressing</li><li>Komunikatif, ramah, dan memiliki etos kerja tinggi</li><li>Bersedia tugas dinas ke cabang wilayah Sumatera Barat</li></ul>',
                'tgl_buka' => '2026-08-01',
                'tgl_tutup' => '2026-10-30',
            ],
            'it_programmer' => [
                'kd_jabatan' => 'JBT-27',
                'posisi_id' => 77,
                'kd_departement' => 20,
                'kode_permintaan' => 'REQ-2026-IT-002',
                'kode_lowongan' => 'LOW-2026-002',
                'slug' => 'it-fullstack-programmer-padang',
                'judul' => 'IT Programmer',
                'jumlah_dibutuhkan' => 5,
                'total_kandidat' => 550,
                'total_accepted' => 5,
                'distribution' => [
                    'accepted' => 5,
                    'final_discussion' => 5,
                    'interview_user' => 15,
                    'interview_hr' => 25,
                    'skill_test' => 50,
                    'lengkapi_formulir' => 75,
                    'screening_cv' => 125,
                    'submitted' => 150,
                    'rejected' => 100,
                ],
                'lokasi_kerja' => 'Kantor Pusat Padang',
                'tipe_pekerjaan' => 'Full-time',
                'deskripsi' => '<p>Merancang, mengembangkan, menguji, dan memelihara aplikasi web core bisnis internal perusahaan (HRIS, Sales & Service CRM, Inventory ERP) menggunakan stack modern Laravel & React TypeScript.</p>',
                'kualifikasi' => '<ul><li>Pendidikan minimal S1 Teknik Informatika, Sistem Informasi, Ilmu Komputer atau setara</li><li>Pengalaman minimal 1-2 tahun membangun aplikasi berbasis PHP Laravel & Modern Javascript (React/Vue)</li><li>Mahir SQL (PostgreSQL/MySQL), REST API, Git version control, dan clean architecture</li><li>Memiliki portfolio aplikasi nyata yang pernah dibangun</li></ul>',
                'tgl_buka' => '2026-08-01',
                'tgl_tutup' => '2026-10-30',
            ],
            'administrasi' => [
                'kd_jabatan' => 'JBT-38',
                'posisi_id' => 90,
                'kd_departement' => 16,
                'kode_permintaan' => 'REQ-2026-CDB-001',
                'kode_lowongan' => 'LOW-2026-003',
                'slug' => 'administrasi-cdb-padang',
                'judul' => 'Administrasi',
                'jumlah_dibutuhkan' => 5,
                'total_kandidat' => 1500,
                'total_accepted' => 5,
                'distribution' => [
                    'accepted' => 5,
                    'final_discussion' => 10,
                    'interview_user' => 25,
                    'interview_hr' => 60,
                    'skill_test' => 100,
                    'lengkapi_formulir' => 200,
                    'screening_cv' => 400,
                    'submitted' => 450,
                    'rejected' => 250,
                ],
                'lokasi_kerja' => 'Kota Padang',
                'tipe_pekerjaan' => 'Full-time',
                'deskripsi' => '<p>Mengelola kelengkapan dan validasi data administrasi pelanggan (Customer Database), arsip berkas faktur & registrasi kendaraan bermotor, verifikasi dokumen kredit, serta rekonsiliasi data operasional dealer harian.</p>',
                'kualifikasi' => '<ul><li>Pendidikan minimal D3/S1 Manajemen, Akuntansi, Administrasi Bisnis, atau jurusan relevan</li><li>Sangat teliti, cermat dengan angka dan data entry</li><li>Mahir mengoperasikan Microsoft Excel (VLOOKUP, HLOOKUP, Pivot Table, IF)</li><li>Mampu bekerja sama dalam tim dan memiliki komunikasi yang baik</li></ul>',
                'tgl_buka' => '2026-08-01',
                'tgl_tutup' => '2026-10-30',
            ],
            'supervisor' => [
                'kd_jabatan' => 'JBT-37',
                'posisi_id' => 89,
                'kd_departement' => 16,
                'kode_permintaan' => 'REQ-2026-SPV-001',
                'kode_lowongan' => 'LOW-2026-004',
                'slug' => 'supervisor-network-development-sumbar',
                'judul' => 'Supervisor',
                'jumlah_dibutuhkan' => 10,
                'total_kandidat' => 500,
                'total_accepted' => 10,
                'distribution' => [
                    'accepted' => 10,
                    'final_discussion' => 10,
                    'interview_gm' => 15,
                    'interview_user' => 25,
                    'interview_hr' => 40,
                    'lengkapi_formulir' => 80,
                    'screening_cv' => 120,
                    'submitted' => 120,
                    'rejected' => 80,
                ],
                'lokasi_kerja' => 'Sumatera Barat (Padang, Bukittinggi, Solok, Payakumbuh)',
                'tipe_pekerjaan' => 'Full-time',
                'deskripsi' => '<p>Memimpin dan mengkoordinasikan strategi perluasan jaringan dealer, pembinaan tim operasional pos dealer wilayah, monitoring pencapaian target penjualan dan standar pelayanan di seluruh cabang Sumatera Barat.</p>',
                'kualifikasi' => '<ul><li>Pendidikan minimal S1 semua jurusan (diutamakan Manajemen / Bisnis / Teknik)</li><li>Pengalaman minimal 2-3 tahun sebagai Supervisor atau Koordinator Lapangan di industri otomotif / FMCG / Retail</li><li>Memiliki jiwa kepemimpinan (leadership), kemampuan negosiasi, dan analitis yang kuat</li><li>Siap mobile dan bersedia melakukan supervisi rutin ke seluruh cabang Sumbar</li></ul>',
                'tgl_buka' => '2026-08-01',
                'tgl_tutup' => '2026-10-30',
            ],
        ];

        // 3. Realistic West Sumatra Name and Data Dictionaries
        $firstNamesMale = [
            'Fajri',
            'Ilham',
            'Rahmat',
            'Wahyu',
            'Fauzan',
            'Rizky',
            'Hendra',
            'Rendy',
            'Aditya',
            'Bayu',
            'Reza',
            'Kevin',
            'Bobby',
            'Fikri',
            'Dedi',
            'Yulius',
            'Riko',
            'Aldi',
            'Alfikri',
            'Febri',
            'Arif',
            'Bambang',
            'Danang',
            'Eko',
            'Farhan',
            'Genta',
            'Haris',
            'Irfan',
            'Joni',
            'Kurnia',
            'Lukman',
            'Maulana',
            'Nofri',
            'Oki',
            'Pandu',
            'Rian',
            'Satria',
            'Taufik',
            'Vino',
            'Yogi',
            'Zulfikar',
            'Gandi',
            'Hamdan',
            'Iqbal',
            'Jefri',
            'Miko',
            'Nabil',
            'Prasetya'
        ];

        $firstNamesFemale = [
            'Annisa',
            'Putri',
            'Rahma',
            'Mutia',
            'Sarah',
            'Intan',
            'Novia',
            'Suci',
            'Widya',
            'Cindy',
            'Nadia',
            'Fitri',
            'Silvia',
            'Dina',
            'Vina',
            'Riri',
            'Tari',
            'Aulia',
            'Bella',
            'Dewi',
            'Elsa',
            'Febiola',
            'Gita',
            'Hani',
            'Indah',
            'Jasmine',
            'Karina',
            'Laras',
            'Maya',
            'Niken',
            'Olivia',
            'Puspa',
            'Qori',
            'Rania',
            'Salsa',
            'Tiara',
            'Ulfa',
            'Vania',
            'Wulan',
            'Yolanda',
            'Zahra',
            'Anggun',
            'Bunga',
            'Cantika',
            'Dian',
            'Fani',
            'Ghina',
            'Hilda'
        ];

        $middleNames = [
            'Pratama',
            'Hidayat',
            'Saputra',
            'Ramadhan',
            'Kurniawan',
            'Firmansyah',
            'Syahputra',
            'Mahendra',
            'Utama',
            'Wardana',
            'Permana',
            'Setiawan',
            'Nugraha',
            'Wijaya',
            'Rahmadani',
            'Lestari',
            'Wulandari',
            'Maharani',
            'Anggraini',
            'Purnama',
            'Safitri',
            'Nurhaliza',
            'Kusuma',
            'Handayani',
            'Amalia',
            'Safira',
            'Permata',
            'Triana'
        ];

        $lastNamesMinang = [
            'Chaniago',
            'Piliang',
            'Koto',
            'Guci',
            'Sikumbang',
            'Tanjung',
            'Jambak',
            'Caniago',
            'Melayu',
            'Mandailing',
            'Sumpu',
            'Batu Hampa',
            'Dalimo',
            'Putra',
            'Pratama',
            'Saputra',
            'Syahputra',
            'Ramadhan',
            'Firmansyah',
            'Wardana',
            'Kurniawan',
            'Hidayat',
            'Sanjaya',
            'Siregar',
            'Lubis',
            'Pasaribu',
            'Nasution'
        ];

        $sumbarLocations = [
            [
                'kota' => 'Kota Padang',
                'kecamatan' => 'Padang Barat',
                'kelurahan' => 'Ulak Karang Selatan',
                'kodepos' => '25134',
                'jalan' => 'Jl. Khatib Sulaiman No. '
            ],
            [
                'kota' => 'Kota Padang',
                'kecamatan' => 'Koto Tangah',
                'kelurahan' => 'Lubuk Buaya',
                'kodepos' => '25586',
                'jalan' => 'Jl. Adinegoro No. '
            ],
            [
                'kota' => 'Kota Padang',
                'kecamatan' => 'Padang Timur',
                'kelurahan' => 'Sawahan',
                'kodepos' => '25121',
                'jalan' => 'Jl. Sawahan No. '
            ],
            [
                'kota' => 'Kota Padang',
                'kecamatan' => 'Pauh',
                'kelurahan' => 'Limau Manis',
                'kodepos' => '25166',
                'jalan' => 'Jl. Universitas Andalas Kampus Limau Manis No. '
            ],
            [
                'kota' => 'Kota Padang',
                'kecamatan' => 'Padang Utara',
                'kelurahan' => 'Air Tawar Barat',
                'kodepos' => '25131',
                'jalan' => 'Jl. Prof. Dr. Hamka No. '
            ],
            [
                'kota' => 'Kota Bukittinggi',
                'kecamatan' => 'Guguk Panjang',
                'kelurahan' => 'Benteng Pasar Atas',
                'kodepos' => '26113',
                'jalan' => 'Jl. Sudirman No. '
            ],
            [
                'kota' => 'Kota Bukittinggi',
                'kecamatan' => 'Mandiangin Koto Selayan',
                'kelurahan' => 'Campago Guguk Bulek',
                'kodepos' => '26121',
                'jalan' => 'Jl. By Pass No. '
            ],
            [
                'kota' => 'Kota Payakumbuh',
                'kecamatan' => 'Payakumbuh Barat',
                'kelurahan' => 'Bulakan Balai Kandi',
                'kodepos' => '26225',
                'jalan' => 'Jl. Soekarno Hatta No. '
            ],
            [
                'kota' => 'Kota Solok',
                'kecamatan' => 'Lubuk Sikarah',
                'kelurahan' => 'Tanah Garam',
                'kodepos' => '27312',
                'jalan' => 'Jl. Ki Hajar Dewantara No. '
            ],
            [
                'kota' => 'Kota Pariaman',
                'kecamatan' => 'Pariaman Tengah',
                'kelurahan' => 'Pondok II',
                'kodepos' => '25514',
                'jalan' => 'Jl. Syahrir No. '
            ],
            [
                'kota' => 'Kabupaten Tanah Datar',
                'kecamatan' => 'Lima Kaum',
                'kelurahan' => 'Batusangkar',
                'kodepos' => '27211',
                'jalan' => 'Jl. Sutan Alam Bagagarsyah No. '
            ],
            [
                'kota' => 'Kabupaten Pesisir Selatan',
                'kecamatan' => 'IV Jurai',
                'kelurahan' => 'Painan Timur',
                'kodepos' => '25611',
                'jalan' => 'Jl. Ilyas Yakub No. '
            ],
        ];

        $universities = [
            'it' => [
                ['nama' => 'Universitas Andalas (UNAND)', 'jurusan' => 'Sistem Informasi', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Andalas (UNAND)', 'jurusan' => 'Teknik Komputer', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Negeri Padang (UNP)', 'jurusan' => 'Teknik Informatika', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Negeri Padang (UNP)', 'jurusan' => 'Pendidikan Teknik Informatika', 'jenjang' => 'S1'],
                ['nama' => 'Politeknik Negeri Padang (PNP)', 'jurusan' => 'Teknologi Informasi', 'jenjang' => 'D4'],
                ['nama' => 'Politeknik Negeri Padang (PNP)', 'jurusan' => 'Manajemen Informatika', 'jenjang' => 'D3'],
                ['nama' => 'Universitas Putra Indonesia YPTK Padang', 'jurusan' => 'Teknik Informatika', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Putra Indonesia YPTK Padang', 'jurusan' => 'Sistem Komputer', 'jenjang' => 'S1'],
                ['nama' => 'Institut Teknologi Padang (ITP)', 'jurusan' => 'Teknik Informatika', 'jenjang' => 'S1'],
            ],
            'adm' => [
                ['nama' => 'Universitas Andalas (UNAND)', 'jurusan' => 'Manajemen', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Andalas (UNAND)', 'jurusan' => 'Akuntansi', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Andalas (UNAND)', 'jurusan' => 'Ilmu Ekonomi', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Negeri Padang (UNP)', 'jurusan' => 'Manajemen', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Negeri Padang (UNP)', 'jurusan' => 'Pendidikan Administrasi Perkantoran', 'jenjang' => 'S1'],
                ['nama' => 'Politeknik Negeri Padang (PNP)', 'jurusan' => 'Administrasi Bisnis', 'jenjang' => 'D3'],
                ['nama' => 'Politeknik Negeri Padang (PNP)', 'jurusan' => 'Akuntansi Perpajakan', 'jenjang' => 'D4'],
                ['nama' => 'Universitas Bung Hatta', 'jurusan' => 'Manajemen', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Bung Hatta', 'jurusan' => 'Akuntansi', 'jenjang' => 'S1'],
                ['nama' => 'Politeknik ATI Padang', 'jurusan' => 'Manajemen Logistik Industri Agro', 'jenjang' => 'D3'],
            ],
            'spv' => [
                ['nama' => 'Universitas Andalas (UNAND)', 'jurusan' => 'Teknik Industri', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Andalas (UNAND)', 'jurusan' => 'Manajemen Bisnis', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Negeri Padang (UNP)', 'jurusan' => 'Manajemen Pemasaran', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Bung Hatta', 'jurusan' => 'Teknik Industri', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Putra Indonesia YPTK Padang', 'jurusan' => 'Manajemen', 'jenjang' => 'S1'],
                ['nama' => 'Universitas Baiturrahmah', 'jurusan' => 'Manajemen', 'jenjang' => 'S1'],
            ]
        ];

        $sources = [
            'Website Karir Perusahaan',
            'JobStreet Indonesia',
            'LinkedIn Jobs',
            'Instagram @lokerpadang',
            'Instagram @loker_sumbar',
            'Karierhub Kemnaker',
            'Bursa Kerja Khusus Kampus (UNAND/UNP)',
            'Grup Telegram Loker Sumbar',
            'Rekomendasi Karyawan / Rekan Kerja',
        ];

        // 4. Preload Evaluation Parameters
        $parametersByJabatan = [];
        foreach (['JBT-29', 'JBT-27', 'JBT-38', 'JBT-37'] as $kd) {
            $params = ParameterSkillTest::with('details')
                ->where('kd_jabatan', $kd)
                ->get();
            $parametersByJabatan[$kd] = $params;
        }

        // Global candidate counter across all positions
        $candidateSeq = 1;
        $allInsertedPelamars = 0;
        $allInsertedUsers = 0;
        $allInsertedPenilaians = 0;

        // 5. Iterate through each position
        foreach ($positionsConfig as $posKey => $cfg) {
            $kdJabatan = $cfg['kd_jabatan'];
            $posisiId = $cfg['posisi_id'];
            $kdDept = $cfg['kd_departement'];

            // Ensure Permintaan Rekrutmen exists
            $permintaan = PermintaanRekrutmen::firstOrCreate(
                ['kode_permintaan' => $cfg['kode_permintaan']],
                [
                    'kd_departement' => $kdDept,
                    'posisi_id' => $posisiId,
                    'requester_id' => $adminId,
                    'jumlah' => $cfg['jumlah_dibutuhkan'],
                    'tgl_permintaan' => '2026-08-01',
                    'target_join' => '2026-10-01',
                    'prioritas' => 'high',
                    'status_persetujuan' => 'disetujui',
                ]
            );

            // Ensure Lowongan exists
            $lowongan = Lowongan::firstOrCreate(
                ['kode_lowongan' => $cfg['kode_lowongan']],
                [
                    'permintaan_rekrutmen_id' => $permintaan->id,
                    'kd_departement' => $kdDept,
                    'posisi_id' => $posisiId,
                    'judul' => $cfg['judul'],
                    'slug' => $cfg['slug'],
                    'jumlah_dibutuhkan' => $cfg['jumlah_dibutuhkan'],
                    'lokasi_kerja' => $cfg['lokasi_kerja'],
                    'tipe_pekerjaan' => $cfg['tipe_pekerjaan'],
                    'deskripsi' => $cfg['deskripsi'],
                    'kualifikasi' => $cfg['kualifikasi'],
                    'tgl_buka' => $cfg['tgl_buka'],
                    'tgl_tutup' => $cfg['tgl_tutup'],
                    'status' => 'aktif',
                    'created_by' => $adminId,
                ]
            );

            $eduType = match ($posKey) {
                'it_support', 'it_programmer' => 'it',
                'administrasi' => 'adm',
                'supervisor' => 'spv',
            };

            // Build exact candidate list with stages according to distribution
            $stagesPlan = [];
            foreach ($cfg['distribution'] as $stage => $count) {
                for ($i = 0; $i < $count; $i++) {
                    $stagesPlan[] = $stage;
                }
            }
            shuffle($stagesPlan);

            // Ensure accepted candidates are at the beginning for structured processing
            $acceptedIndices = [];
            foreach ($stagesPlan as $idx => $st) {
                if ($st === 'accepted') {
                    $acceptedIndices[] = $idx;
                }
            }

            $totalForPos = count($stagesPlan);
            $this->command->info("Menyiapkan {$totalForPos} kandidat untuk posisi: {$cfg['judul']} ({$cfg['kode_lowongan']})...");

            // Prepare batch data
            $now = Carbon::now();

            // Process candidates in chunks of 100 for optimal memory and speed
            $chunkSize = 100;
            $chunks = array_chunk($stagesPlan, $chunkSize);

            foreach ($chunks as $chunkIdx => $stageChunk) {
                $usersToInsert = [];
                $profilesToInsert = [];
                $pelamarsToInsert = [];
                $formulirsToInsert = [];
                $penilaiansToProcess = [];

                foreach ($stageChunk as $inChunkIdx => $targetStage) {
                    $cNum = $candidateSeq++;
                    $isFemale = ($cNum % 3 === 0);
                    $fName = $isFemale
                        ? $firstNamesFemale[($cNum + 3) % count($firstNamesFemale)]
                        : $firstNamesMale[($cNum + 7) % count($firstNamesMale)];
                    $mName = $middleNames[($cNum + 5) % count($middleNames)];
                    $lName = $lastNamesMinang[($cNum + 11) % count($lastNamesMinang)];

                    // NO GELAR - STRICTLY PURE NAMES
                    $fullName = "{$fName} {$mName} {$lName}";
                    $callName = $fName;

                    $cleanEmail = strtolower(Str::slug("{$fName}-{$mName}-{$lName}", '.')) . "{$cNum}@gmail.com";
                    $noPendaftaran = sprintf('REG-%s-%04d', date('Ymd'), $cNum);
                    $phone = '0812' . sprintf('%08d', 60000000 + $cNum);
                    $loc = $sumbarLocations[$cNum % count($sumbarLocations)];
                    $edu = $universities[$eduType][$cNum % count($universities[$eduType])];
                    $thnLulus = 2021 + ($cNum % 5);
                    $birthYear = 1996 + ($cNum % 8);
                    $birthMonth = ($cNum % 12) + 1;
                    $birthDay = ($cNum % 27) + 1;
                    $birthDate = sprintf('%04d-%02d-%02d', $birthYear, $birthMonth, $birthDay);
                    $gender = $isFemale ? 'Perempuan' : 'Laki-laki';
                    $nik = '1371' . sprintf('%012d', 100000000000 + $cNum);
                    $address = $loc['jalan'] . (($cNum % 120) + 1);

                    // 1. User
                    $user = User::create([
                        'name' => $fullName,
                        'email' => $cleanEmail,
                        'password' => $defaultPassword,
                        'role_id' => $kandidatRoleId,
                        'phone' => $phone,
                        'is_active' => true,
                        'status' => 'active',
                        'email_verified_at' => $now,
                    ]);
                    $allInsertedUsers++;

                    // 2. Kandidat Profile
                    $profile = KandidatProfile::create([
                        'user_id' => $user->id,
                        'tempat_lahir' => $loc['kota'],
                        'tanggal_lahir' => $birthDate,
                        'jenis_kelamin' => $gender,
                        'status_pernikahan' => ($cNum % 4 === 0) ? 'Menikah' : 'Belum Menikah',
                        'agama' => 'Islam',
                        'alamat' => $address,
                        'domisili' => "{$loc['kota']}, Sumatera Barat",
                        'pendidikan_terakhir' => $edu['jenjang'],
                        'nama_institusi' => $edu['nama'],
                        'jurusan' => $edu['jurusan'],
                        'tahun_lulus' => $thnLulus,
                        'foto_path' => 'kandidat/foto/default-kandidat.jpg',
                        'cv_path' => 'kandidat/cv/cv-' . Str::slug($fullName) . '.pdf',
                        'surat_lamaran_path' => 'kandidat/surat_lamaran/surat-' . Str::slug($fullName) . '.pdf',
                        'is_complete' => true,
                    ]);

                    // Determine failure stage if rejected
                    $tahapGagal = null;
                    if ($targetStage === 'rejected') {
                        $failOptions = ['screening_cv', 'skill_test', 'interview_hr', 'interview_user'];
                        $tahapGagal = $failOptions[$cNum % count($failOptions)];
                    }

                    // 3. Pelamar
                    $pelamar = Pelamar::create([
                        'lowongan_id' => $lowongan->id,
                        'no_pendaftaran' => $noPendaftaran,
                        'nama_lengkap' => $fullName,
                        'tempat_lahir' => $loc['kota'],
                        'tanggal_lahir' => $birthDate,
                        'jenis_kelamin' => $gender,
                        'status_pernikahan' => ($cNum % 4 === 0) ? 'Menikah' : 'Belum Menikah',
                        'agama' => 'Islam',
                        'alamat' => $address,
                        'domisili' => "{$loc['kota']}, Sumatera Barat",
                        'nomor_kontak' => $phone,
                        'email' => $cleanEmail,
                        'pendidikan_terakhir' => $edu['jenjang'],
                        'nama_institusi' => $edu['nama'],
                        'jurusan' => $edu['jurusan'],
                        'tahun_lulus' => $thnLulus,
                        'posisi_dilamar' => $cfg['judul'],
                        'sumber_informasi' => $sources[$cNum % count($sources)],
                        'foto_path' => 'kandidat/foto/default-kandidat.jpg',
                        'cv_path' => 'kandidat/cv/cv-' . Str::slug($fullName) . '.pdf',
                        'surat_lamaran_path' => 'kandidat/surat_lamaran/surat-' . Str::slug($fullName) . '.pdf',
                        'pernyataan_kebenaran' => true,
                        'status' => $targetStage,
                        'tahap_gagal' => $tahapGagal,
                        'catatan' => $targetStage === 'accepted' ? 'Kandidat direkomendasikan lulus dan diterima bergabung.' : null,
                    ]);
                    $allInsertedPelamars++;

                    // 4. Formulir Lamaran (Rich Sumatera Barat data matching schema)
                    $pendidikanFormal = [
                        [
                            'tingkat' => 'SLTA',
                            'nama_sekolah' => 'SMAN ' . (($cNum % 10) + 1) . ' ' . $loc['kota'],
                            'tempat' => $loc['kota'],
                            'jurusan' => ($eduType === 'it') ? 'IPA' : 'IPS',
                            'tahun_masuk' => (string) ($thnLulus - 7),
                            'tahun_lulus' => (string) ($thnLulus - 4),
                            'keterangan' => 'Lulus Berijazah',
                        ],
                        [
                            'tingkat' => $edu['jenjang'],
                            'nama_sekolah' => $edu['nama'],
                            'tempat' => 'Kota Padang',
                            'jurusan' => $edu['jurusan'],
                            'tahun_masuk' => (string) ($thnLulus - 4),
                            'tahun_lulus' => (string) $thnLulus,
                            'keterangan' => 'Lulus (IPK: ' . number_format(3.35 + (($cNum % 60) / 100), 2) . ')',
                        ],
                    ];

                    $pengalamanKerja = [
                        [
                            'nama_perusahaan' => 'PT Hayati Pratama Mandiri Padang',
                            'jabatan_terakhir' => 'Staff ' . $cfg['judul'],
                            'tahun_masuk' => (string) ($thnLulus),
                            'tahun_keluar' => (string) ($thnLulus + 2),
                            'gaji_terakhir' => '4200000',
                            'alasan_berhenti' => 'Ingin mengembangkan jenjang karir yang lebih luas.',
                        ],
                        [
                            'nama_perusahaan' => 'CV Minang Solusi Teknologi',
                            'jabatan_terakhir' => 'Junior ' . $cfg['judul'],
                            'tahun_masuk' => (string) ($thnLulus + 2),
                            'tahun_keluar' => '2026',
                            'gaji_terakhir' => '5500000',
                            'alasan_berhenti' => 'Mencari tantangan baru di perusahaan berskala lebih besar.',
                        ]
                    ];

                    $susunanKeluarga = [
                        [
                            'hubungan' => 'Ayah',
                            'nama' => "Bapak {$mName} {$lName}",
                            'jenis_kelamin' => 'Laki-laki',
                            'usia' => '56',
                            'pendidikan' => 'S1',
                            'pekerjaan' => 'PNS / Wiraswasta',
                            'perusahaan' => 'Padang',
                        ],
                        [
                            'hubungan' => 'Ibu',
                            'nama' => "Ibu Nuraini {$lName}",
                            'jenis_kelamin' => 'Perempuan',
                            'usia' => '52',
                            'pendidikan' => 'SMA',
                            'pekerjaan' => 'Ibu Rumah Tangga',
                            'perusahaan' => '-',
                        ]
                    ];

                    $organisasi = [
                        [
                            'nama_organisasi' => 'Himpunan Mahasiswa ' . $edu['jurusan'],
                            'kedudukan' => 'Ketua Divisi / Anggota Aktif',
                            'tahun' => (string) ($thnLulus - 2),
                            'tempat' => 'Kampus',
                        ]
                    ];

                    $bahasaAsing = [
                        ['bahasa' => 'Bahasa Inggris', 'lisan' => 'Baik', 'tertulis' => 'Baik']
                    ];

                    $pendidikanNonFormal = [
                        ['jenis_kursus' => 'Pelatihan Terapan Keahlian', 'penyelenggara' => 'LPK Padang Mandiri', 'tahun' => '2024', 'tempat' => 'Padang']
                    ];

                    $referensi = [
                        [
                            'nama' => 'Drs. Hendri, M.Kom.',
                            'alamat_telp' => 'Jl. Khatib Sulaiman Padang / 08116654321',
                            'pekerjaan_jabatan' => 'Dosen Pembimbing / Praktisi IT',
                            'hubungan' => 'Dosen Pembimbing Akademik'
                        ]
                    ];

                    FormulirLamaran::create([
                        'pelamar_id' => $pelamar->id,
                        'user_id' => $user->id,
                        'no_lamaran' => $noPendaftaran,
                        'nama_lengkap' => $fullName,
                        'tempat_lahir' => $loc['kota'],
                        'tanggal_lahir' => $birthDate,
                        'agama' => 'Islam',
                        'kewarganegaraan' => 'WNI',
                        'no_ktp_sim' => $nik,
                        'alamat_padang' => $address,
                        'telp_padang' => $phone,
                        'hp_padang' => $phone,
                        'alamat_luar_padang' => $loc['kota'] !== 'Kota Padang' ? $address : null,
                        'telp_luar_padang' => $loc['kota'] !== 'Kota Padang' ? $phone : null,
                        'pendidikan_formal' => $pendidikanFormal,
                        'alasan_pilih_jurusan' => 'Minat dan bakat yang kuat dalam bidang teknologi dan operasional.',
                        'karya_ilmiah' => 'Sistem Informasi Pengelolaan Data Terintegrasi',
                        'pendidikan_non_formal' => $pendidikanNonFormal,
                        'bahasa_asing' => $bahasaAsing,
                        'status_pernikahan' => ($cNum % 4 === 0) ? 'Menikah' : 'Belum Menikah',
                        'status_pernikahan_sejak' => ($cNum % 4 === 0) ? '2024-01-01' : null,
                        'keluarga_inti' => [],
                        'susunan_keluarga' => $susunanKeluarga,
                        'pengalaman_kerja' => $pengalamanKerja,
                        'gambaran_jabatan' => 'Menjalankan fungsi ' . $cfg['judul'] . ' secara profesional dan disiplin tinggi.',
                        'atasan_bawahan' => [
                            ['atasan' => 'Manager Terkait', 'bawahan' => '-']
                        ],
                        'masalah_kerja_dan_solusi' => 'Menghadapi batas waktu ketat dengan menyusun skala prioritas dan komunikasi tim yang efektif.',
                        'kesan_perusahaan_sebelumnya' => 'Lingkungan kerja yang positif dan memberikan pengalaman berharga.',
                        'penanganan_masalah_keputusan' => 'Menganalisis data, berdiskusi dengan tim, dan mengambil solusi terbaik yang terukur.',
                        'cita_cita' => 'Menjadi profesional andal yang berkontribusi nyata bagi kemajuan industri di Sumatera Barat.',
                        'pendorong_kerja' => 'Kemauan belajar yang tinggi, profesionalitas, dan tanggung jawab keluarga.',
                        'alasan_melamar_perusahaan' => 'Perusahaan memiliki reputasi yang sangat baik dan prospek karir yang jelas.',
                        'gaji_diharapkan' => ($posKey === 'supervisor') ? '7000000' : '4500000',
                        'fasilitas_diharapkan' => 'BPJS Kesehatan, BPJS Ketenagakerjaan, Tunjangan Hari Raya.',
                        'kapan_mulai_kerja' => 'Secepatnya (1-2 minggu setelah proses rekrutmen selesai)',
                        'prioritas_pekerjaan' => ['Gaji dan Kesejahteraan', 'Pengembangan Karir', 'Lingkungan Kerja'],
                        'bersedia_luar_daerah' => 'ya',
                        'tipe_orang_disenangi' => 'Orang yang jujur, suportif, komunikatif, dan memiliki semangat kerja sama tim.',
                        'hal_sulit_ambil_keputusan' => 'Saat informasi yang tersedia terbatas, namun tetap diselesaikan dengan mitigasi risiko.',
                        'ada_kenalan_perusahaan' => 'tidak',
                        'kenalan_perusahaan' => [],
                        'referensi' => $referensi,
                        'hobi' => 'Membaca, Olahraga, Mengikuti perkembangan teknologi',
                        'cara_mengisi_waktu_luang' => 'Belajar hal baru dan berolahraga',
                        'organisasi' => $organisasi,
                        'riwayat_psikotest' => [],
                        'kekuatan_diri' => 'Disiplin, cepat belajar, analitis, adaptif, dan mampu bekerja di bawah tekanan.',
                        'kelemahan_diri' => 'Kadang terlalu perfeksionis terhadap detail, diatasi dengan checklist pekerjaan terstruktur.',
                        'pernah_sakit_lama' => 'tidak',
                        'riwayat_penyakit' => [],
                        'gangguan_jasmani' => 'tidak',
                        'pernyataan_kebenaran' => true,
                        'tanggal_pernyataan' => date('Y-m-d'),
                        'is_submitted' => true,
                        'submitted_at' => $now,
                    ]);

                    // 5. Build Penilaian & Detail Penilaian for evaluated candidates
                    $evaluationStagesForPos = match ($posKey) {
                        'supervisor' => ['interview_hr', 'interview_user', 'interview_gm'],
                        default => ['skill_test', 'interview_hr', 'interview_user'],
                    };

                    $stagesToAssess = [];
                    if ($targetStage === 'accepted' || $targetStage === 'final_discussion') {
                        $stagesToAssess = $evaluationStagesForPos;
                    } elseif ($targetStage === 'interview_gm' && in_array('interview_gm', $evaluationStagesForPos)) {
                        $stagesToAssess = ['interview_hr', 'interview_user', 'interview_gm'];
                    } elseif ($targetStage === 'interview_user') {
                        $stagesToAssess = array_slice($evaluationStagesForPos, 0, 2);
                    } elseif ($targetStage === 'interview_hr') {
                        $stagesToAssess = array_slice($evaluationStagesForPos, 0, ($posKey === 'supervisor' ? 1 : 2));
                    } elseif ($targetStage === 'skill_test' && in_array('skill_test', $evaluationStagesForPos)) {
                        $stagesToAssess = ['skill_test'];
                    }

                    foreach ($stagesToAssess as $stg) {
                        $paramModels = $parametersByJabatan[$kdJabatan]->where('jenis_tahap', $stg);
                        if ($paramModels->isEmpty()) {
                            continue;
                        }

                        $isAccepted = ($targetStage === 'accepted');
                        $baseScore = $isAccepted ? rand(82, 95) : rand(70, 88);

                        $penilaian = PenilaianSkillTest::create([
                            'pelamar_id' => $pelamar->id,
                            'kd_jabatan' => $kdJabatan,
                            'jenis_tahap' => $stg,
                            'penguji_id' => $evaluatorId,
                            'nama_penguji' => $adminUser ? $adminUser->name : 'Tim Evaluator HR',
                            'tanggal_test' => date('Y-m-d'),
                            'total_skor' => round($baseScore / 20, 2), // Skala 1 - 5
                            'nilai_akhir' => $baseScore,              // Skala 0 - 100
                            'rekomendasi' => $isAccepted ? 'disarankan' : (($baseScore >= 75) ? 'dipertimbangkan' : 'tidak_disarankan'),
                            'catatan' => $isAccepted
                                ? "Kandidat menunjukkan performa sangat baik pada tahap {$stg}, kompeten dan sangat cocok untuk posisi {$cfg['judul']}."
                                : "Hasil evaluasi tahap {$stg} cukup memadai dengan beberapa catatan penguatan teknis/komunikasi.",
                            'status' => 'final',
                        ]);
                        $allInsertedPenilaians++;

                        // Insert detail parameters
                        foreach ($paramModels as $pGroup) {
                            foreach ($pGroup->details as $dParam) {
                                $detailScore = $isAccepted ? rand(4, 5) : rand(3, 4);
                                DetailPenilaianSkillTest::create([
                                    'penilaian_skill_test_id' => $penilaian->id,
                                    'parameter_skill_test_id' => $pGroup->id,
                                    'detail_parameter_skill_test_id' => $dParam->id,
                                    'skor' => $detailScore,
                                    'catatan' => $isAccepted ? 'Sangat menguasai aspek penilaian dengan pemahaman mendalam.' : 'Memahami konsep dasar dengan baik.',
                                ]);
                            }
                        }
                    }
                }
            }
        }

        $this->command->info("=== SEEDING PIPELINE SELESAI ===");
        $this->command->info("Total Pelamar berhasil dibuat: {$allInsertedPelamars}");
        $this->command->info("Total User Kandidat: {$allInsertedUsers}");
        $this->command->info("Total Penilaian (Skill Test / Interview): {$allInsertedPenilaians}");
    }
}
