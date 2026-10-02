<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Kode Verifikasi Akun — {{ config('app.name', 'Citalent') }}</title>
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
            .code-display {
                font-size: 28px !important;
                letter-spacing: 0.25em !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">

    <!-- Outer Canvas -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 48px 12px;">
        <tr>
            <td align="center">

                <!-- Main Card -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">

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
                                            Verifikasi Akun
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
                                Kode verifikasi pendaftaran
                            </h1>

                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                                Yth. <strong>{{ $name }}</strong>,
                            </p>

                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.6;">
                                Kami menerima permintaan pendaftaran akun kandidat Anda di portal <strong>{{ config('app.name', 'Citalent') }}</strong>. Masukkan kode berikut pada formulir verifikasi untuk menyelesaikan proses:
                            </p>

                            <!-- Minimalist Obsidian Code Box -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #09090b; border-radius: 8px;">
                                <tr>
                                    <td align="center" style="padding: 24px 20px;">
                                        <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; margin-bottom: 8px;">
                                            Kode Satu Kali (One-Time Password)
                                        </div>
                                        <div class="code-display" style="font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: 34px; font-weight: 700; color: #fafafa; letter-spacing: 0.32em; padding-left: 0.32em; text-align: center;">
                                            {{ $otp }}
                                        </div>
                                        <div style="margin-top: 10px; font-size: 11px; color: #71717a;">
                                            Kode ini kedaluwarsa dalam 10 menit
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Context Details Table -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; border: 1px solid #f4f4f5; background-color: #fafafa; border-radius: 6px; font-size: 12px;">
                                <tr>
                                    <td style="padding: 10px 14px; color: #71717a; width: 35%; border-bottom: 1px solid #f4f4f5;">Keperluan</td>
                                    <td style="padding: 10px 14px; color: #18181b; font-weight: 500; border-bottom: 1px solid #f4f4f5;">Aktivasi Akun Kandidat Baru</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Masa Berlaku</td>
                                    <td style="padding: 10px 14px; color: #18181b; font-weight: 500; border-bottom: 1px solid #f4f4f5;">10 Menit sejak dikirimkan</td>
                                </tr>

                            </table>

                            <!-- Direct Link Action -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                                <tr>
                                    <td>
                                        <a href="{{ url('/verify-otp') }}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 6px; text-decoration: none; letter-spacing: -0.01em;">
                                            Buka Halaman Verifikasi &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="border-top: 1px solid #f4f4f5; padding-top: 20px;">
                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; line-height: 1.6;">
                                    <strong>Peringatan Keamanan:</strong> Jangan berikan kode ini kepada pihak mana pun. Tim {{ config('app.name', 'Citalent') }} tidak pernah meminta kode OTP melalui telepon, WhatsApp, atau pesan pribadi.
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                                    Jika Anda tidak merasa melakukan pendaftaran di portal ini, silakan abaikan pesan ini. Akun tidak akan aktif tanpa konfirmasi kode di atas.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Subtle Letterhead Signoff -->
                    <tr>
                        <td style="padding: 0 32px 24px 32px;">
                            <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                                Hormat kami,<br>
                                <strong style="color: #27272a;">Divisi Human Capital &amp; Talent Acquisition</strong><br>
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
                                        Email ini dikirimkan secara otomatis oleh sistem rekrutmen resmi {{ config('app.name', 'Citalent') }}. Mohon tidak membalas pesan ini secara langsung.
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
