<?php

namespace Database\Seeders;

use App\Models\Departement;
use App\Models\FormulirLamaran;
use App\Models\Jabatan;
use App\Models\KandidatProfile;
use App\Models\Lowongan;
use App\Models\Pelamar;
use App\Models\PenjadwalanInterview;
use App\Models\PermintaanRekrutmen;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PelamarNetdevExcelSeeder extends Seeder
{
    public function run(): void
    {
        DB::disableQueryLog();

        $this->command->info("Memulai seeding Lowongan dan Pelamar Network Development (JBT-37) dari data Excel...");

        // 1. Role Kandidat
        $kandidatRole = Role::firstOrCreate(['name' => 'kandidat'], [
            'label' => 'Kandidat',
            'description' => 'Role untuk pelamar kerja / kandidat rekrutmen.',
        ]);
        $kandidatRoleId = $kandidatRole->id;

        // 2. Admin / Creator
        $adminUser = User::where('email', 'admin@citalent.com')->first() ?: User::first();
        $adminId = $adminUser ? $adminUser->id : 1;

        // 3. Setup Departement & Jabatan JBT-37
        $dept = Departement::find(16) ?: Departement::firstOrCreate(['id' => 16], [
            'nama_departement' => 'Main Dealer - Marketing Dept.',
            'deskripsi' => 'Main Dealer - Marketing Dept.',
        ]);

        $jabatan = Jabatan::where('kd_jabatan', 'JBT-37')->first() ?: Jabatan::create([
            'kd_jabatan' => 'JBT-37',
            'nama_jabatan' => 'Network Development Spv.',
            'departement_id' => $dept->id,
        ]);

        // 4. Permintaan Rekrutmen
        $permintaan = PermintaanRekrutmen::updateOrCreate(
            ['kode_permintaan' => 'REQ-2026-NETDEV-001'],
            [
                'kd_departement' => $dept->id,
                'posisi_id' => $jabatan->id,
                'jumlah' => 2,
                'prioritas' => 'high',
                'status_persetujuan' => 'disetujui',
                'tgl_permintaan' => '2026-03-25',
                'target_join' => '2026-05-04',
            ]
        );

        // 5. Lowongan Network Development Spv. (JBT-37)
        $lowongan = Lowongan::updateOrCreate(
            ['kode_lowongan' => 'LOW-2026-004'],
            [
                'permintaan_rekrutmen_id' => $permintaan->id,
                'kd_departement' => $dept->id,
                'posisi_id' => $jabatan->id,
                'judul' => 'Network Development Supervisor',
                'slug' => 'network-development-supervisor-sumbar',
                'jumlah_dibutuhkan' => 2,
                'lokasi_kerja' => 'Sumatera Barat (Padang & Cabang Dealer)',
                'tipe_pekerjaan' => 'Full-time',
                'deskripsi' => '<p>Memimpin dan mengkoordinasikan strategi perluasan jaringan dealer, pembinaan tim operasional pos dealer wilayah, monitoring pencapaian target penjualan dan standar pelayanan di seluruh cabang Sumatera Barat.</p>',
                'kualifikasi' => '<ul><li>Pendidikan minimal S1 semua jurusan (diutamakan Manajemen / Bisnis / Teknik Informatika / Sistem Informasi)</li><li>Pengalaman minimal 2-3 tahun sebagai Supervisor atau Koordinator Jaringan di industri otomotif / FMCG / Retail</li><li>Memiliki jiwa kepemimpinan (leadership), kemampuan negosiasi, dan analitis yang kuat</li><li>Siap mobile dan bersedia melakukan supervisi rutin ke seluruh cabang Sumbar</li></ul>',
                'tgl_buka' => '2026-04-03',
                'tgl_tutup' => '2026-04-10',
                'status' => 'aktif',
                'created_by' => $adminId,
            ]
        );

        $this->command->info("Lowongan '{$lowongan->judul}' (ID: {$lowongan->id}, {$lowongan->kode_lowongan}, JBT-37) aktif.");

        // Cleanup previous pelamars for this lowongan to avoid duplicate keys on re-seeding
        $existingPelamarIds = Pelamar::where('lowongan_id', $lowongan->id)->pluck('id');
        if ($existingPelamarIds->isNotEmpty()) {
            PenjadwalanInterview::whereIn('pelamar_id', $existingPelamarIds)->delete();
            FormulirLamaran::whereIn('pelamar_id', $existingPelamarIds)->delete();
            Pelamar::whereIn('id', $existingPelamarIds)->delete();
        }

        // 6. Load JSON Dataset from Excel
        $jsonPath = __DIR__ . '/netdev_excel_data.json';
        if (!File::exists($jsonPath)) {
            $this->command->error("File dataset JSON tidak ditemukan di {$jsonPath}");
            return;
        }

        $rawCandidates = json_decode(File::get($jsonPath), true);
        $totalRaw = count($rawCandidates);
        $this->command->info("Memproses {$totalRaw} kandidat dari file Excel NETDEV...");

        // 7. Define Exact Pipeline Stage Plan:
        // - Final dan Lolos: 1 orang (accepted)
        // - Interview GM: 1 orang (final_discussion / interview_gm) -> Total GM = 2 orang
        // - Lolos Interview User: 6 orang (interview_user)
        // - Lolos Interview HRD: 12 orang (interview_hr)
        // - Skill test: 10 orang
        // - Lengkapi formulir: 15 orang
        // - Screening CV: 20 orang
        // - Rejected: 15 orang
        // - Submitted: sisa kandidat (~56 orang)
        $planAcceptedCount = 1;
        $planGmCount = 1;
        $planInterviewUserCount = 6;
        $planInterviewHrCount = 12;
        $planSkillTestCount = 10;
        $planFormulirCount = 15;
        $planRejectedCount = 15;
        $planScreeningCount = 20;

        $defaultPassword = Hash::make('password123');
        $now = Carbon::now();

        $candidateSeq = (Pelamar::max('id') ?? 0) + 1;
        $insertedCount = 0;

        foreach ($rawCandidates as $idx => $item) {
            $seq = $idx + 1;

            // Determine Target Stage
            if ($seq <= $planAcceptedCount) {
                $targetStage = 'accepted';
            } elseif ($seq <= ($planAcceptedCount + $planGmCount)) {
                $targetStage = 'final_discussion';
            } elseif ($seq <= ($planAcceptedCount + $planGmCount + $planInterviewUserCount)) {
                $targetStage = 'interview_user';
            } elseif ($seq <= ($planAcceptedCount + $planGmCount + $planInterviewUserCount + $planInterviewHrCount)) {
                $targetStage = 'interview_hr';
            } elseif ($seq <= ($planAcceptedCount + $planGmCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount)) {
                $targetStage = 'skill_test';
            } elseif ($seq <= ($planAcceptedCount + $planGmCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount)) {
                $targetStage = 'lengkapi_formulir';
            } elseif ($seq <= ($planAcceptedCount + $planGmCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount + $planRejectedCount)) {
                $targetStage = 'rejected';
            } elseif ($seq <= ($planAcceptedCount + $planGmCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount + $planRejectedCount + $planScreeningCount)) {
                $targetStage = 'screening_cv';
            } else {
                $targetStage = 'submitted';
            }

            $cNum = $candidateSeq++;
            $noPendaftaran = sprintf('REG-%s-%04d', date('Ymd'), $cNum);

            $email = $item['email'];
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                $user = $existingUser;
            } else {
                $user = User::create([
                    'name' => $item['nama_lengkap'],
                    'email' => $email,
                    'password' => $defaultPassword,
                    'role_id' => $kandidatRoleId,
                    'phone' => $item['nomor_kontak'],
                    'is_active' => true,
                    'status' => 'active',
                    'email_verified_at' => $now,
                ]);
            }

            // Sanitize field lengths
            $thnLulusClean = preg_match('/\b(19\d{2}|20\d{2})\b/', $item['tahun_lulus'], $mYear) ? $mYear[1] : substr($item['tahun_lulus'], 0, 10);
            $namaInstitusiClean = Str::limit($item['nama_institusi'], 250, '');
            $jurusanClean = Str::limit($item['jurusan'], 250, '');
            $tempatLahirClean = Str::limit($item['tempat_lahir'], 140, '');
            $pendidikanClean = Str::limit($item['pendidikan_terakhir'], 45, '');
            $nikahClean = Str::limit($item['status_pernikahan'], 45, '');
            $agamaClean = Str::limit($item['agama'], 45, '');
            $phoneClean = Str::limit($item['nomor_kontak'], 45, '');

            // Create Profile
            KandidatProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'tempat_lahir' => $tempatLahirClean,
                    'tanggal_lahir' => $item['tanggal_lahir'],
                    'jenis_kelamin' => $item['jenis_kelamin'],
                    'status_pernikahan' => $nikahClean,
                    'agama' => $agamaClean,
                    'alamat' => $item['alamat'],
                    'domisili' => "Kota Padang, Sumatera Barat",
                    'pendidikan_terakhir' => $pendidikanClean,
                    'nama_institusi' => $namaInstitusiClean,
                    'jurusan' => $jurusanClean,
                    'tahun_lulus' => $thnLulusClean,
                    'foto_path' => 'kandidat/foto/default-kandidat.jpg',
                    'cv_path' => Str::limit($item['cv_url'] ?: ('kandidat/cv/cv-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                    'surat_lamaran_path' => Str::limit($item['surat_url'] ?: ('kandidat/surat/surat-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                    'is_complete' => true,
                ]
            );

            $tahapGagal = null;
            if ($targetStage === 'rejected') {
                $fails = ['screening_cv', 'skill_test', 'interview_hr'];
                $tahapGagal = $fails[$idx % count($fails)];
            }

            // Create Pelamar
            $pelamar = Pelamar::create([
                'lowongan_id' => $lowongan->id,
                'no_pendaftaran' => $noPendaftaran,
                'nama_lengkap' => $item['nama_lengkap'],
                'tempat_lahir' => $tempatLahirClean,
                'tanggal_lahir' => $item['tanggal_lahir'],
                'jenis_kelamin' => $item['jenis_kelamin'],
                'status_pernikahan' => $nikahClean,
                'agama' => $agamaClean,
                'alamat' => $item['alamat'],
                'domisili' => 'Kota Padang, Sumatera Barat',
                'nomor_kontak' => $phoneClean,
                'email' => $email,
                'pendidikan_terakhir' => $pendidikanClean,
                'nama_institusi' => $namaInstitusiClean,
                'jurusan' => $jurusanClean,
                'tahun_lulus' => $thnLulusClean,
                'posisi_dilamar' => 'Network Development Supervisor',
                'sumber_informasi' => 'Formulir Online Recruitment NETDEV Juni 2026',
                'foto_path' => 'kandidat/foto/default-kandidat.jpg',
                'cv_path' => Str::limit($item['cv_url'] ?: ('kandidat/cv/cv-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                'surat_lamaran_path' => Str::limit($item['surat_url'] ?: ('kandidat/surat/surat-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                'pernyataan_kebenaran' => true,
                'status' => $targetStage,
                'tahap_gagal' => $tahapGagal,
                'catatan' => $targetStage === 'accepted'
                    ? 'Kandidat TERPILIH & LOLOS TAHAP FINAL sebagai Network Development Supervisor. Siap Onboarding.'
                    : ($targetStage === 'final_discussion'
                        ? 'Lolos Interview GM tanggal 26 April 2026. Menunggu konfirmasi offering.'
                        : ($targetStage === 'interview_user'
                            ? 'Lolos Interview HRD tanggal 11 April 2026, dijadwalkan Interview User tanggal 20 April 2026.'
                            : ($targetStage === 'interview_hr'
                                ? 'Berkas lengkap dan lolos review, dijadwalkan Interview HRD tanggal 11 April 2026.'
                                : null))),
                'created_at' => sprintf('2026-04-%02d %02d:%02d:00', 3 + ($idx % 7), 8 + ($idx % 9), $idx % 59),
                'updated_at' => Carbon::now(),
            ]);

            // Create Formulir Lamaran for stages lengkapi_formulir and above
            if (in_array($targetStage, ['lengkapi_formulir', 'skill_test', 'interview_hr', 'interview_user', 'final_discussion', 'accepted'])) {
                $hasExp = ($idx % 2 === 0);
                FormulirLamaran::create([
                    'pelamar_id' => $pelamar->id,
                    'user_id' => $user->id,
                    'no_lamaran' => $noPendaftaran,
                    'nama_lengkap' => $item['nama_lengkap'],
                    'tempat_lahir' => $item['tempat_lahir'],
                    'tanggal_lahir' => $item['tanggal_lahir'],
                    'agama' => $item['agama'],
                    'kewarganegaraan' => 'WNI',
                    'no_ktp_sim' => '1371' . sprintf('%012d', 100000000000 + $idx),
                    'alamat_padang' => $item['alamat'],
                    'hp_padang' => $phoneClean,
                    'status_pernikahan' => $nikahClean,
                    'pendidikan_formal' => [
                        [
                            'tingkat' => $pendidikanClean,
                            'nama_sekolah' => $namaInstitusiClean,
                            'tempat' => 'Padang',
                            'jurusan' => $jurusanClean,
                            'tahun_masuk' => (string) ((int) $thnLulusClean - 4),
                            'tahun_lulus' => (string) $thnLulusClean,
                            'keterangan' => 'Lulus',
                        ]
                    ],
                    'pengalaman_kerja' => $hasExp ? [
                        [
                            'nama_perusahaan' => 'PT. Andalas Niaga Distribusi',
                            'posisi' => 'Field Operations & Network Coordinator',
                            'tahun_masuk' => (string) ((int) $thnLulusClean - 2),
                            'tahun_keluar' => (string) ((int) $thnLulusClean),
                            'gaji_terakhir' => '4500000',
                            'alasan_keluar' => 'Pengembangan jenjang karir supervisori',
                        ]
                    ] : [],
                    'gaji_diharapkan' => '5000000',
                    'kapan_mulai_kerja' => '2026-05-04',
                    'is_submitted' => true,
                    'submitted_at' => sprintf('2026-04-%02d 15:00:00', 5 + ($idx % 5)),
                    'created_at' => sprintf('2026-04-%02d 15:00:00', 5 + ($idx % 5)),
                ]);
            }

            // 8. Create Penjadwalan Interview for interview stages
            // --- 1 Orang Final & Lolos (Accepted): HR (11 Apr, attended), User (20 Apr, attended), GM (26 Apr, attended) ---
            if ($targetStage === 'accepted') {
                // Interview HRD (11 April 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-04-11',
                    'jam_mulai' => '08:30',
                    'jam_selesai' => '09:30',
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Wawancara HRD pembuka untuk posisi Network Development Spv.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-04-10 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview User (20 April 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_user',
                    'tanggal_interview' => '2026-04-20',
                    'jam_mulai' => '10:00',
                    'jam_selesai' => '11:00',
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Rapat Marketing & Network)',
                    'pewawancara_nama' => 'Hendra Setiawan (Head of Marketing & Network Dept)',
                    'catatan_untuk_kandidat' => 'Wawancara kompetensi teknis pengembangan jaringan dan strategi dealer.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-04-19 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview GM (26 April 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_gm',
                    'tanggal_interview' => '2026-04-26',
                    'jam_mulai' => '09:00',
                    'jam_selesai' => '10:00',
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Executive Boardroom)',
                    'pewawancara_nama' => 'Drs. H. M. Firdaus (General Manager)',
                    'catatan_untuk_kandidat' => 'Final interview & discussion offering bersama General Manager. DITERIMA & LOLOS.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-04-25 09:00:00',
                    'created_by' => $adminId,
                ]);
            }

            // --- 1 Orang Interview GM / Final Discussion (Scheduled) ---
            elseif ($targetStage === 'final_discussion') {
                // Interview HRD (11 April 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-04-11',
                    'jam_mulai' => '09:30',
                    'jam_selesai' => '10:30',
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Wawancara HRD pembuka untuk posisi Network Development Spv.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-04-10 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview User (20 April 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_user',
                    'tanggal_interview' => '2026-04-20',
                    'jam_mulai' => '11:00',
                    'jam_selesai' => '12:00',
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Rapat Marketing & Network)',
                    'pewawancara_nama' => 'Hendra Setiawan (Head of Marketing & Network Dept)',
                    'catatan_untuk_kandidat' => 'Wawancara kompetensi teknis pengembangan jaringan dan strategi dealer.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-04-19 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview GM (26 April 2026 - Scheduled)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_gm',
                    'tanggal_interview' => '2026-04-26',
                    'jam_mulai' => '10:00',
                    'jam_selesai' => '11:00',
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Executive Boardroom)',
                    'pewawancara_nama' => 'Drs. H. M. Firdaus (General Manager)',
                    'catatan_untuk_kandidat' => 'Final interview & discussion offering bersama General Manager.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => '2026-04-25 09:00:00',
                    'created_by' => $adminId,
                ]);
            }

            // --- 6 Orang Lolos ke Interview User (HR: 11 Apr attended, User: 20 Apr scheduled) ---
            elseif ($targetStage === 'interview_user') {
                $userHours = ['09:00', '10:00', '11:00', '13:30', '14:30', '15:30'];
                $jamUser = $userHours[$idx % count($userHours)];
                $jamUserInt = (int) explode(':', $jamUser)[0];
                $jamUserMin = explode(':', $jamUser)[1];

                // Interview HRD (11 April 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-04-11',
                    'jam_mulai' => sprintf('%02d:30', 8 + ($idx % 5)),
                    'jam_selesai' => sprintf('%02d:30', 9 + ($idx % 5)),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Lolos tahap interview HRD dengan penilaian memuaskan.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-04-10 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview User (20 April 2026 - Scheduled)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_user',
                    'tanggal_interview' => '2026-04-20',
                    'jam_mulai' => $jamUser,
                    'jam_selesai' => sprintf('%02d:%s', $jamUserInt + 1, $jamUserMin),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Rapat Marketing & Network)',
                    'pewawancara_nama' => 'Hendra Setiawan (Head of Marketing & Network Dept)',
                    'catatan_untuk_kandidat' => 'Mohon hadir tepat waktu 15 menit sebelum interview dimulai dengan pakaian formal rapi.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => '2026-04-19 09:00:00',
                    'created_by' => $adminId,
                ]);
            }

            // --- 12 Orang Lolos ke Interview HRD (11 April 2026 - Scheduled) ---
            elseif ($targetStage === 'interview_hr') {
                $hrHours = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
                $jamMulai = $hrHours[$idx % count($hrHours)];
                $jamMulaiInt = (int) explode(':', $jamMulai)[0];
                $jamMulaiMin = explode(':', $jamMulai)[1];
                $jamSelesai = sprintf('%02d:%s', $jamMulaiInt + 1, $jamMulaiMin);

                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-04-11',
                    'jam_mulai' => $jamMulai,
                    'jam_selesai' => $jamSelesai,
                    'tipe_interview' => ($idx % 3 === 0) ? 'online' : 'offline',
                    'lokasi' => ($idx % 3 === 0) ? null : 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'link_meeting' => ($idx % 3 === 0) ? 'https://meet.google.com/netdev-hr-interview' : null,
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Wawancara HRD untuk posisi Network Development Supervisor. Bawa dokumen asli.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => ($idx % 2 === 0) ? '2026-04-10 09:00:00' : null,
                    'created_by' => $adminId,
                ]);
            }

            $insertedCount++;
        }

        $this->command->info("Selesai! Berhasil mengimpor {$insertedCount} pelamar Network Development (JBT-37) dari data Excel.");
        $this->command->info("Detail Pipeline Network Development:");
        $this->command->info("- 1 Pelamar Final & Lolos (Status: Accepted / Offering)");
        $this->command->info("- 1 Pelamar di Tahap Interview GM (Final Discussion) -> Total GM: 2 orang (Tgl 26 April)");
        $this->command->info("- 6 Pelamar Lolos ke Tahap Interview User (Tgl 20 April)");
        $this->command->info("- 12 Pelamar Lolos ke Tahap Interview HRD (Tgl 11 April)");
        $this->command->info("- 10 Pelamar di Tahap Skill Test");
        $this->command->info("- 15 Pelamar di Tahap Lengkapi Formulir");
        $this->command->info("- 15 Pelamar di Tahap Rejected (dengan riwayat tahap gagal)");
        $this->command->info("- Sisa pelamar di Tahap Screening CV dan Submitted");
    }
}
