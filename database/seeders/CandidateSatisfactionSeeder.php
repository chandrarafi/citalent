<?php

namespace Database\Seeders;

use App\Models\CandidateSatisfactionSurvey;
use App\Models\Menu;
use App\Models\Permission;
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CandidateSatisfactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ── 1. ROLES SETUP (super-admin, hr, hr-manager) ─────────────────────────
        $superAdmin = Role::firstOrCreate(
            ['name' => 'super-admin'],
            ['label' => 'Super Admin', 'description' => 'Full administrative access']
        );

        $hrManager = Role::firstOrCreate(
            ['name' => 'hr-manager'],
            ['label' => 'HR Manager', 'description' => 'Access to HR operations and recruitment']
        );

        $hr = Role::firstOrCreate(
            ['name' => 'hr'],
            ['label' => 'HR Staff', 'description' => 'Staff Human Resources']
        );

        $kandidat = Role::firstOrCreate(
            ['name' => 'kandidat'],
            ['label' => 'Kandidat', 'description' => 'Role untuk pelamar kerja / kandidat']
        );

        // ── 2. PERMISSIONS SETUP ─────────────────────────────────────────────
        $permSatisfaction = Permission::firstOrCreate(
            ['name' => 'manage-candidate-satisfaction'],
            [
                'label' => 'Kelola & Lihat Candidate Satisfaction',
                'group' => 'rekrutmen',
            ]
        );

        $permFillSurvey = Permission::firstOrCreate(
            ['name' => 'fill-candidate-survey'],
            [
                'label' => 'Mengisi Survey Kepuasan Kandidat',
                'group' => 'kandidat',
            ]
        );

        // Berikan permission kepada super-admin, hr, dan hr-manager
        $rolesWithManagement = [$superAdmin, $hrManager, $hr];
        foreach ($rolesWithManagement as $role) {
            if (!$role->permissions()->where('permissions.id', $permSatisfaction->id)->exists()) {
                $role->permissions()->attach($permSatisfaction->id);
            }
            if (!$role->permissions()->where('permissions.id', $permFillSurvey->id)->exists()) {
                $role->permissions()->attach($permFillSurvey->id);
            }
        }

        // Berikan permission isi survey ke kandidat
        if (!$kandidat->permissions()->where('permissions.id', $permFillSurvey->id)->exists()) {
            $kandidat->permissions()->attach($permFillSurvey->id);
        }

        // ── 3. MENU SETUP ───────────────────────────────────────────────────
        Menu::updateOrCreate(
            ['name' => 'candidate-satisfaction'],
            [
                'label' => 'Candidate Satisfaction',
                'kelompok' => 'Rekrutmen & Seleksi',
                'url' => '/candidate-satisfaction',
                'icon' => 'star',
                'tone' => 'purple',
                'order' => 8,
                'permission_name' => 'manage-candidate-satisfaction',
            ]
        );

        $kandidatSurveyMenu = Menu::updateOrCreate(
            ['name' => 'kandidat-survey'],
            [
                'label' => 'Survey Kepuasan',
                'kelompok' => 'Portal Kandidat',
                'url' => '/kandidat/survey',
                'icon' => 'star',
                'tone' => 'yellow',
                'order' => 4,
                'permission_name' => 'fill-candidate-survey',
            ]
        );
        $kandidatSurveyMenu->roles()->syncWithoutDetaching([$kandidat->id]);

        // ── 4. POPULATE REALISTIC SURVEY DATA (247 Feedbacks) ───────────────
        if (CandidateSatisfactionSurvey::count() >= 100) {
            $this->command->info('Candidate satisfaction survey data already seeded.');
            return;
        }

        $specificQuotes = [
            [
                'nama' => 'Rizky Ramadhan',
                'email' => 'rizky.ramadhan@gmail.com',
                'posisi' => 'IT Programmer',
                'disukai' => 'Prosesnya sudah bagus, informasi jelas dan kemudahan pendaftarannya sangat membantu.',
                'diperbaiki' => 'Undangan interview selanjutnya mungkin bisa via WhatsApp, jika pelamar ada kendala hadir bisa reschedule via WhatsApp.',
                'q1' => 5, 'q2' => 5, 'q3' => 4, 'q4' => 5, 'q5' => 5, 'q6' => 5, 'q7' => 5,
                'sentimen' => 'positif',
                'nps' => 10,
                'date' => '2025-03-12 09:30:00',
            ],
            [
                'nama' => 'Nabila Putri Santoso',
                'email' => 'nabila.ps@yahoo.com',
                'posisi' => 'Marketing SPV',
                'disukai' => 'Tim HR sangat ramah saat menyambut kandidat dan instruksi skill test sangat terstruktur.',
                'diperbaiki' => 'Sistem lamaran yang masih tulis tangan bisa dijadikan digital, jadi lebih praktis.',
                'q1' => 4, 'q2' => 5, 'q3' => 5, 'q4' => 4, 'q5' => 5, 'q6' => 5, 'q7' => 5,
                'sentimen' => 'positif',
                'nps' => 9,
                'date' => '2025-03-10 14:15:00',
            ],
            [
                'nama' => 'Dimas Aditya',
                'email' => 'dimas.aditya@outlook.com',
                'posisi' => 'Service Advisor',
                'disukai' => 'Fasilitas ujian skill test nyaman dan penguji sangat objektif serta memberikan feedback yang konstruktif.',
                'diperbaiki' => 'Proses rekrutmen lebih cepat terutama jeda antara pengumuman skill test ke jadwal interview user.',
                'q1' => 5, 'q2' => 4, 'q3' => 4, 'q4' => 5, 'q5' => 5, 'q6' => 5, 'q7' => 5,
                'sentimen' => 'positif',
                'nps' => 9,
                'date' => '2025-03-08 11:20:00',
            ],
            [
                'nama' => 'Fajar Pratama',
                'email' => 'fajar.p@gmail.com',
                'posisi' => 'Admin Dealer',
                'disukai' => 'Pelayanan ramah, tempat tes bersih, dan penjelasan tugas saat wawancara sangat transparan.',
                'diperbaiki' => 'Fitur reschedule interview secara online agar tidak perlu telepon manual jika berhalangan.',
                'q1' => 4, 'q2' => 5, 'q3' => 4, 'q4' => 5, 'q5' => 4, 'q6' => 5, 'q7' => 5,
                'sentimen' => 'positif',
                'nps' => 10,
                'date' => '2025-03-05 16:45:00',
            ],
            [
                'nama' => 'Cindy Oktaviani',
                'email' => 'cindy.okta@gmail.com',
                'posisi' => 'Part Staff',
                'disukai' => 'Pendaftaran online melalui website sangat mudah diakses melalui HP.',
                'diperbaiki' => 'Form lamaran bisa dibuat digital secara menyeluruh tanpa perlu print formulir fisik.',
                'q1' => 5, 'q2' => 5, 'q3' => 5, 'q4' => 5, 'q5' => 5, 'q6' => 5, 'q7' => 5,
                'sentimen' => 'positif',
                'nps' => 10,
                'date' => '2025-02-28 10:10:00',
            ],
        ];

        foreach ($specificQuotes as $sq) {
            $avg = round(($sq['q1'] + $sq['q2'] + $sq['q3'] + $sq['q4'] + $sq['q5'] + $sq['q6'] + $sq['q7']) / 7, 2);
            CandidateSatisfactionSurvey::create([
                'nama_kandidat' => $sq['nama'],
                'email_kandidat' => $sq['email'],
                'posisi' => $sq['posisi'],
                'tahap' => 'Skill Test',
                'q1_kemudahan_daftar' => $sq['q1'],
                'q2_kejelasan_info' => $sq['q2'],
                'q3_kecepatan_proses' => $sq['q3'],
                'q4_kemudahan_data' => $sq['q4'],
                'q5_pengalaman_skill_test' => $sq['q5'],
                'q6_profesionalisme_hr' => $sq['q6'],
                'q7_kepuasan_keseluruhan' => $sq['q7'],
                'q8_hal_disukai' => $sq['disukai'],
                'q9_hal_diperbaiki' => $sq['diperbaiki'],
                'skor_rata_rata' => $avg,
                'nps_score' => $sq['nps'],
                'sentimen' => $sq['sentimen'],
                'created_at' => Carbon::parse($sq['date']),
                'updated_at' => Carbon::parse($sq['date']),
            ]);
        }

        // Generate the remaining to reach 247 responses
        // Target averages matching the image:
        // q1: ~4.6, q2: ~4.7, q3: ~4.5, q4: ~4.8, q5: ~4.8, q6: ~4.9, q7: ~4.8
        // Overall: 4.8
        // Sentimen: 92% Positif (~227), 6% Netral (~15), 2% Negatif (~5)
        // NPS: +72
        $posisiList = ['IT Programmer', 'Marketing SPV', 'Service Advisor', 'Admin Dealer', 'Part Staff', 'Mekanik'];
        $firstNames = ['Agus', 'Budi', 'Chandra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hendra', 'Indah', 'Joko', 'Kartika', 'Lukman', 'Mega', 'Nugroho', 'Oki', 'Pratiwi', 'Rahmat', 'Sari', 'Taufik', 'Utami', 'Wahyu', 'Yogi', 'Zahra'];
        $lastNames = ['Kusuma', 'Pratama', 'Saputra', 'Wijaya', 'Santoso', 'Utomo', 'Siregar', 'Hidayat', 'Wibowo', 'Firmansyah', 'Permana', 'Lestari', 'Anggraini', 'Putra'];

        $disukaiList = [
            'Proses tes sangat transparan dan jadwal tepat waktu.',
            'Kenyamanan ruangan dan keramahan tim HR.',
            'Penjelasan tahapan seleksi sangat detail.',
            'Kemudahan apply online tanpa ribet.',
            'Soal skill test sangat relevan dengan pekerjaan sebenarnya.',
            'Respons admin sangat cepat dan membantu.',
            'Wawancara berjalan dua arah dan santai.',
        ];

        $diperbaikiList = [
            'Form lamaran bisa dibuat digital agar ramah lingkungan.',
            'Undangan interview via WhatsApp agar lebih cepat terbaca.',
            'Proses rekrutmen lebih cepat dalam memberikan update lolos/tidaknya.',
            'Reschedule interview secara online memudahkan jika mendadak ada ujian.',
            'Tidak perlu isi formulir tulis tangan ulang saat tiba di lokasi.',
            'Perbanyak petunjuk arah ke ruang skill test.',
        ];

        for ($i = 6; $i <= 247; $i++) {
            // Sentiment distribution: 92% positif, 6% netral, 2% negatif
            if ($i <= 227) {
                $sentiment = 'positif';
                $nps = rand(9, 10);
                $q1 = rand(4, 5);
                $q2 = rand(4, 5);
                $q3 = (rand(1, 10) <= 6) ? 5 : 4;
                $q4 = 5;
                $q5 = 5;
                $q6 = 5;
                $q7 = 5;
            } elseif ($i <= 242) {
                $sentiment = 'netral';
                $nps = rand(7, 8);
                $q1 = rand(3, 4);
                $q2 = rand(4, 5);
                $q3 = rand(3, 4);
                $q4 = rand(4, 5);
                $q5 = rand(4, 5);
                $q6 = rand(4, 5);
                $q7 = 4;
            } else {
                $sentiment = 'negatif';
                $nps = rand(4, 6);
                $q1 = rand(2, 3);
                $q2 = rand(3, 4);
                $q3 = rand(2, 3);
                $q4 = rand(3, 4);
                $q5 = rand(3, 4);
                $q6 = rand(4, 5);
                $q7 = rand(2, 3);
            }

            $avg = round(($q1 + $q2 + $q3 + $q4 + $q5 + $q6 + $q7) / 7, 2);
            $nama = $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
            $posisi = $posisiList[array_rand($posisiList)];

            // Date spread across Jan 2025 to Mar 2025 (or recent months)
            $day = rand(1, 28);
            $month = rand(1, 3);
            $hour = rand(8, 17);
            $minute = rand(0, 59);
            $createdAt = Carbon::create(2025, $month, $day, $hour, $minute, 0);

            CandidateSatisfactionSurvey::create([
                'nama_kandidat' => $nama,
                'email_kandidat' => strtolower(str_replace(' ', '.', $nama)) . '@gmail.com',
                'posisi' => $posisi,
                'tahap' => 'Skill Test',
                'q1_kemudahan_daftar' => $q1,
                'q2_kejelasan_info' => $q2,
                'q3_kecepatan_proses' => $q3,
                'q4_kemudahan_data' => $q4,
                'q5_pengalaman_skill_test' => $q5,
                'q6_profesionalisme_hr' => $q6,
                'q7_kepuasan_keseluruhan' => $q7,
                'q8_hal_disukai' => ($i % 3 === 0) ? $disukaiList[array_rand($disukaiList)] : null,
                'q9_hal_diperbaiki' => ($i % 2 === 0) ? $diperbaikiList[array_rand($diperbaikiList)] : null,
                'skor_rata_rata' => $avg,
                'nps_score' => $nps,
                'sentimen' => $sentiment,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('Candidate satisfaction survey data seeded successfully (247 entries, roles & permissions attached)!');
    }
}
