<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Pembaruan Status Lamaran — {{ config('app.name', 'Citalent') }}</title>
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
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">

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
                                        <span style="font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em;">
                                            Status Seleksi
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
                            <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #09090b; letter-spacing: -0.02em;">
                                Informasi hasil seleksi lamaran kerja
                            </h1>

                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                                Kepada Yth. <strong>{{ $pelamar->nama_lengkap }}</strong>,
                            </p>

                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.6;">
                                Terima kasih atas partisipasi dan dedikasi Saudara/i dalam mengikuti proses seleksi penerimaan karyawan untuk posisi <strong>{{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'yang dilamar') }}</strong> di {{ config('app.name', 'PT. Menara Agung') }}.
                            </p>

                            <!-- Status Badge Box -->
                            @if($status === 'accepted')
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d; margin-bottom: 6px;">
                                            Hasil Seleksi
                                        </div>
                                        <div style="font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 6px;">
                                            Diterima Bekerja
                                        </div>
                                        <div style="font-size: 13px; color: #166534; line-height: 1.55;">
                                            Selamat, Anda dinyatakan lolos seluruh tahapan dan diterima bergabung dengan {{ config('app.name', 'PT. Menara Agung') }}. Tim Human Capital kami akan segera menghubungi Anda untuk pembahasan penawaran resmi (*offering letter*) dan penandatanganan kontrak kerja.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            @elseif($status === 'rejected')
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 6px;">
                                            Hasil Evaluasi
                                        </div>
                                        <div style="font-size: 16px; font-weight: 700; color: #27272a; margin-bottom: 6px;">
                                            Belum Dapat Melanjutkan ke Tahapan Berikutnya
                                        </div>
                                        <div style="font-size: 13px; color: #52525b; line-height: 1.55;">
                                            Setelah mempertimbangkan kualifikasi seluruh kandidat secara menyeluruh, saat ini kami belum dapat melanjutkan lamaran Saudara/i. Data profil Anda akan tetap tersimpan dalam basis data talent pool kami untuk prioritas peluang yang sesuai di masa mendatang.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            @else
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #09090b; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; margin-bottom: 6px;">
                                            Tahapan Terkini
                                        </div>
                                        <div style="font-size: 18px; font-weight: 700; color: #fafafa; margin-bottom: 4px;">
                                            {{ $statusLabel }}
                                        </div>
                                        <div style="font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                                            Lamaran Anda telah berhasil diperbarui ke tahapan di atas. Mohon pantau email dan portal secara berkala untuk jadwal serta instruksi pelaksanaan.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Context Details Table -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; border: 1px solid #f4f4f5; background-color: #fafafa; border-radius: 6px; font-size: 12px;">
                                <tr>
                                    <td style="padding: 10px 14px; color: #71717a; width: 35%; border-bottom: 1px solid #f4f4f5;">No. Pendaftaran</td>
                                    <td style="padding: 10px 14px; color: #18181b; font-weight: 600; font-family: ui-monospace, Menlo, Consolas, monospace; border-bottom: 1px solid #f4f4f5;">
                                        {{ $pelamar->no_pendaftaran }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Posisi yang Dilamar</td>
                                    <td style="padding: 10px 14px; color: #18181b; font-weight: 500; border-bottom: 1px solid #f4f4f5;">
                                        {{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? '-') }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Status Perkembangan</td>
                                    <td style="padding: 10px 14px; color: #18181b; font-weight: 600; border-bottom: 1px solid #f4f4f5;">
                                        {{ $statusLabel }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; color: #71717a;">Tanggal Pembaruan</td>
                                    <td style="padding: 10px 14px; color: #18181b; font-weight: 500;">
                                        {{ date('d F Y') }}
                                    </td>
                                </tr>
                            </table>

                            @if(!empty($catatan))
                            <!-- Recruiter Note Box -->
                            <div style="margin: 0 0 24px 0; background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 3px solid #71717a; border-radius: 6px; padding: 14px 16px;">
                                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #52525b; margin-bottom: 6px;">
                                    Catatan dari Tim Rekrutmen
                                </div>
                                <div style="font-size: 13px; color: #27272a; line-height: 1.6;">
                                    {!! nl2br(e($catatan)) !!}
                                </div>
                            </div>
                            @endif

                            <!-- Direct Link Action -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                                <tr>
                                    <td>
                                        <a href="{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 6px; text-decoration: none; letter-spacing: -0.01em;">
                                            Lihat Rincian di Portal Rekrutmen &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="border-top: 1px solid #f4f4f5; padding-top: 20px;">
                                <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.6;">
                                    Demikian pemberitahuan ini kami sampaikan. Apabila terdapat pertanyaan lebih lanjut, Anda dapat menghubungi tim rekrutmen kami melalui portal karir.
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
                        <td style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 20px 32px; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        Email ini dikirimkan secara otomatis oleh sistem rekrutmen resmi {{ config('app.name', 'PT. Menara Agung') }}. Dokumen ini ditujukan khusus untuk penerima yang tertera di atas.
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