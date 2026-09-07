<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP Verifikasi</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 24px 12px;
        }
        .container {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: #0f172a;
            padding: 28px 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            color: #94a3b8;
            margin: 6px 0 0 0;
            font-size: 13px;
        }
        .content {
            padding: 32px 28px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .text {
            font-size: 14px;
            color: #475569;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .otp-wrapper {
            background: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0284c7;
            font-family: monospace, Courier, monospace;
        }
        .note {
            font-size: 12px;
            color: #64748b;
            line-height: 1.5;
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 10px 14px;
            border-radius: 6px;
            margin-top: 20px;
        }
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 16px 24px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ config('app.name', 'Citalent') }}</h1>
            <p>Portal Rekrutmen & Karir</p>
        </div>
        <div class="content">
            <div class="greeting">Halo, {{ $name }}!</div>
            <p class="text">
                Terima kasih telah mendaftar sebagai kandidat di <strong>{{ config('app.name', 'Citalent') }}</strong>. Untuk menyelesaikan pembuatan akun Anda, silakan masukkan kode One-Time Password (OTP) berikut pada halaman verifikasi:
            </p>

            <div class="otp-wrapper">
                <div class="otp-label">Kode Verifikasi OTP</div>
                <div class="otp-code">{{ $otp }}</div>
            </div>

            <div class="note">
                ⏱️ Kode OTP ini hanya berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun demi keamanan akun Anda.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name', 'Citalent') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
