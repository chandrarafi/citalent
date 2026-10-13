<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    @php
        $posisi = $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'Posisi Rekrutmen');
    @endphp
    <title>Pemberitahuan Hasil Seleksi — {{ config('app.name', 'Citalent') }}</title>
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
                border-left: none !important;
                border-right: none !important;
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

                <!-- Main Card -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">

                    <!-- Brand Header -->
                    <tr>
                        <td style="padding: 28px 32px; border-bottom: 1px solid #f4f4f5;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <img src="{{ asset('assets/images/logo-red-1.png') }}"
                                             alt="{{ config('app.name', 'Citalent') }}"
                                             width="140"
                                             style="display: block; width: 140px; height: auto;" />
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #71717a; background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                                            Hasil Seleksi
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content-cell" style="padding: 36px 32px 32px 32px;">

                            <!-- Heading -->
                            <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #09090b; letter-spacing: -0.02em; line-height: 1.3;">
                                Informasi Hasil Seleksi Lamaran Kerja
                            </h1>

                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                                Kepada Yth. <strong>{{ $pelamar->nama_lengkap }}</strong>,
                            </p>

                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.6;">
                                Terima kasih atas minat, dedikasi, serta waktu yang telah Saudara/i luangkan untuk melamar dan mengikuti proses seleksi pada posisi <strong>{{ $posisi }}</strong> di <strong>{{ config('app.name', 'PT. Menara Agung') }}</strong>.
                            </p>

                            <!-- Rejection Notice Box (Neutral / Courteous Tone) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 4px solid #71717a; border-right: none; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px 22px;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 6px;">
                                            Hasil Evaluasi
                                        </div>
                                        <div style="font-size: 17px; font-weight: 700; color: #18181b; margin-bottom: 8px;">
                                            Belum Dapat Melanjutkan ke Tahapan Berikutnya
                                        </div>
                                        <div style="font-size: 13px; color: #52525b; line-height: 1.6;">
                                            Setelah mempertimbangkan seluruh profil serta kualifikasi kandidat yang masuk secara cermat, kami menyampaikan permohonan maaf bahwa untuk saat ini kami belum dapat melanjutkan proses lamaran Saudara/i ke tahapan seleksi berikutnya.
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Details Table -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; border: 1px solid #e4e4e7; border-right: none; background-color: #fafafa; border-radius: 8px; font-size: 13px;">
                                <tr>
                                    <td style="padding: 12px 16px; color: #71717a; width: 38%; border-bottom: 1px solid #f4f4f5;">No. Registrasi / Pendaftaran</td>
                                    <td style="padding: 12px 16px; color: #18181b; font-weight: 600; font-family: ui-monospace, Menlo, Consolas, monospace; border-bottom: 1px solid #f4f4f5;">
                                        {{ $pelamar->no_pendaftaran }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Posisi yang Dilamar</td>
                                    <td style="padding: 12px 16px; color: #18181b; font-weight: 600; border-bottom: 1px solid #f4f4f5;">
                                        {{ $posisi }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Status Hasil Seleksi</td>
                                    <td style="padding: 12px 16px; color: #dc2626; font-weight: 600; border-bottom: 1px solid #f4f4f5;">
                                        Tidak Lolos / Belum Memenuhi Kualifikasi
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; color: #71717a;">Tanggal Keputusan</td>
                                    <td style="padding: 12px 16px; color: #18181b; font-weight: 500;">
                                        {{ date('d F Y') }}
                                    </td>
                                </tr>
                            </table>

                            @if(!empty($catatan))
                            <!-- Feedback Note Box -->
                            <div style="margin: 0 0 24px 0; background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 3px solid #a1a1aa; border-right: none; border-radius: 6px; padding: 14px 16px;">
                                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #52525b; margin-bottom: 6px;">
                                    Catatan Tambahan dari Tim Rekrutmen
                                </div>
                                <div style="font-size: 13px; color: #27272a; line-height: 1.6;">
                                    {!! nl2br(e($catatan)) !!}
                                </div>
                            </div>
                            @endif

                            <!-- Talent Pool Notice Box -->
                            <div style="margin: 0 0 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-right: none; border-radius: 8px; padding: 18px 20px;">
                                <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
                                    💼 Basis Data Talent Pool Citalent
                                </div>
                                <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
                                    Keputusan ini sama sekali tidak mengurangi penghargaan kami terhadap bakat, keahlian, dan potensi yang Saudara/i miliki. Data profil Anda akan tetap tersimpan di basis data <strong>Talent Pool</strong> kami, dan apabila di kemudian hari terdapat posisi lain yang sesuai dengan profil Saudara/i, tim rekrutmen kami dapat menghubungi Anda kembali.
                                </p>
                            </div>

                            <!-- Direct Link Action -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                                <tr>
                                    <td>
                                        <a href="{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}" target="_blank" style="display: inline-block; background-color: #27272a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 11px 22px; border-radius: 6px; text-decoration: none; letter-spacing: -0.01em;">
                                            Lihat Status di Portal Rekrutmen &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="border-top: 1px solid #f4f4f5; padding-top: 20px;">
                                <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
                                    Kami mengucapkan terima kasih yang sebesar-besarnya atas partisipasi Anda, dan kami mendoakan kesuksesan dalam setiap langkah perjalanan karir profesional Saudara/i.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Letterhead Signoff -->
                    <tr>
                        <td style="padding: 0 32px 24px 32px;">
                            <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                                Hormat kami,<br>
                                <strong style="color: #27272a;">Tim Human Capital &amp; Talent Acquisition</strong><br>
                                {{ config('app.name', 'PT. Menara Agung') }}
                            </p>
                        </td>
                    </tr>

                    <!-- Legal Footer -->
                    <tr>
                        <td style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 20px 32px; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        Email ini dikirimkan secara resmi dan otomatis oleh sistem rekrutmen {{ config('app.name', 'PT. Menara Agung') }}. Dokumen ini ditujukan khusus untuk penerima yang tertera.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 6px; color: #d4d4d8;">
                                        &copy; {{ date('Y') }} {{ config('app.name', 'PT. Menara Agung') }}. All rights reserved.
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
