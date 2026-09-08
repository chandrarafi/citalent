<?php

namespace Database\Seeders;

use App\Models\DetailParameterSkillTest;
use App\Models\Jabatan;
use App\Models\ParameterSkillTest;
use Illuminate\Database\Seeder;

class ParameterSkillTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ─── 1. SKILL TEST (skill_test) ──────────────────────────────────────────
        $skillTestData = [
            // IT Programmer (JBT-27)
            'JBT-27' => [
                [
                    'parameter' => 'Core Programming & Software Architecture',
                    'bobot' => 25,
                    'icon' => 'code',
                    'urutan' => 1,
                    'yang_dinilai' => [
                        'Penerapan konsep OOP, Design Patterns & Clean Code',
                        'Penguasaan Framework Laravel (MVC, Eloquent, Service Layer)',
                        'Pengembangan Frontend Modern (React, TypeScript, State Management)',
                        'Perancangan RESTful API & Keamanan Endpoint',
                    ],
                ],
                [
                    'parameter' => 'Database Design & Query Optimization',
                    'bobot' => 20,
                    'icon' => 'database',
                    'urutan' => 2,
                    'yang_dinilai' => [
                        'Perancangan skema relasional PostgreSQL / MySQL & Normalisasi',
                        'Optimasi Query SQL Kompleks, Indexing & Explain Plan',
                        'Integritas data, Transactions, Database Migrations & Seeding',
                    ],
                ],
                [
                    'parameter' => 'Problem Solving & Algorithmic Challenge',
                    'bobot' => 20,
                    'icon' => 'target',
                    'urutan' => 3,
                    'yang_dinilai' => [
                        'Logika berpikir dan kecepatan menyelesaikan studi kasus nyata',
                        'Efisiensi algoritma dan penanganan edge-case skenario',
                        'Kemampuan debugging, tracing error dan error handling yang handal',
                    ],
                ],
                [
                    'parameter' => 'Application Security & Best Practices',
                    'bobot' => 20,
                    'icon' => 'shield',
                    'urutan' => 4,
                    'yang_dinilai' => [
                        'Pencegahan celah keamanan (SQL Injection, XSS, CSRF, Auth bypass)',
                        'Validasi data input yang ketat & sanitasi payload',
                        'Manajemen sesi, enkripsi data sensitif & implementasi HTTPS/CORS',
                    ],
                ],
                [
                    'parameter' => 'Version Control & DevOps Collaboration',
                    'bobot' => 15,
                    'icon' => 'git-branch',
                    'urutan' => 5,
                    'yang_dinilai' => [
                        'Workflow Git (Branching strategy, Pull Requests, Resolving Conflicts)',
                        'Pemahaman konfigurasi web server & environment deployment',
                        'Dokumentasi API, kode terstruktur & kesiapan CI/CD pipeline',
                    ],
                ],
            ],

            // IT Help Desk (JBT-28)
            'JBT-28' => [
                [
                    'parameter' => 'Hardware & Peripheral Diagnostics',
                    'bobot' => 20,
                    'icon' => 'cpu',
                    'urutan' => 1,
                    'yang_dinilai' => [
                        'Pemahaman perakitan, komponen PC, Laptop & spesifikasi hardware',
                        'Diagnosa cepat kerusakan hardware & penggantian part cadangan',
                        'Instalasi, konfigurasi & pemeliharaan peripheral (Printer, Scanner, CCTV)',
                    ],
                ],
                [
                    'parameter' => 'Operating System & Software Deployment',
                    'bobot' => 20,
                    'icon' => 'apps',
                    'urutan' => 2,
                    'yang_dinilai' => [
                        'Instalasi & konfigurasi OS Windows / Linux / macOS',
                        'Manajemen software perkantoran, ERP client & antivirus korporasi',
                        'Pengelolaan User Profile, Active Directory & Hak Akses Lokal',
                    ],
                ],
                [
                    'parameter' => 'Networking & Connectivity Troubleshooting',
                    'bobot' => 20,
                    'icon' => 'wifi',
                    'urutan' => 3,
                    'yang_dinilai' => [
                        'Troubleshooting koneksi LAN, Wi-Fi, VPN & IP Addressing (DHCP/Static)',
                        'Crimping kabel UTP RJ45 & pengujian kabel tester jaringan',
                        'Konfigurasi dasar Switch, Access Point & Router kantor cabang',
                    ],
                ],
                [
                    'parameter' => 'Incident Resolution & Remote Support',
                    'bobot' => 20,
                    'icon' => 'settings',
                    'urutan' => 4,
                    'yang_dinilai' => [
                        'Kemampuan remote support menggunakan tools (AnyDesk, TeamViewer, RDP)',
                        'Kecepatan SLA dalam merespon dan menyelesaikan tiket insiden',
                        'Pencatatan log gangguan, penulisan solusi & eskalasi tiket terstruktur',
                    ],
                ],
                [
                    'parameter' => 'Service Excellence & User Communication',
                    'bobot' => 20,
                    'icon' => 'heart-handshake',
                    'urutan' => 5,
                    'yang_dinilai' => [
                        'Sikap ramah, sopan dan sabar dalam melayani keluhan pengguna',
                        'Komunikasi penjelasan teknis dengan bahasa yang mudah dipahami awam',
                        'Ketenangan & profesionalisme saat menangani insiden genting/urgent',
                    ],
                ],
            ],

            // IT Infrastruktur (JBT-31)
            'JBT-31' => [
                [
                    'parameter' => 'Server & Virtualization Administration',
                    'bobot' => 25,
                    'icon' => 'server',
                    'urutan' => 1,
                    'yang_dinilai' => [
                        'Administrasi Linux Server (Ubuntu/Debian/RHEL) & Windows Server',
                        'Virtualisasi Server (Proxmox, VMware ESXi) & Resource Allocation',
                        'Containerization (Docker) & orkestrasi service aplikasi',
                    ],
                ],
                [
                    'parameter' => 'Network Architecture & Routing Security',
                    'bobot' => 25,
                    'icon' => 'router',
                    'urutan' => 2,
                    'yang_dinilai' => [
                        'Konfigurasi Routing (BGP, OSPF, Static) pada Mikrotik / Cisco',
                        'Firewall Rules, NAT, VLAN Segmentation & Bandwidth Management',
                        'Site-to-Site VPN, IPsec & WireGuard antar kantor cabang',
                    ],
                ],
                [
                    'parameter' => 'Backup Strategy & Disaster Recovery Plan',
                    'bobot' => 20,
                    'icon' => 'cloud-upload',
                    'urutan' => 3,
                    'yang_dinilai' => [
                        'Otomasi backup data berkala (on-premise & off-site cloud backup)',
                        'Simulasi Disaster Recovery & pengujian integritas file restore',
                        'Konfigurasi High Availability (HA), Load Balancer & Failover clustering',
                    ],
                ],
                [
                    'parameter' => 'Infrastructure Monitoring & Performance Tuning',
                    'bobot' => 15,
                    'icon' => 'activity',
                    'urutan' => 4,
                    'yang_dinilai' => [
                        'Setup monitoring server & network menggunakan Zabbix / Grafana / Prometheus',
                        'Analisa utilisasi CPU, RAM, Disk I/O & Network Traffic bottleneck',
                        'Sistem peringatan dini (Alerting via Telegram/Email) saat downtime',
                    ],
                ],
                [
                    'parameter' => 'IT Security Policy, Compliance & Documentation',
                    'bobot' => 15,
                    'icon' => 'shield-lock',
                    'urutan' => 5,
                    'yang_dinilai' => [
                        'Penerapan patch keamanan berkala & audit port jaringan terbuka',
                        'Dokumentasi topologi jaringan, IP list & inventaris aset server',
                        'Kepatuhan terhadap SOP keamanan siber & disaster management perusahaan',
                    ],
                ],
            ],

            // Manager IT (JBT-26)
            'JBT-26' => [
                [
                    'parameter' => 'IT Strategy, Roadmap & Enterprise Architecture',
                    'bobot' => 25,
                    'icon' => 'compass',
                    'urutan' => 1,
                    'yang_dinilai' => [
                        'Penyusunan IT Roadmap yang selaras dengan tujuan bisnis perusahaan',
                        'Perancangan Enterprise Architecture & modernisasi sistem legacy',
                        'Evaluasi pemilihan vendor, teknologi stack & software licensing',
                    ],
                ],
                [
                    'parameter' => 'Project Management & Resource Allocation',
                    'bobot' => 25,
                    'icon' => 'clipboard-check',
                    'urutan' => 2,
                    'yang_dinilai' => [
                        'Manajemen proyek IT menggunakan metodologi Agile / Scrum / Waterfall',
                        'Pengelolaan alokasi SDM programmer, sysadmin, helpdesk & budget tim',
                        'Monitoring timeline, delivery milestone & mitigasi risiko keterlambatan',
                    ],
                ],
                [
                    'parameter' => 'Cybersecurity Governance & Data Privacy',
                    'bobot' => 20,
                    'icon' => 'lock',
                    'urutan' => 3,
                    'yang_dinilai' => [
                        'Penyusunan kebijakan keamanan informasi (Information Security Policy)',
                        'Kepatuhan regulasi perlindungan data pribadi (PDP) & audit sistem',
                        'Business Continuity Plan (BCP) & manajemen krisis insiden siber',
                    ],
                ],
                [
                    'parameter' => 'Technical Leadership & Team Development',
                    'bobot' => 15,
                    'icon' => 'users',
                    'urutan' => 4,
                    'yang_dinilai' => [
                        'Mentoring, coaching dan peningkatan kompetensi anggota tim IT',
                        'Penerapan kultur kerja kolaboratif, inovatif dan berorientasi solusi',
                        'Penilaian performa KPI anggota tim IT secara objektif',
                    ],
                ],
                [
                    'parameter' => 'Budgeting, Cost Optimization & ROI',
                    'bobot' => 15,
                    'icon' => 'currency-dollar',
                    'urutan' => 5,
                    'yang_dinilai' => [
                        'Penyusunan Rencana Kerja & Anggaran Belanja (RKAB / IT Budget)',
                        'Optimasi biaya infrastruktur cloud, lisensi dan perangkat keras',
                        'Analisa efisiensi dan Return on Investment (ROI) dari implementasi sistem IT',
                    ],
                ],
            ],

            // Sales Force Management (JBT-5)
            'JBT-5' => [
                [
                    'parameter' => 'Sales Strategy & Territory Planning',
                    'bobot' => 25,
                    'icon' => 'map-pin',
                    'urutan' => 1,
                    'yang_dinilai' => [
                        'Pemetaan potensi pasar per wilayah & penetapan target sales force',
                        'Strategi penetrasi produk baru ke dealer / sub-dealer & konsumen',
                        'Analisis pergerakan kompetitor dan pangsa pasar (Market Share)',
                    ],
                ],
                [
                    'parameter' => 'Sales Team Leadership & Supervision',
                    'bobot' => 25,
                    'icon' => 'users',
                    'urutan' => 2,
                    'yang_dinilai' => [
                        'Pengawasan aktivitas harian wiraniaga / sales canvaser di lapangan',
                        'Coaching teknik negosiasi & penutupan penjualan (closing skills)',
                        'Monitoring pencapaian KPI sales individu & tim secara konsisten',
                    ],
                ],
                [
                    'parameter' => 'Sales Pipeline & Funnel Analysis',
                    'bobot' => 20,
                    'icon' => 'filter',
                    'urutan' => 3,
                    'yang_dinilai' => [
                        'Pengelolaan database prospek dari tahap lead hingga conversion',
                        'Analisa konversi sales funnel & identifikasi penyebab lost sales',
                        'Pemanfaatan sistem CRM untuk monitoring efektivitas kunjungan sales',
                    ],
                ],
                [
                    'parameter' => 'Distribution Channel & Dealer Engagement',
                    'bobot' => 15,
                    'icon' => 'building-store',
                    'urutan' => 4,
                    'yang_dinilai' => [
                        'Hubungan kemitraan yang kuat dengan pemilik dealer & outlet mitra',
                        'Evaluasi ketersediaan stok produk & program promo penjualan',
                        'Penyelesaian kendala distribusi dan klaim program insentif dealer',
                    ],
                ],
                [
                    'parameter' => 'Commercial Negotiation & Problem Solving',
                    'bobot' => 15,
                    'icon' => 'briefcase',
                    'urutan' => 5,
                    'yang_dinilai' => [
                        'Keahlian bernegosiasi kontrak penjualan besar / fleet customer',
                        'Solusi cepat dalam menangani keluhan pelanggan dan kendala kredit',
                        'Integritas transaksi dan kepatuhan terhadap kebijakan harga resmi',
                    ],
                ],
            ],
        ];

        // ─── 2. INTERVIEW HR (interview_hr) ──────────────────────────────────────
        $interviewHrTemplate = [
            [
                'parameter' => 'Kepribadian & Karakter Integritas (Attitude & Integrity)',
                'bobot' => 20,
                'icon' => 'user-check',
                'urutan' => 1,
                'yang_dinilai' => [
                    'Kejujuran dalam menyampaikan riwayat hidup, latar belakang dan pengalaman kerja',
                    'Sopan santun, etika bersikap dan tutur kata profesional selama wawancara',
                    'Kematangan emosi, stabilitas diri dan kemampuan mengelola stres / tekanan',
                ],
            ],
            [
                'parameter' => 'Motivasi Kerja & Komitmen Karir',
                'bobot' => 20,
                'icon' => 'flame',
                'urutan' => 2,
                'yang_dinilai' => [
                    'Antusiasme & ketertarikan nyata terhadap profil industri dan posisi yang dilamar',
                    'Komitmen jangka panjang untuk bertumbuh bersama perusahaan',
                    'Semangat continuous learning dan keinginan meningkatkan kompetensi diri',
                ],
            ],
            [
                'parameter' => 'Keterampilan Komunikasi & Interpersonal',
                'bobot' => 20,
                'icon' => 'message-circle',
                'urutan' => 3,
                'yang_dinilai' => [
                    'Artikulasi, struktur bahasa dan kejelasan dalam menyampaikan gagasan / ide',
                    'Kemampuan mendengarkan aktif dan merespon pertanyaan dengan tepat sasaran',
                    'Keluwesan berinteraksi dan empati dalam membangun hubungan sosial',
                ],
            ],
            [
                'parameter' => 'Kerjasama Tim & Kemampuan Adaptasi Budaya Kerja',
                'bobot' => 20,
                'icon' => 'users-group',
                'urutan' => 4,
                'yang_dinilai' => [
                    'Pengalaman bekerja dalam tim lintas fungsi dan kemampuan mengatasi perbedaan',
                    'Fleksibilitas dan keterbukaan terhadap dinamika perubahan lingkungan kerja',
                    'Sikap positif terhadap feedback, evaluasi kerja dan arahan pimpinan',
                ],
            ],
            [
                'parameter' => 'Kedisiplinan, Tanggung Jawab & Daya Juang (Grit)',
                'bobot' => 20,
                'icon' => 'shield-check',
                'urutan' => 5,
                'yang_dinilai' => [
                    'Manajemen waktu, ketepatan kehadiran dan komitmen terhadap janji',
                    'Rasa tanggung jawab penuh terhadap penyelesaian tugas hingga tuntas',
                    'Daya juang (grit), pantang menyerah dan inisiatif tinggi dalam menghadapi tantangan',
                ],
            ],
        ];

        // ─── 3. INTERVIEW USER (interview_user) ──────────────────────────────────
        $interviewUserTemplate = [
            [
                'parameter' => 'Penguasaan Bidang Teknis & Relevansi Pengalaman Kerja',
                'bobot' => 25,
                'icon' => 'briefcase',
                'urutan' => 1,
                'yang_dinilai' => [
                    'Kedalaman pemahaman terhadap tugas pokok, fungsi dan alur kerja posisi',
                    'Relevansi portofolio / rekam jejak pengalaman kerja dengan kebutuhan divisi',
                    'Kemampuan menggunakan tools, aplikasi, atau instrumen teknis pendukung pekerjaan',
                ],
            ],
            [
                'parameter' => 'Kemampuan Pemecahan Masalah (Problem Solving Studi Kasus)',
                'bobot' => 25,
                'icon' => 'puzzle',
                'urutan' => 2,
                'yang_dinilai' => [
                    'Metode analisa masalah secara sistematis dan identifikasi akar penyebab (Root Cause)',
                    'Kecepatan & kreativitas dalam menyusun alternatif solusi yang aplikatif',
                    'Ketepatan pengambilan keputusan teknis berdasarkan data dan fakta di lapangan',
                ],
            ],
            [
                'parameter' => 'Manajemen Waktu, Prioritas & Ketepatan Eksekusi',
                'bobot' => 20,
                'icon' => 'clock-check',
                'urutan' => 3,
                'yang_dinilai' => [
                    'Kemampuan menyusun rencana kerja harian/mingguan dan mengatur prioritas deadline',
                    'Ketangguhan dalam menangani multi-tasking tanpa menurunkan kualitas hasil kerja',
                    'Disiplin terhadap timeline proyek dan ketepatan delivery output pekerjaan',
                ],
            ],
            [
                'parameter' => 'Inisiatif Inovasi & Continuous Improvement',
                'bobot' => 15,
                'icon' => 'bulb',
                'urutan' => 4,
                'yang_dinilai' => [
                    'Kemampuan mengusulkan ide perbaikan efisiensi proses kerja di divisi',
                    'Kesiapan mengadopsi teknologi atau metode baru untuk meningkatkan produktivitas',
                    'Sikap proaktif tanpa harus selalu menunggu instruksi detail dari atasan',
                ],
            ],
            [
                'parameter' => 'Kesiapan Kolaborasi Harian & Reporting kepada User',
                'bobot' => 15,
                'icon' => 'report',
                'urutan' => 5,
                'yang_dinilai' => [
                    'Kesiapan berkomunikasi intensif mengenai progres pekerjaan harian kepada calon atasan',
                    'Kualitas penyusunan laporan kerja tertulis yang rapi, akurat dan tepat waktu',
                    'Kesiapan menerima arahan teknis serta adaptasi cepat dengan gaya kerja tim',
                ],
            ],
        ];

        // ─── 4. INTERVIEW GM (interview_gm) ──────────────────────────────────────
        // Specifically for JBT-6 (Network Development Spv. / Survey) and JBT-37 (Network Development Spv.)
        $interviewGmTemplate = [
            [
                'parameter' => 'Visi Strategis, Pemahaman Bisnis & Ekspansi Jaringan',
                'bobot' => 25,
                'icon' => 'compass',
                'urutan' => 1,
                'yang_dinilai' => [
                    'Pemahaman mendalam mengenai lanskap bisnis industri otomotif & arah target korporasi',
                    'Kemampuan menganalisa potensi kelayakan lokasi baru (Feasibility Study) ekspansi dealer/jaringan',
                    'Keselarasan rencana strategis divisi jaringan dengan visi pertumbuhan jangka panjang perusahaan',
                ],
            ],
            [
                'parameter' => 'Kepemimpinan Strategis (Leadership) & People Management',
                'bobot' => 25,
                'icon' => 'crown',
                'urutan' => 2,
                'yang_dinilai' => [
                    'Kapasitas memimpin, mengarahkan dan memotivasi tim di bawah supervisinya',
                    'Keahlian dalam manajemen konflik tim dan pendelegasian wewenang yang efektif',
                    'Kemampuan mengembangkan potensi bawahan (Talent Development & Mentoring)',
                ],
            ],
            [
                'parameter' => 'Pengambilan Keputusan Manajerial & Manajemen Risiko',
                'bobot' => 20,
                'icon' => 'scale',
                'urutan' => 3,
                'yang_dinilai' => [
                    'Ketajaman dalam menganalisis perbandingan risiko (Risk) vs keuntungan (Reward)',
                    'Ketegasan dan kecepatan mengambil keputusan di tengah situasi krisis / ketidakpastian pasar',
                    'Akuntabilitas dan tanggung jawab penuh terhadap dampak keputusan yang diambil',
                ],
            ],
            [
                'parameter' => 'Kemampuan Negosiasi Tingkat Tinggi & Hubungan Mitra Strategis',
                'bobot' => 15,
                'icon' => 'handshake',
                'urutan' => 4,
                'yang_dinilai' => [
                    'Keahlian bernegosiasi dengan calon investor dealer, mitra principal, dan pihak eksternal',
                    'Kemampuan komunikasi persuasif dan diplomasi pada forum level eksekutif',
                    'Membangun dan memelihara hubungan kemitraan bisnis yang saling menguntungkan (Win-Win)',
                ],
            ],
            [
                'parameter' => 'Integritas Tinggi, Tata Kelola (GCG) & Loyalitas Korporasi',
                'bobot' => 15,
                'icon' => 'award',
                'urutan' => 5,
                'yang_dinilai' => [
                    'Komitmen teguh terhadap Good Corporate Governance (GCG) dan kepatuhan hukum',
                    'Menjaga kerahasiaan data strategis dan reputasi luhur perusahaan di mata publik',
                    'Dedikasi, loyalitas serta komitmen penuh terhadap keberlanjutan bisnis perusahaan',
                ],
            ],
        ];

        // ─── 5. INTERVIEW HR & USER KHUSUS JBT-38 (CDB Administrator) ─────────
        $jbt38HrParams = [
            [
                'parameter' => 'Kepribadian, Kejujuran & Integritas Kerja',
                'bobot' => 20,
                'icon' => 'user-check',
                'urutan' => 1,
                'yang_dinilai' => [
                    'Kejujuran dalam penyampaian data pribadi, latar belakang & riwayat pengalaman kerja',
                    'Sopan santun, etika bersikap dan tutur kata profesional selama wawancara',
                    'Kematangan emosi, kestabilan sikap dan kesabaran menghadapi rutinitas administrasi',
                ],
            ],
            [
                'parameter' => 'Ketelitian, Kerapian & Fokus pada Detail (Detail Orientation)',
                'bobot' => 20,
                'icon' => 'search',
                'urutan' => 2,
                'yang_dinilai' => [
                    'Tingkat ketelitian tinggi dalam pengolahan dan pencatatan dokumen konsumen',
                    'Komitmen kuat terhadap prinsip Zero-Mistake / nihil kesalahan data',
                    'Kerapian tata kelola pengarsipan berkas dokumen fisik maupun softcopy digital',
                ],
            ],
            [
                'parameter' => 'Motivasi Kerja & Komitmen Karir Administrasi',
                'bobot' => 20,
                'icon' => 'flame',
                'urutan' => 3,
                'yang_dinilai' => [
                    'Antusiasme nyata terhadap tugas-tugas pengelolaan database konsumen (CDB)',
                    'Komitmen jangka panjang untuk bertumbuh dan loyal kepada perusahaan',
                    'Kemauan belajar hal baru serta keterbukaan terhadap arahan & pembinaan atasan',
                ],
            ],
            [
                'parameter' => 'Keterampilan Komunikasi & Kerjasama Tim',
                'bobot' => 20,
                'icon' => 'message-circle',
                'urutan' => 4,
                'yang_dinilai' => [
                    'Kemampuan komunikasi verbal dan tertulis yang jelas dengan tim Sales & Counter',
                    'Sikap kooperatif, tanggap dan bersahabat saat berkoordinasi lintas divisi',
                    'Keterampilan mendengarkan aktif dan responsif terhadap permintaan data',
                ],
            ],
            [
                'parameter' => 'Kedisiplinan, Manajemen Waktu & Daya Juang (Grit)',
                'bobot' => 20,
                'icon' => 'shield-check',
                'urutan' => 5,
                'yang_dinilai' => [
                    'Manajemen waktu kerja yang baik dan ketepatan kehadiran kerja',
                    'Tanggung jawab penuh terhadap target penyelesaian entri database harian',
                    'Daya tahan kerja tinggi saat menghadapi beban volume data memuncak di akhir bulan',
                ],
            ],
        ];

        $jbt38UserParams = [
            [
                'parameter' => 'Penguasaan Alur Administrasi Database Konsumen (CDB)',
                'bobot' => 25,
                'icon' => 'database',
                'urutan' => 1,
                'yang_dinilai' => [
                    'Pemahaman siklus data konsumen mulai dari SPK, Faktur, STNK hingga pengarsipan CDB',
                    'Validasi kelengkapan dokumen identitas (KTP, KK, NPWP, Berkas Leasing/Cash)',
                    'Pemahaman struktur database pelanggan & segmentasi profil pembeli kendaraan',
                ],
            ],
            [
                'parameter' => 'Kemahiran Aplikasi Spreadsheet & Sistem DMS Dealer',
                'bobot' => 25,
                'icon' => 'table',
                'urutan' => 2,
                'yang_dinilai' => [
                    'Keahlian Microsoft Excel tingkat menengah-lanjut (VLOOKUP, XLOOKUP, Pivot Table, Data Cleansing)',
                    'Kecepatan dan akurasi mengetik data alphanumeric (10-finger typing skill)',
                    'Kemampuan adaptasi cepat terhadap software Dealer Management System (DMS / ERP)',
                ],
            ],
            [
                'parameter' => 'Kecepatan & Akurasi Pemrosesan Data (SLA & Zero Error)',
                'bobot' => 20,
                'icon' => 'clock-check',
                'urutan' => 3,
                'yang_dinilai' => [
                    'Ketepatan waktu (SLA) dalam pengiriman data harian CDB ke Main Dealer / Principal',
                    'Kemampuan identifikasi dan rekonsiliasi data ganda (duplicate entry) atau anomali data',
                    'Disiplin pelaporan berkala dan ketepatan closing database bulanan',
                ],
            ],
            [
                'parameter' => 'Problem Solving Kendala Data & Koordinasi Lapangan',
                'bobot' => 15,
                'icon' => 'puzzle',
                'urutan' => 4,
                'yang_dinilai' => [
                    'Penanganan cepat terhadap berkas konsumen yang tertunda atau tidak lengkap',
                    'Koordinasi solutif dengan wiraniaga/sales force dan finance/leasing terkait verifikasi data',
                    'Inisiatif eskalasi yang tepat saat menemukan kendala teknis pada sistem database',
                ],
            ],
            [
                'parameter' => 'Kepatuhan Perlindungan Data Pribadi (Data Privacy) & SOP',
                'bobot' => 15,
                'icon' => 'lock',
                'urutan' => 5,
                'yang_dinilai' => [
                    'Kepatuhan mutlak terhadap SOP kerahasiaan dan perlindungan data pribadi konsumen (PDP)',
                    'Pencegahan kebocoran data kontak konsumen kepada pihak luar yang tidak berwenang',
                    'Kerapian tata kelola backup data dan pemeliharaan arsip faktur/CDB perusahaan',
                ],
            ],
        ];

        // List of jabatans to seed for HR & User interview
        $targetJabatans = [
            'JBT-27', // IT Programmer
            'JBT-28', // IT Help Desk
            'JBT-31', // IT Infrastruktur
            'JBT-26', // Manager IT
            'JBT-5',  // Sales Force Management
            'JBT-6',  // Network Development Spv. / Survey
            'JBT-37', // Network Development Spv.
            'JBT-23', // HRD & GA Manager
            'JBT-1',  // Marketing Manager
        ];

        // Seed 1: Skill Test
        foreach ($skillTestData as $kdJabatan => $paramList) {
            $this->seedParamsForJabatan($kdJabatan, 'skill_test', $paramList);
        }

        // Seed 2: Interview HR
        foreach ($targetJabatans as $kdJabatan) {
            $this->seedParamsForJabatan($kdJabatan, 'interview_hr', $interviewHrTemplate);
        }

        // Seed 3: Interview User
        foreach ($targetJabatans as $kdJabatan) {
            $this->seedParamsForJabatan($kdJabatan, 'interview_user', $interviewUserTemplate);
        }

        // Seed 4: Interview GM (Specifically for JBT-6 and JBT-37)
        $gmJabatans = ['JBT-6', 'JBT-37'];
        foreach ($gmJabatans as $kdJabatan) {
            $this->seedParamsForJabatan($kdJabatan, 'interview_gm', $interviewGmTemplate);
        }

        // Seed 5: Specific for JBT-38 (CDB Administrator)
        $this->seedParamsForJabatan('JBT-38', 'interview_hr', $jbt38HrParams);
        $this->seedParamsForJabatan('JBT-38', 'interview_user', $jbt38UserParams);

        if ($this->command) {
            $this->command->info('Berhasil membuat parameter realistis untuk Skill Test, Interview HR, Interview User (termasuk JBT-38 CDB Administrator), dan Interview GM.');
        }
    }

    /**
     * Helper to seed parameters & detail items for a specific jabatan and stage.
     */
    private function seedParamsForJabatan(string $kdJabatan, string $jenisTahap, array $params): void
    {
        // Check if Jabatan exists in database
        $jabatanExists = Jabatan::where('kd_jabatan', $kdJabatan)->exists();
        if (!$jabatanExists) {
            return;
        }

        foreach ($params as $paramData) {
            $param = ParameterSkillTest::updateOrCreate(
                [
                    'kd_jabatan' => $kdJabatan,
                    'jenis_tahap' => $jenisTahap,
                    'parameter' => $paramData['parameter'],
                ],
                [
                    'bobot' => $paramData['bobot'],
                    'icon' => $paramData['icon'],
                    'urutan' => $paramData['urutan'],
                    'active' => true,
                ]
            );

            // Seed details
            foreach ($paramData['yang_dinilai'] as $idx => $yangDinilai) {
                DetailParameterSkillTest::updateOrCreate(
                    [
                        'parameter_skill_test_id' => $param->id,
                        'yang_dinilai' => $yangDinilai,
                    ],
                    [
                        'urutan' => $idx + 1,
                    ]
                );
            }
        }
    }
}
