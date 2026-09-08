<?php

namespace Database\Seeders;

use App\Models\FormulirLamaran;
use App\Models\Lowongan;
use App\Models\Pelamar;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyCandidateSkillTestSeeder extends Seeder
{
    public function run(): void
    {
        $kandidatRole = Role::firstOrCreate(['name' => 'kandidat'], [
            'label' => 'Kandidat',
            'description' => 'Role untuk pelamar kerja / kandidat.',
        ]);

        $lowongan = Lowongan::find(2);
        if (!$lowongan) {
            $this->command->error('Lowongan ID 2 tidak ditemukan.');
            return;
        }

        $candidatesData = [
            [
                'name' => 'Dimas Pratama Putra',
                'email' => 'dimas.pratama@gmail.com',
                'no_pendaftaran' => 'REG-' . date('Ymd') . '-0010',
                'tempat_lahir' => 'Padang',
                'tanggal_lahir' => '2001-08-14',
                'jenis_kelamin' => 'Laki-laki',
                'status_pernikahan' => 'Belum Menikah',
                'agama' => 'Islam',
                'alamat' => 'Jl. Khatib Sulaiman No. 45 RT 02 RW 03, Kota Padang',
                'domisili' => 'Kota Padang',
                'nomor_kontak' => '081267891234',
                'pendidikan_terakhir' => 'D4/S1',
                'nama_institusi' => 'Universitas Andalas',
                'jurusan' => 'Teknik Informatika',
                'tahun_lulus' => '2024',
                'no_ktp' => '1371011408010001',
                'pendidikan_formal' => [
                    [
                        'jenjang' => 'S1',
                        'nama_sekolah' => 'Universitas Andalas',
                        'jurusan' => 'Teknik Informatika',
                        'tahun_masuk' => '2020',
                        'tahun_lulus' => '2024',
                        'nilai_akhir' => '3.65',
                    ],
                    [
                        'jenjang' => 'SMA/SMK',
                        'nama_sekolah' => 'SMKN 1 Padang',
                        'jurusan' => 'Teknik Komputer & Jaringan',
                        'tahun_masuk' => '2017',
                        'tahun_lulus' => '2020',
                        'nilai_akhir' => '88.5',
                    ],
                ],
                'pengalaman_kerja' => [
                    [
                        'nama_perusahaan' => 'PT Semen Padang',
                        'posisi' => 'IT Support Intern',
                        'tahun_masuk' => '2023',
                        'tahun_keluar' => '2024',
                        'gaji_terakhir' => '2500000',
                        'alasan_keluar' => 'Selesai masa magang',
                    ],
                ],
                'bahasa_asing' => [
                    [
                        'bahasa' => 'Inggris',
                        'tingkat' => 'Menengah (B2)',
                    ],
                ],
            ],
            [
                'name' => 'Anisa Rahmawati',
                'email' => 'anisa.rahmawati@gmail.com',
                'no_pendaftaran' => 'REG-' . date('Ymd') . '-0011',
                'tempat_lahir' => 'Bukittinggi',
                'tanggal_lahir' => '2002-03-22',
                'jenis_kelamin' => 'Perempuan',
                'status_pernikahan' => 'Belum Menikah',
                'agama' => 'Islam',
                'alamat' => 'Jl. Belanti Indah No. 12, Lolong Belanti, Kota Padang',
                'domisili' => 'Kota Padang',
                'nomor_kontak' => '082176543210',
                'pendidikan_terakhir' => 'D4/S1',
                'nama_institusi' => 'Universitas Putra Indonesia YPTK',
                'jurusan' => 'Sistem Informasi',
                'tahun_lulus' => '2024',
                'no_ktp' => '1371022203020002',
                'pendidikan_formal' => [
                    [
                        'jenjang' => 'S1',
                        'nama_sekolah' => 'Universitas Putra Indonesia YPTK Padang',
                        'jurusan' => 'Sistem Informasi',
                        'tahun_masuk' => '2020',
                        'tahun_lulus' => '2024',
                        'nilai_akhir' => '3.78',
                    ],
                    [
                        'jenjang' => 'SMA/SMK',
                        'nama_sekolah' => 'SMAN 3 Bukittinggi',
                        'jurusan' => 'IPA',
                        'tahun_masuk' => '2017',
                        'tahun_lulus' => '2020',
                        'nilai_akhir' => '89.0',
                    ],
                ],
                'pengalaman_kerja' => [
                    [
                        'nama_perusahaan' => 'Bank Nagari Sumbar',
                        'posisi' => 'IT Helpdesk & Operations',
                        'tahun_masuk' => '2024',
                        'tahun_keluar' => '2025',
                        'gaji_terakhir' => '3500000',
                        'alasan_keluar' => 'Kontrak project selesai',
                    ],
                ],
                'bahasa_asing' => [
                    [
                        'bahasa' => 'Inggris',
                        'tingkat' => 'Fasih (Fluent)',
                    ],
                ],
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@gmail.com',
                'no_pendaftaran' => 'REG-' . date('Ymd') . '-0012',
                'tempat_lahir' => 'Solok',
                'tanggal_lahir' => '2001-11-05',
                'jenis_kelamin' => 'Laki-laki',
                'status_pernikahan' => 'Belum Menikah',
                'agama' => 'Islam',
                'alamat' => 'Jl. Andalas No. 88, Simpang Haru, Kota Padang',
                'domisili' => 'Kota Padang',
                'nomor_kontak' => '085298765432',
                'pendidikan_terakhir' => 'D4/S1',
                'nama_institusi' => 'Politeknik Negeri Padang',
                'jurusan' => 'Manajemen Informatika',
                'tahun_lulus' => '2023',
                'no_ktp' => '1371030511010003',
                'pendidikan_formal' => [
                    [
                        'jenjang' => 'D4',
                        'nama_sekolah' => 'Politeknik Negeri Padang',
                        'jurusan' => 'Teknologi Rekayasa Perangkat Lunak',
                        'tahun_masuk' => '2019',
                        'tahun_lulus' => '2023',
                        'nilai_akhir' => '3.52',
                    ],
                ],
                'pengalaman_kerja' => [
                    [
                        'nama_perusahaan' => 'CV Solusi Digital Mandiri',
                        'posisi' => 'Junior Hardware & Network Technician',
                        'tahun_masuk' => '2023',
                        'tahun_keluar' => '2025',
                        'gaji_terakhir' => '3200000',
                        'alasan_keluar' => 'Mencari pengembangan karir lebih lanjut',
                    ],
                ],
                'bahasa_asing' => [
                    [
                        'bahasa' => 'Inggris',
                        'tingkat' => 'Dasar',
                    ],
                ],
            ],
        ];

        foreach ($candidatesData as $data) {
            // 1. Create or update User
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'role_id' => $kandidatRole->id,
                    'status' => 'active',
                ]
            );

            // 2. Create or update Pelamar
            $pelamar = Pelamar::updateOrCreate(
                ['email' => $data['email'], 'lowongan_id' => $lowongan->id],
                [
                    'no_pendaftaran' => $data['no_pendaftaran'],
                    'nama_lengkap' => $data['name'],
                    'tempat_lahir' => $data['tempat_lahir'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'jenis_kelamin' => $data['jenis_kelamin'],
                    'status_pernikahan' => $data['status_pernikahan'],
                    'agama' => $data['agama'],
                    'alamat' => $data['alamat'],
                    'domisili' => $data['domisili'],
                    'nomor_kontak' => $data['nomor_kontak'],
                    'pendidikan_terakhir' => $data['pendidikan_terakhir'],
                    'nama_institusi' => $data['nama_institusi'],
                    'jurusan' => $data['jurusan'],
                    'tahun_lulus' => $data['tahun_lulus'],
                    'posisi_dilamar' => $lowongan->judul,
                    'cv_path' => 'rekrutmen/cv/hq57exNc9CtiYPA2PqYBQUfzRvqIbNqYlA9Zunny.pdf',
                    'foto_path' => 'rekrutmen/foto/9SDnYYO9wH3wUpVo9IvXvl1NFvkVTphbQDdpEltq.jpg',
                    'pernyataan_kebenaran' => true,
                    'status' => 'skill_test', // TAHAP SKILL TEST
                    'catatan' => 'Lolos tahap administrasi & formulir, siap untuk penilaian skill test.',
                ]
            );

            // 3. Create or update FormulirLamaran
            FormulirLamaran::updateOrCreate(
                ['pelamar_id' => $pelamar->id],
                [
                    'user_id' => $user->id,
                    'no_lamaran' => $data['no_pendaftaran'],
                    'nama_lengkap' => $data['name'],
                    'tempat_lahir' => $data['tempat_lahir'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'agama' => $data['agama'],
                    'kewarganegaraan' => 'WNI',
                    'no_ktp_sim' => $data['no_ktp'],
                    'alamat_padang' => $data['alamat'],
                    'telp_padang' => $data['nomor_kontak'],
                    'hp_padang' => $data['nomor_kontak'],
                    'pendidikan_formal' => $data['pendidikan_formal'],
                    'alasan_pilih_jurusan' => 'Minat yang tinggi pada bidang teknologi informasi dan pemecahan masalah teknis jaringan komputer.',
                    'bahasa_asing' => $data['bahasa_asing'],
                    'status_pernikahan' => $data['status_pernikahan'],
                    'pengalaman_kerja' => $data['pengalaman_kerja'],
                    'gambaran_jabatan' => 'Melakukan troubleshooting hardware, instalasi OS, pemeliharaan jaringan LAN/WLAN, dan support pengguna harian.',
                    'cita_cita' => 'Menjadi IT Infrastructure & Systems Lead yang profesional.',
                    'pendorong_kerja' => 'Keinginan berkontribusi di perusahaan otomotif terkemuka dan meningkatkan keahlian teknis.',
                    'alasan_melamar_perusahaan' => 'Perusahaan memiliki reputasi yang sangat baik dengan lingkungan kerja yang mendukung pertumbuhan profesional.',
                    'gaji_diharapkan' => 'Rp 4.000.000 - Rp 5.000.000',
                    'fasilitas_diharapkan' => 'BPJS Ketenagakerjaan & Kesehatan, Tunjangan Transport, Pelatihan Teknis.',
                    'kapan_mulai_kerja' => 'Segera',
                    'bersedia_luar_daerah' => 'Ya, Bersedia',
                    'ada_kenalan_perusahaan' => 'Tidak',
                    'pernah_sakit_lama' => 'Tidak',
                    'kekuatan_diri' => 'Cepat belajar teknologi baru, disiplin, teliti dalam menganalisa error log, komunikasi ramah ke user.',
                    'kelemahan_diri' => 'Kadang terlalu perfeksionis dalam merapikan dokumentasi konfigurasi.',
                    'pernyataan_kebenaran' => true,
                    'tanggal_pernyataan' => Carbon::now()->format('Y-m-d'),
                    'is_submitted' => true,
                    'submitted_at' => Carbon::now(),
                ]
            );
        }
    }
}
