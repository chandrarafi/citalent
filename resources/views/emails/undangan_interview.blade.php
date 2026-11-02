<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    @php
    // Logo embedding logic
    $logoPath = public_path('assets/images/logo-red-1.png');
    if (isset($message) && is_object($message) && method_exists($message, 'embed') && file_exists($logoPath)) {
        $logoSrc = $message->embed($logoPath);
    } elseif (file_exists($logoPath)) {
        $logoSrc = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
    } else {
        $logoSrc = asset('assets/images/logo-red-1.png');
    }
    @endphp
    <title>{{ $isReminder ? 'Pengingat Jadwal Wawancara Kerja' : 'Undangan Wawancara Kerja' }} — {{ config('app.name', 'Citalent') }}</title>
    <style type="text/css">
        body, table, td, a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
        }
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #18181b;
            line-height: 1.5;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                max-width: 100% !important;
                border-radius: 0 !important;
            }
            .content-cell {
                padding: 28px 20px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">

    <!-- Outer Canvas -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 48px 12px;">
        <tr>
            <td align="center">

                <!-- Main Card (Clean & Borderless) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">

                    <!-- Brand Header -->
                    <tr>
                        <td style="padding: 28px 32px 20px 32px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <img src="{{ $logoSrc }}"
                                             alt="{{ config('app.name', 'PT. Menara Agung') }}"
                                             width="140"
                                             style="display: block; width: 140px; max-width: 140px; height: auto; border: 0;" />
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 700; color: #71717a; background-color: #f4f4f5; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                                            {{ $isReminder ? 'Pengingat Jadwal' : 'Undangan Wawancara' }}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content-cell" style="padding: 16px 32px 32px 32px;">

                            <!-- Heading -->
                            <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #09090b; letter-spacing: -0.02em;">
                                {{ $isReminder ? 'Pengingat jadwal wawancara kerja' : 'Undangan resmi wawancara kerja' }}
                            </h1>

                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                                Kepada Yth. <strong>{{ $pelamar->nama_lengkap }}</strong>,
                            </p>

                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.6;">
                                @if ($isReminder)
                                Kami mengingatkan kembali agenda wawancara kerja Saudara/i untuk posisi <strong>{{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'yang dilamar') }}</strong> di {{ config('app.name', 'PT. Menara Agung') }}:
                                @else
                                Sehubungan dengan proses seleksi penerimaan karyawan untuk posisi <strong>{{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'yang dilamar') }}</strong> di {{ config('app.name', 'PT. Menara Agung') }}, dengan ini kami mengundang Saudara/i untuk menghadiri sesi wawancara dengan rincian sebagai berikut:
                                @endif
                            </p>

                            <!-- Hero Schedule Box (Clean & Borderless) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #09090b; border-radius: 12px;">
                                <tr>
                                    <td style="padding: 24px 22px;">
                                        <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; margin-bottom: 8px;">
                                            Agenda &bull; {{ $schedule->tahap_label }}
                                        </div>
                                        <div style="font-size: 20px; font-weight: 700; color: #fafafa; margin-bottom: 6px;">
                                            {{ \Carbon\Carbon::parse($schedule->tanggal_interview)->locale('id')->isoFormat('dddd, D MMMM Y') }}
                                        </div>
                                        <div style="font-size: 14px; color: #d4d4d8; margin-bottom: 12px;">
                                            Pukul {{ $schedule->jam_mulai }} WIB{{ $schedule->jam_selesai ? ' s/d ' . $schedule->jam_selesai . ' WIB' : '' }}
                                        </div>

                                        <div style="padding-top: 10px; font-size: 12px; color: #a1a1aa;">
                                            Metode: <strong style="color: #ffffff;">{{ $schedule->tipe_interview === 'online' ? 'Online (Video Conference)' : 'Tatap Muka (Offline)' }}</strong>
                                            @if ($schedule->tipe_interview === 'offline' && $schedule->lokasi)
                                                <br>Lokasi: <span style="color: #ffffff;">{{ $schedule->lokasi }}</span>
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            @if ($schedule->tipe_interview === 'online' && $schedule->link_meeting)
                            <!-- Action Button for Online Meeting -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td>
                                        <a href="{{ $schedule->link_meeting }}" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 600; padding: 12px 22px; border-radius: 8px; text-decoration: none; letter-spacing: -0.01em;">
                                            Masuk ke Ruang Video Call &rarr;
                                        </a>
                                        <div style="margin-top: 8px; font-size: 11px; color: #71717a;">
                                            Tautan langsung: <a href="{{ $schedule->link_meeting }}" target="_blank" style="color: #dc2626; word-break: break-all;">{{ $schedule->link_meeting }}</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Context Details Table (Clean & Borderless) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #fafafa; border-radius: 12px; font-size: 12px;">
                                <tr>
                                    <td style="padding: 12px 16px 6px 16px; color: #71717a; width: 35%;">No. Pendaftaran</td>
                                    <td style="padding: 12px 16px 6px 16px; color: #18181b; font-weight: 600; font-family: ui-monospace, Menlo, Consolas, monospace;">
                                        {{ $pelamar->no_pendaftaran }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 16px; color: #71717a;">Posisi yang Dilamar</td>
                                    <td style="padding: 6px 16px; color: #18181b; font-weight: 500;">
                                        {{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? '-') }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 16px; color: #71717a;">Tahapan Seleksi</td>
                                    <td style="padding: 6px 16px; color: #18181b; font-weight: 500;">
                                        {{ $schedule->tahap_label }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 16px 12px 16px; color: #71717a;">Format Pelaksanaan</td>
                                    <td style="padding: 6px 16px 12px 16px; color: #18181b; font-weight: 500;">
                                        {{ $schedule->tipe_interview === 'online' ? 'Video Conference (Google Meet)' : 'Tatap Muka di Lokasi Perusahaan' }}
                                    </td>
                                </tr>
                            </table>

                            <!-- Instructions / Petunjuk Pelaksanaan (Clean & Borderless) -->
                            <div style="margin: 0 0 24px 0; background-color: #f4f4f5; border-radius: 12px; padding: 18px 20px;">
                                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #52525b; margin-bottom: 8px;">
                                    Petunjuk &amp; Ketentuan Wawancara
                                </div>
                                @if ($schedule->catatan_untuk_kandidat)
                                <div style="font-size: 13px; color: #27272a; line-height: 1.6;">
                                    {!! nl2br(e($schedule->catatan_untuk_kandidat)) !!}
                                </div>
                                @else
                                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #3f3f46; line-height: 1.65;">
                                    <li>Hadir atau siap pada ruang sesi selambat-lambatnya 10 menit sebelum waktu yang dijadwalkan.</li>
                                    <li>Mengenakan pakaian kerja formal, rapi, dan profesional.</li>
                                    @if ($schedule->tipe_interview === 'online')
                                    <li>Memastikan perangkat kamera, mikrofon, dan koneksi internet berada dalam kondisi stabil.</li>
                                    @else
                                    <li>Membawa berkas cetak dokumen pendukung (CV, ijazah, atau portofolio relevan).</li>
                                    @endif
                                </ul>
                                @endif
                            </div>

                            <!-- Portal Tracking Link -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                                <tr>
                                    <td>
                                        <a href="{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 13px; font-weight: 600; padding: 11px 22px; border-radius: 8px; text-decoration: none; letter-spacing: -0.01em;">
                                            Pantau Riwayat Lamaran di Portal &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="padding-top: 12px;">
                                <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.6;">
                                    Demikian undangan ini kami sampaikan. Apabila terdapat hal mendesak mengenai jadwal di atas, silakan hubungi tim rekrutmen kami melalui portal rekrutmen.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Subtle Letterhead Signoff -->
                    <tr>
                        <td style="padding: 0 32px 24px 32px;">
                            <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                                Hormat kami,<br>
                                <strong style="color: #27272a;">Divisi Human Capital &amp; Recruitment</strong><br>
                                {{ config('app.name', 'PT. Menara Agung') }}
                            </p>
                        </td>
                    </tr>

                    <!-- Legal Footer -->
                    <tr>
                        <td style="background-color: #fafafa; padding: 22px 32px; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        Email ini dikirimkan secara otomatis oleh sistem rekrutmen resmi {{ config('app.name', 'PT. Menara Agung') }}. Dokumen ini bersifat rahasia dan ditujukan khusus untuk penerima yang tertera di atas.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 6px; color: #d4d4d8;">
                                        &copy; {{ date('Y') }} PT. Menara Agung. All rights reserved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>