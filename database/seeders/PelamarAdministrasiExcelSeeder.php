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

class PelamarAdministrasiExcelSeeder extends Seeder
{
    public function run(): void
    {
        DB::disableQueryLog();

        $this->command->info("Memulai seeding Lowongan dan Pelamar Administrasi dari data Excel...");

        // 1. Role Kandidat
        $kandidatRole = Role::firstOrCreate(['name' => 'kandidat'], [
            'label' => 'Kandidat',
            'description' => 'Role untuk pelamar kerja / kandidat rekrutmen.',
        ]);
        $kandidatRoleId = $kandidatRole->id;

        // 2. Admin / Creator
        $adminUser = User::where('email', 'admin@citalent.com')->first() ?: User::first();
        $adminId = $adminUser ? $adminUser->id : 1;

        // 3. Setup Departement & Jabatan
        $dept = Departement::find(16) ?: Departement::firstOrCreate(['id' => 16], [
            'nama_departement' => 'Main Dealer - Marketing Dept.',
            'deskripsi' => 'Main Dealer - Marketing Dept.',
        ]);

        $jabatan = Jabatan::find(90) ?: Jabatan::firstOrCreate(['id' => 90], [
            'kd_jabatan' => 'JBT-38',
            'nama_jabatan' => 'CDB Administrator',
            'departement_id' => $dept->id,
        ]);

        // 4. Permintaan Rekrutmen
        $permintaan = PermintaanRekrutmen::updateOrCreate(
            ['kode_permintaan' => 'REQ-2026-ADM-001'],
            [
                'kd_departement' => $dept->id,
                'posisi_id' => $jabatan->id,
                'jumlah' => 5,
                'prioritas' => 'high',
                'status_persetujuan' => 'disetujui',
                'tgl_permintaan' => '2026-03-01',
                'target_join' => '2026-04-06',
            ]
        );

        // 5. Lowongan Administrasi
        $lowongan = Lowongan::updateOrCreate(
            ['kode_lowongan' => 'LOW-2026-003'],
            [
                'permintaan_rekrutmen_id' => $permintaan->id,
                'kd_departement' => $dept->id,
                'posisi_id' => $jabatan->id,
                'judul' => 'Administrasi',
                'slug' => 'administrasi-cdb-padang',
                'jumlah_dibutuhkan' => 5,
                'lokasi_kerja' => 'Kota Padang & Cabang Dealer Sumbar',
                'tipe_pekerjaan' => 'Full-time',
                'deskripsi' => '<p>Bertanggung jawab dalam pengelolaan kelengkapan dan validasi data administrasi pelanggan (Customer Database), arsip berkas faktur & registrasi kendaraan bermotor, verifikasi dokumen kredit, serta rekonsiliasi data operasional dealer harian.</p>',
                'kualifikasi' => '<ul><li>Pendidikan minimal D3/S1 Manajemen, Akuntansi, Administrasi Bisnis, atau jurusan relevan</li><li>Sangat teliti, cermat dengan angka dan data entry</li><li>Mahir mengoperasikan Microsoft Excel (VLOOKUP, HLOOKUP, Pivot Table, IF)</li><li>Mampu bekerja sama dalam tim dan memiliki komunikasi yang baik</li><li>Fresh graduate maupun berpengalaman dipersilakan melamar</li></ul>',
                'tgl_buka' => '2026-03-10',
                'tgl_tutup' => '2026-03-16',
                'status' => 'aktif',
                'created_by' => $adminId,
            ]
        );

        $this->command->info("Lowongan 'Administrasi' (ID: {$lowongan->id}, {$lowongan->kode_lowongan}) aktif.");

        // Cleanup previous pelamars for this lowongan to avoid duplicate keys on re-seeding
        $existingPelamarIds = Pelamar::where('lowongan_id', $lowongan->id)->pluck('id');
        if ($existingPelamarIds->isNotEmpty()) {
            PenjadwalanInterview::whereIn('pelamar_id', $existingPelamarIds)->delete();
            FormulirLamaran::whereIn('pelamar_id', $existingPelamarIds)->delete();
            Pelamar::whereIn('id', $existingPelamarIds)->delete();
        }

        // 6. Load JSON Dataset from Excel
        $jsonPath = __DIR__ . '/administrasi_excel_data.json';
        if (!File::exists($jsonPath)) {
            $this->command->error("File dataset JSON tidak ditemukan di {$jsonPath}");
            return;
        }

        $rawCandidates = json_decode(File::get($jsonPath), true);
        $totalRaw = count($rawCandidates);
        $this->command->info("Memproses {$totalRaw} kandidat dari file Excel...");

        // 7. Define Exact Pipeline Stage Plan as Requested:
        // - Final: 2 orang (final_discussion)
        // - Lolos ke interview user: 5 orang (interview_user)
        // - Lolos ke interview HR: 15 orang (interview_hr)
        // - Skill test: 25 orang
        // - Lengkapi formulir: 35 orang
        // - Screening CV: 60 orang
        // - Submitted: sisa kandidat
        // - Rejected: 50 orang
        $planFinalCount = 2;
        $planInterviewUserCount = 5;
        $planInterviewHrCount = 15;
        $planSkillTestCount = 25;
        $planFormulirCount = 35;
        $planRejectedCount = 50;
        $planScreeningCount = 60;

        $defaultPassword = Hash::make('password123');
        $now = Carbon::now();

        $candidateSeq = (Pelamar::max('id') ?? 0) + 1;
        $insertedCount = 0;

        foreach ($rawCandidates as $idx => $item) {
            $seq = $idx + 1;

            // Determine Target Stage
            if ($seq <= $planFinalCount) {
                $targetStage = 'final_discussion';
            } elseif ($seq <= ($planFinalCount + $planInterviewUserCount)) {
                $targetStage = 'interview_user';
            } elseif ($seq <= ($planFinalCount + $planInterviewUserCount + $planInterviewHrCount)) {
                $targetStage = 'interview_hr';
            } elseif ($seq <= ($planFinalCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount)) {
                $targetStage = 'skill_test';
            } elseif ($seq <= ($planFinalCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount)) {
                $targetStage = 'lengkapi_formulir';
            } elseif ($seq <= ($planFinalCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount + $planRejectedCount)) {
                $targetStage = 'rejected';
            } elseif ($seq <= ($planFinalCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount + $planRejectedCount + $planScreeningCount)) {
                $targetStage = 'screening_cv';
            } else {
                $targetStage = 'submitted';
            }

            $cNum = $candidateSeq++;
            $noPendaftaran = sprintf('REG-%s-%04d', date('Ymd'), $cNum);

            $email = $item['email'];
            // Ensure unique email in users table
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

            // Sanitize field lengths to prevent database overflow
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
                'posisi_dilamar' => 'Administrasi',
                'sumber_informasi' => 'Formulir Online Recruitment Mei 2026',
                'foto_path' => 'kandidat/foto/default-kandidat.jpg',
                'cv_path' => Str::limit($item['cv_url'] ?: ('kandidat/cv/cv-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                'surat_lamaran_path' => Str::limit($item['surat_url'] ?: ('kandidat/surat/surat-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                'pernyataan_kebenaran' => true,
                'status' => $targetStage,
                'tahap_gagal' => $tahapGagal,
                'catatan' => $targetStage === 'final_discussion'
                    ? 'Kandidat unggulan dari seleksi Administrasi Maret 2026. Nilai tes dan interview sangat memuaskan.'
                    : ($targetStage === 'interview_user'
                        ? 'Lolos Interview HR dengan performa prima, direkomendasikan lanjut ke Interview User.'
                        : ($targetStage === 'interview_hr'
                            ? 'Berkas lengkap dan lolos review administrasi, dijadwalkan untuk Interview HR.'
                            : null)),
                'created_at' => sprintf('2026-03-%02d %02d:%02d:00', 10 + ($idx % 6), 8 + ($idx % 9), $idx % 59),
                'updated_at' => Carbon::now(),
            ]);

            // Create Formulir Lamaran for stages lengkapi_formulir and above
            if (in_array($targetStage, ['lengkapi_formulir', 'skill_test', 'interview_hr', 'interview_user', 'final_discussion'])) {
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
                            'nama_perusahaan' => 'PT. Mitra Niaga Jaya Padang',
                            'posisi' => 'Staff Administrasi & Data Entry',
                            'tahun_masuk' => (string) ((int) $thnLulusClean - 1),
                            'tahun_keluar' => (string) ((int) $thnLulusClean),
                            'gaji_terakhir' => '3200000',
                            'alasan_keluar' => 'Mencari pengembangan karir yang lebih luas',
                        ]
                    ] : [],
                    'gaji_diharapkan' => '3500000',
                    'kapan_mulai_kerja' => '2026-04-06',
                    'is_submitted' => true,
                    'submitted_at' => sprintf('2026-03-%02d 14:00:00', 12 + ($idx % 4)),
                    'created_at' => sprintf('2026-03-%02d 14:00:00', 12 + ($idx % 4)),
                ]);
            }

            // 8. Create Penjadwalan Interview for interview stages
            // --- Final (2 orang): HR (17 Mar, attended), User (19 Mar, attended), GM (23 Mar, scheduled) ---
            if ($targetStage === 'final_discussion') {
                // Interview HR (17 Maret 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-03-17',
                    'jam_mulai' => sprintf('%02d:30', 8 + ($idx % 3)),
                    'jam_selesai' => sprintf('%02d:30', 9 + ($idx % 3)),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Harap membawa berkas dokumen asli (KTP, Ijazah, Transkrip Nilai).',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-03-16 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview User (19 Maret 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_user',
                    'tanggal_interview' => '2026-03-19',
                    'jam_mulai' => sprintf('%02d:00', 10 + ($idx % 3)),
                    'jam_selesai' => sprintf('%02d:00', 11 + ($idx % 3)),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Rapat Operasional Marketing)',
                    'pewawancara_nama' => 'Hendra Setiawan (Head of Marketing & Administration Dept)',
                    'catatan_untuk_kandidat' => 'Wawancara kompetensi teknis database dan simulasi administrasi dealer.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-03-18 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview GM / Final (23 Maret 2026 - Scheduled)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_gm',
                    'tanggal_interview' => '2026-03-23',
                    'jam_mulai' => sprintf('%02d:00', 9 + $idx),
                    'jam_selesai' => sprintf('%02d:00', 10 + $idx),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Executive Meeting Room)',
                    'pewawancara_nama' => 'Drs. H. M. Firdaus (General Manager)',
                    'catatan_untuk_kandidat' => 'Final interview & discussion offering bersama General Manager. Estimasi mulai bekerja: 6 April 2026.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => '2026-03-22 09:00:00',
                    'created_by' => $adminId,
                ]);
            }

            // --- Lolos ke Interview User (5 orang): HR (17 Mar, attended), User (19 Mar, scheduled) ---
            elseif ($targetStage === 'interview_user') {
                // Interview HR (17 Maret 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-03-17',
                    'jam_mulai' => sprintf('%02d:30', 9 + ($idx % 4)),
                    'jam_selesai' => sprintf('%02d:30', 10 + ($idx % 4)),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Lolos tahap interview HR dengan predikat memuaskan.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-03-16 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview User (19 Maret 2026 - Scheduled)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_user',
                    'tanggal_interview' => '2026-03-19',
                    'jam_mulai' => sprintf('%02d:00', 9 + ($idx % 4)),
                    'jam_selesai' => sprintf('%02d:00', 10 + ($idx % 4)),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Rapat Operasional Marketing)',
                    'pewawancara_nama' => 'Hendra Setiawan (Head of Marketing & Administration Dept)',
                    'catatan_untuk_kandidat' => 'Mohon hadir 15 menit sebelum wawancara dimulai dengan pakaian formal rapi.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => '2026-03-18 09:00:00',
                    'created_by' => $adminId,
                ]);
            }

            // --- Lolos ke Interview HR (15 orang): HR (17 Maret 2026, scheduled) ---
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
                    'tanggal_interview' => '2026-03-17',
                    'jam_mulai' => $jamMulai,
                    'jam_selesai' => $jamSelesai,
                    'tipe_interview' => ($idx % 4 === 0) ? 'online' : 'offline',
                    'lokasi' => ($idx % 4 === 0) ? null : 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'link_meeting' => ($idx % 4 === 0) ? 'https://meet.google.com/adm-hr-interviews' : null,
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Persiapkan diri dengan baik, bawa berkas portofolio atau bukti keahlian administrasi.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => ($idx % 2 === 0) ? '2026-03-16 09:00:00' : null,
                    'created_by' => $adminId,
                ]);
            }

            $insertedCount++;
        }

        $this->command->info("Selesai! Berhasil mengimpor {$insertedCount} pelamar Administrasi dari data Excel.");
        $this->command->info("Detail Pipeline Administrasi:");
        $this->command->info("- 2 Pelamar Final (Interview GM / Final Discussion)");
        $this->command->info("- 5 Pelamar Lolos ke Tahap Interview User");
        $this->command->info("- 15 Pelamar Lolos ke Tahap Interview HR");
        $this->command->info("- 25 Pelamar di Tahap Skill Test");
        $this->command->info("- 35 Pelamar di Tahap Lengkapi Formulir");
        $this->command->info("- 50 Pelamar di Tahap Rejected (dengan riwayat tahap gagal)");
        $this->command->info("- Sisa pelamar di Tahap Screening CV dan Submitted");
    }
}
