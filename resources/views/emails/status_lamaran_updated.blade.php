<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pemberitahuan Status Lamaran Kerja</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 28px 12px;
            -webkit-font-smoothing: antialiased;
        }

        .wrapper {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
        }

        .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 32px 28px;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }

        .header p {
            color: #94a3b8;
            margin: 6px 0 0 0;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.3px;
        }

        .content {
            padding: 36px 30px;
        }

        .greeting {
            font-size: 17px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
        }

        .lead-text {
            font-size: 14px;
            color: #475569;
            line-height: 1.65;
            margin-bottom: 24px;
        }

        .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px 20px;
            margin-bottom: 24px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            border-bottom: 1px dashed #e2e8f0;
        }

        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .info-row:first-child {
            padding-top: 0;
        }

        .info-label {
            color: #64748b;
            font-weight: 500;
        }

        .info-value {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
        }

        /* Status Banner: Lolos / Berhasil */
        .status-banner-success {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 22px;
            margin: 24px 0;
        }

        .badge-success {
            display: inline-block;
            background: #10b981;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 4px 10px;
            border-radius: 9999px;
            margin-bottom: 10px;
        }

        .status-title-success {
            font-size: 16px;
            font-weight: 700;
            color: #065f46;
            margin: 0 0 8px 0;
        }

        .status-desc-success {
            font-size: 13px;
            color: #047857;
            line-height: 1.6;
            margin: 0;
        }

        /* Status Banner: Ditolak / Gagal */
        .status-banner-rejected {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 22px;
            margin: 24px 0;
        }

        .badge-rejected {
            display: inline-block;
            background: #ef4444;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 4px 10px;
            border-radius: 9999px;
            margin-bottom: 10px;
        }

        .status-title-rejected {
            font-size: 16px;
            font-weight: 700;
            color: #991b1b;
            margin: 0 0 8px 0;
        }

        .status-desc-rejected {
            font-size: 13px;
            color: #b91c1c;
            line-height: 1.6;
            margin: 0;
        }

        /* Status Banner: Netral / Default */
        .status-banner-neutral {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 22px;
            margin: 24px 0;
        }

        .badge-neutral {
            display: inline-block;
            background: #3b82f6;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 4px 10px;
            border-radius: 9999px;
            margin-bottom: 10px;
        }

        .status-title-neutral {
            font-size: 16px;
            font-weight: 700;
            color: #1e40af;
            margin: 0 0 8px 0;
        }

        .status-desc-neutral {
            font-size: 13px;
            color: #1d4ed8;
            line-height: 1.6;
            margin: 0;
        }

        .catatan-box {
            background: #fffbeb;
            border: 1px solid #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 14px 16px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
            line-height: 1.5;
        }

        .catatan-title {
            font-weight: 700;
            margin-bottom: 4px;
            color: #78350f;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .btn-wrapper {
            text-align: center;
            margin: 32px 0 16px 0;
        }

        .btn {
            display: inline-block;
            background: #0284c7;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);
        }

        .btn:hover {
            background: #0369a1;
        }

        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 20px 24px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
        }

        .footer p {
            margin: 4px 0;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="header">
            <h1>{{ config('app.name', 'Citalent') }}</h1>
            <p>Pemberitahuan Rekrutmen & Seleksi</p>
        </div>

        <div class="content">
            <div class="greeting">Halo, {{ $pelamar->nama_lengkap }}</div>

            <p class="lead-text">
                Terima kasih atas partisipasi dan dedikasi Anda dalam mengikuti proses seleksi penerimaan karyawan di <strong>{{ config('app.name', 'Citalent') }}</strong>.
            </p>

            <div class="info-card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 500;">No. Pendaftaran</td>
                        <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">{{ $pelamar->no_pendaftaran }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 500;">Posisi Dilamar</td>
                        <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right;">{{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? '-') }}</td>
                    </tr>
                    @if($pelamar->lowongan?->departement?->deskripsi)
                    <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 500;">Departemen</td>
                        <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right;">{{ $pelamar->lowongan->departement->deskripsi }}</td>
                    </tr>
                    @endif
                </table>
            </div>

            @if($status === 'rejected')
            <!-- Status: Ditolak / Tidak Lolos -->
            <div class="status-banner-rejected">
                <span class="badge-rejected">Informasi Hasil Seleksi</span>
                <h3 class="status-title-rejected">Status: Belum Berhasil Melanjutkan</h3>
                <p class="status-desc-rejected">
                    Setelah melakukan evaluasi menyeluruh terhadap hasil tes dan kualifikasi yang dipersyaratkan, kami menginformasikan bahwa saat ini kami belum dapat melanjutkan proses lamaran Anda ke tahapan berikutnya.
                </p>
            </div>

            <p class="lead-text">
                Keputusan ini bukanlah cerminan dari kemampuan Anda secara keseluruhan, melainkan kesesuaian profil kandidat dengan kebutuhan spesifik posisi saat ini. Data Anda akan tetap tersimpan pada talent pool kami untuk pertimbangan peluang karir di masa depan. Kami mendoakan kesuksesan yang terbaik untuk perjalanan karir Anda.
            </p>

            @elseif(in_array($status, ['interview_hr', 'interview_user', 'interview_gm', 'final_discussion', 'accepted', 'skill_test']))
            <!-- Status: Lolos / Lanjut Tahap -->
            <div class="status-banner-success">
                <span class="badge-success">Selamat! Lolos Seleksi</span>
                @if($status === 'interview_hr')
                <h3 class="status-title-success">Tahap Selanjutnya: Interview HR</h3>
                <p class="status-desc-success">
                    Selamat! Anda dinyatakan <strong>LOLOS</strong> pada tahapan seleksi sebelumnya dan berhak untuk melanjutkan ke tahap <strong>Interview HR</strong>.
                </p>
                @elseif($status === 'interview_user')
                <h3 class="status-title-success">Tahap Selanjutnya: Interview User</h3>
                <p class="status-desc-success">
                    Selamat! Anda dinyatakan <strong>LOLOS</strong> dan berhak untuk melanjutkan ke tahap <strong>Interview User</strong>.
                </p>
                @elseif($status === 'interview_gm')
                <h3 class="status-title-success">Tahap Selanjutnya: Interview GM</h3>
                <p class="status-desc-success">
                    Selamat! Anda dinyatakan <strong>LOLOS</strong> dan berhak untuk melanjutkan ke tahap <strong>Interview General Manager (GM)</strong>.
                </p>
                @elseif($status === 'final_discussion')
                <h3 class="status-title-success">Tahap Selanjutnya: Final Discussion</h3>
                <p class="status-desc-success">
                    Selamat! Anda berhak untuk melanjutkan ke tahap <strong>Final Discussion</strong>.
                </p>
                @elseif($status === 'accepted')
                <h3 class="status-title-success">Dinyatakan Diterima (Accepted)</h3>
                <p class="status-desc-success">
                    Selamat! Anda secara resmi dinyatakan <strong>DITERIMA</strong> untuk bergabung bersama tim {{ config('app.name', 'Citalent') }}.
                </p>
                @elseif($status === 'skill_test')
                <h3 class="status-title-success">Tahap Seleksi: Skill Test</h3>
                <p class="status-desc-success">
                    Anda dijadwalkan untuk mengikuti tahapan <strong>Skill Test</strong>.
                </p>
                @endif
            </div>

            <p class="lead-text">
                Tim Human Resources (HR) kami akan segera menghubungi Anda melalui email atau nomor kontak WhatsApp terdaftar untuk mengonfirmasi rincian jadwal, tautan meeting, atau petunjuk teknis pelaksanaan tahapan ini.
            </p>

            @else
            <!-- Status Default Lainnya -->
            <div class="status-banner-neutral">
                <span class="badge-neutral">Pembaruan Tahapan</span>
                <h3 class="status-title-neutral">Status Lamaran Diperbarui</h3>
                <p class="status-desc-neutral">
                    Status lamaran kerja Anda saat ini telah diperbarui di sistem rekrutmen kami.
                </p>
            </div>
            @endif

            @if(!empty($catatan))
            <div class="catatan-box">
                <div class="catatan-title">Catatan dari Tim HR / Rekruter:</div>
                <div>{{ $catatan }}</div>
            </div>
            @endif

            <div class="btn-wrapper">
                <a href="{{ url('/kandidat/lamaran') }}" class="btn" target="_blank">
                    Lihat Rincian Status Lamaran
                </a>
            </div>
        </div>

        <div class="footer">
            <p>Email ini dibuat secara otomatis oleh sistem rekrutmen <strong>{{ config('app.name', 'Citalent') }}</strong>.</p>
            <p>Mohon untuk tidak membalas langsung ke alamat email pengirim ini.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name', 'Citalent') }}. All rights reserved.</p>
        </div>
    </div>
</body>

</html>