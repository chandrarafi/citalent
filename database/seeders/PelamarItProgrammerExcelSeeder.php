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

class PelamarItProgrammerExcelSeeder extends Seeder
{
    public function run(): void
    {
        DB::disableQueryLog();

        $this->command->info("Memulai seeding Lowongan dan Pelamar IT Programmer (JBT-27) dari data Excel...");

        // 1. Role Kandidat
        $kandidatRole = Role::firstOrCreate(['name' => 'kandidat'], [
            'label' => 'Kandidat',
            'description' => 'Role untuk pelamar kerja / kandidat rekrutmen.',
        ]);
        $kandidatRoleId = $kandidatRole->id;

        // 2. Admin / Creator
        $adminUser = User::where('email', 'admin@citalent.com')->first() ?: User::first();
        $adminId = $adminUser ? $adminUser->id : 1;

        // 3. Setup Departement & Jabatan IT Programmer (JBT-27)
        $dept = Departement::find(20) ?: Departement::firstOrCreate(['id' => 20], [
            'nama_departement' => 'Main Dealer - IT Dept.',
            'deskripsi' => 'Main Dealer - IT Dept.',
        ]);

        $jabatan = Jabatan::where('kd_jabatan', 'JBT-27')->first() ?: Jabatan::create([
            'kd_jabatan' => 'JBT-27',
            'nama_jabatan' => 'IT Programmer',
            'departement_id' => $dept->id,
        ]);

        // 4. Permintaan Rekrutmen
        $permintaan = PermintaanRekrutmen::updateOrCreate(
            ['kode_permintaan' => 'REQ-2026-ITPROG-001'],
            [
                'kd_departement' => $dept->id,
                'posisi_id' => $jabatan->id,
                'jumlah' => 4,
                'prioritas' => 'high',
                'status_persetujuan' => 'disetujui',
                'tgl_permintaan' => '2026-07-25',
                'target_join' => '2026-09-01',
            ]
        );

        // 5. Lowongan IT Programmer
        $lowongan = Lowongan::updateOrCreate(
            ['kode_lowongan' => 'LOW-2026-002'],
            [
                'permintaan_rekrutmen_id' => $permintaan->id,
                'kd_departement' => $dept->id,
                'posisi_id' => $jabatan->id,
                'judul' => 'IT Programmer',
                'slug' => 'it-fullstack-programmer-padang',
                'jumlah_dibutuhkan' => 4,
                'lokasi_kerja' => 'Kantor Pusat Padang (Head Office)',
                'tipe_pekerjaan' => 'Full-time',
                'deskripsi' => '<p>Merancang, mengembangkan, menguji, dan memelihara aplikasi web core bisnis internal perusahaan (HRIS, Sales & Service CRM, Inventory ERP) menggunakan stack modern Laravel & React TypeScript.</p>',
                'kualifikasi' => '<ul><li>Pendidikan minimal D3/S1 Informatika, Sistem Informasi, atau bidang terkait</li><li>Menguasai PHP (Laravel), JavaScript/TypeScript (React), SQL (PostgreSQL/MySQL), dan Git</li><li>Memahami konsep RESTful API, arsitektur database relasional, dan clean code</li><li>Mampu bekerja sama dalam tim agile/scrum dan berorientasi pada pemecahan masalah</li></ul>',
                'tgl_buka' => '2026-08-03',
                'tgl_tutup' => '2026-08-09',
                'status' => 'aktif',
                'created_by' => $adminId,
            ]
        );

        $this->command->info("Lowongan '{$lowongan->judul}' (ID: {$lowongan->id}, {$lowongan->kode_lowongan}, JBT-27) aktif.");

        // Cleanup previous pelamars for this lowongan to avoid duplicate keys on re-seeding
        $existingPelamarIds = Pelamar::where('lowongan_id', $lowongan->id)->pluck('id');
        if ($existingPelamarIds->isNotEmpty()) {
            PenjadwalanInterview::whereIn('pelamar_id', $existingPelamarIds)->delete();
            FormulirLamaran::whereIn('pelamar_id', $existingPelamarIds)->delete();
            Pelamar::whereIn('id', $existingPelamarIds)->delete();
        }

        // 6. Load JSON Dataset from Excel
        $jsonPath = __DIR__ . '/it_programmer_excel_data.json';
        if (!File::exists($jsonPath)) {
            $this->command->error("File dataset JSON tidak ditemukan di {$jsonPath}");
            return;
        }

        $rawCandidates = json_decode(File::get($jsonPath), true);
        $totalRaw = count($rawCandidates);
        $this->command->info("Memproses {$totalRaw} kandidat dari file Excel IT Programmer...");

        // 7. Define Exact Pipeline Stage Plan:
        // - Lolos Final dan Diterima (4 orang): Orry Frasetyo, Anjeli Masrizal Putri, Rizieq Fazari, DZUL FAUZI
        // - Interview User: 6 orang (Tgl 19 Agustus)
        // - Interview HR: 8 orang (Tgl 13 Agustus)
        // - Skill Test: 15 orang (Tgl 10 Agustus)
        // - Lengkapi Formulir: 15 orang
        // - Screening CV: 20 orang
        // - Rejected: 15 orang
        // - Submitted: sisa kandidat (~48 orang)
        $planAcceptedCount = 4;
        $planInterviewUserCount = 6;
        $planInterviewHrCount = 8;
        $planSkillTestCount = 15;
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
            } elseif ($seq <= ($planAcceptedCount + $planInterviewUserCount)) {
                $targetStage = 'interview_user';
            } elseif ($seq <= ($planAcceptedCount + $planInterviewUserCount + $planInterviewHrCount)) {
                $targetStage = 'interview_hr';
            } elseif ($seq <= ($planAcceptedCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount)) {
                $targetStage = 'skill_test';
            } elseif ($seq <= ($planAcceptedCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount)) {
                $targetStage = 'lengkapi_formulir';
            } elseif ($seq <= ($planAcceptedCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount + $planRejectedCount)) {
                $targetStage = 'rejected';
            } elseif ($seq <= ($planAcceptedCount + $planInterviewUserCount + $planInterviewHrCount + $planSkillTestCount + $planFormulirCount + $planRejectedCount + $planScreeningCount)) {
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
                'posisi_dilamar' => 'IT Programmer',
                'sumber_informasi' => 'Formulir Online Recruitment IT Programmer 2026',
                'foto_path' => 'kandidat/foto/default-kandidat.jpg',
                'cv_path' => Str::limit($item['cv_url'] ?: ('kandidat/cv/cv-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                'surat_lamaran_path' => Str::limit($item['surat_url'] ?: ('kandidat/surat/surat-' . Str::slug($item['nama_lengkap']) . '.pdf'), 490, ''),
                'pernyataan_kebenaran' => true,
                'status' => $targetStage,
                'tahap_gagal' => $tahapGagal,
                'catatan' => $targetStage === 'accepted'
                    ? 'Kandidat TERPILIH & LOLOS TAHAP FINAL sebagai IT Programmer. Performa sangat memuaskan di Skill Test, Interview HR, dan Interview User.'
                    : ($targetStage === 'interview_user'
                        ? 'Lolos Interview HR tanggal 13 Agustus 2026. Dijadwalkan Interview User tanggal 19 Agustus 2026.'
                        : ($targetStage === 'interview_hr'
                            ? 'Lolos Skill Test tanggal 10 Agustus 2026. Dijadwalkan Interview HR tanggal 13 Agustus 2026.'
                            : ($targetStage === 'skill_test'
                                ? 'Lolos seleksi berkas. Dijadwalkan Skill Test pemrograman tanggal 10 Agustus 2026.'
                                : null))),
                'created_at' => sprintf('2026-08-%02d %02d:%02d:00', 3 + ($idx % 6), 8 + ($idx % 9), $idx % 59),
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
                            'nama_perusahaan' => 'Software House Nusantara',
                            'posisi' => 'Fullstack Web Developer',
                            'tahun_masuk' => (string) ((int) $thnLulusClean - 2),
                            'tahun_keluar' => (string) ((int) $thnLulusClean),
                            'gaji_terakhir' => '5000000',
                            'alasan_keluar' => 'Ingin bergabung di tim in-house dealer otomotif terkemuka',
                        ]
                    ] : [],
                    'gaji_diharapkan' => '5500000',
                    'kapan_mulai_kerja' => '2026-09-01',
                    'is_submitted' => true,
                    'submitted_at' => sprintf('2026-08-%02d 15:00:00', 5 + ($idx % 4)),
                    'created_at' => sprintf('2026-08-%02d 15:00:00', 5 + ($idx % 4)),
                ]);
            }

            // 8. Create Penjadwalan Interview for interview stages
            // --- 4 Orang Lolos Final & Diterima: HR (13 Agust, attended), User (19 Agust, attended) ---
            if ($targetStage === 'accepted') {
                $userScheduleHours = ['09:00', '10:00', '11:00', '13:30'];
                $jamUser = $userScheduleHours[$idx % 4];

                // Interview HR (13 Agustus 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-08-13',
                    'jam_mulai' => sprintf('%02d:30', 8 + $idx),
                    'jam_selesai' => sprintf('%02d:30', 9 + $idx),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Wawancara HR dan evaluasi kepribadian & culture fit.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-08-12 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview User (19 Agustus 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_user',
                    'tanggal_interview' => '2026-08-19',
                    'jam_mulai' => $jamUser,
                    'jam_selesai' => sprintf('%02d:00', (int) explode(':', $jamUser)[0] + 1),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang IT Development Lab)',
                    'pewawancara_nama' => 'Randi Pratama (IT Head & Lead Architect)',
                    'catatan_untuk_kandidat' => 'Technical interview & code review arsitektur aplikasi internal. HASIL: LOLOS & DITERIMA.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-08-18 09:00:00',
                    'created_by' => $adminId,
                ]);
            }

            // --- 6 Orang Interview User (HR: 13 Agust attended, User: 19 Agust scheduled) ---
            elseif ($targetStage === 'interview_user') {
                $userHours = ['09:00', '10:00', '11:00', '13:30', '14:30', '15:30'];
                $jamUser = $userHours[$idx % count($userHours)];
                $jamUserInt = (int) explode(':', $jamUser)[0];
                $jamUserMin = explode(':', $jamUser)[1];

                // Interview HR (13 Agustus 2026 - Attended)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_hr',
                    'tanggal_interview' => '2026-08-13',
                    'jam_mulai' => sprintf('%02d:30', 9 + ($idx % 4)),
                    'jam_selesai' => sprintf('%02d:30', 10 + ($idx % 4)),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Lolos tahap interview HR, direkomendasikan lanjut ke Technical Interview User.',
                    'status_kehadiran' => 'attended',
                    'reminder_sent_at' => '2026-08-12 09:00:00',
                    'created_by' => $adminId,
                ]);

                // Interview User (19 Agustus 2026 - Scheduled)
                PenjadwalanInterview::create([
                    'pelamar_id' => $pelamar->id,
                    'lowongan_id' => $lowongan->id,
                    'tahap' => 'interview_user',
                    'tanggal_interview' => '2026-08-19',
                    'jam_mulai' => $jamUser,
                    'jam_selesai' => sprintf('%02d:%s', $jamUserInt + 1, $jamUserMin),
                    'tipe_interview' => 'offline',
                    'lokasi' => 'PT. Menara Agung LT.2 (Ruang IT Development Lab)',
                    'pewawancara_nama' => 'Randi Pratama (IT Head & Lead Architect)',
                    'catatan_untuk_kandidat' => 'Persiapkan portofolio source code (GitHub/GitLab) dan siap simulasi live problem solving.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => '2026-08-18 09:00:00',
                    'created_by' => $adminId,
                ]);
            }

            // --- 8 Orang Interview HR (13 Agustus 2026 - Scheduled) ---
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
                    'tanggal_interview' => '2026-08-13',
                    'jam_mulai' => $jamMulai,
                    'jam_selesai' => $jamSelesai,
                    'tipe_interview' => ($idx % 3 === 0) ? 'online' : 'offline',
                    'lokasi' => ($idx % 3 === 0) ? null : 'PT. Menara Agung LT.2 (Ruang Interview HR)',
                    'link_meeting' => ($idx % 3 === 0) ? 'https://meet.google.com/itprog-hr-interview' : null,
                    'pewawancara_nama' => 'Maya Anggraini, S.Psi (HR Recruitment Lead)',
                    'catatan_untuk_kandidat' => 'Lolos Skill Test pemrograman tanggal 10 Agustus. Wawancara HR mengenai background dan pengalaman teknis.',
                    'status_kehadiran' => 'scheduled',
                    'reminder_sent_at' => ($idx % 2 === 0) ? '2026-08-12 09:00:00' : null,
                    'created_by' => $adminId,
                ]);
            }

            $insertedCount++;
        }

        $this->command->info("Selesai! Berhasil mengimpor {$insertedCount} pelamar IT Programmer (JBT-27) dari data Excel.");
        $this->command->info("Detail Pipeline IT Programmer:");
        $this->command->info("- 4 Pelamar Lolos Final & Diterima: Orry Frasetyo, Anjeli Masrizal Putri, Rizieq Fazari, DZUL FAUZI");
        $this->command->info("- 6 Pelamar Lolos ke Tahap Interview User (Tgl 19 Agustus)");
        $this->command->info("- 8 Pelamar Lolos ke Tahap Interview HR (Tgl 13 Agustus)");
        $this->command->info("- 15 Pelamar Lolos ke Tahap Skill Test (Tgl 10 Agustus)");
        $this->command->info("- 15 Pelamar di Tahap Lengkapi Formulir");
        $this->command->info("- 20 Pelamar di Tahap Screening CV");
        $this->command->info("- 15 Pelamar di Tahap Rejected (dengan riwayat tahap gagal)");
        $this->command->info("- Sisa pelamar di Tahap Submitted");
    }
}
