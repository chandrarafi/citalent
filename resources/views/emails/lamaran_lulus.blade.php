<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    @php
    $posisi = $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'Posisi Rekrutmen');
    $isAccepted = ($status === 'accepted');

    // Logo embedding logic (works with queued mail via CID embed & local browser preview)
    $logoPath = public_path('assets/images/logo-red-1.png');
    if (isset($message) && is_object($message) && method_exists($message, 'embed') && file_exists($logoPath)) {
    $logoSrc = $message->embed($logoPath);
    } elseif (file_exists($logoPath)) {
    $logoSrc = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
    } else {
    $logoSrc = asset('assets/images/logo-red-1.png');
    }
    @endphp
    <title>{{ $isAccepted ? 'Selamat! Anda Diterima Bekerja' : 'Pemberitahuan Lolos Seleksi' }} — {{ config('app.name', 'Citalent') }}</title>
    <style type="text/css">
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
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
                                        <span style="display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 700; color: #15803d; background-color: #dcfce7; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                                            &#10003; Lolos Seleksi
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
                            <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #09090b; letter-spacing: -0.02em; line-height: 1.3;">
                                @if($isAccepted)
                                Selamat! Anda Dinyatakan Lulus &amp; Diterima Bekerja 🎉
                                @else
                                Selamat! Anda Dinyatakan Lolos ke Tahap Selanjutnya
                                @endif
                            </h1>

                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                                Kepada Yth. <strong>{{ $pelamar->nama_lengkap }}</strong>,
                            </p>

                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 1.6;">
                                Terima kasih atas partisipasi dan antusiasme Saudara/i dalam mengikuti proses seleksi penerimaan karyawan untuk posisi <strong>{{ $posisi }}</strong> di <strong>{{ config('app.name', 'PT. Menara Agung') }}</strong>.
                                Berdasarkan evaluasi kualifikasi dan hasil penilaian tim seleksi, kami dengan senang hati menginformasikan bahwa Saudara/i dinyatakan <strong>LULUS / LOLOS</strong>.
                            </p>

                            <!-- Highlight Announcement Box (Clean, no lines) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #ecfdf5; border-radius: 12px;">
                                <tr>
                                    <td style="padding: 22px 24px;">
                                        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d; margin-bottom: 6px;">
                                            Hasil Evaluasi
                                        </div>
                                        <div style="font-size: 18px; font-weight: 800; color: #166534; margin-bottom: 8px;">
                                            @if($isAccepted)
                                            RESMI DITERIMA BEKERJA (ACCEPTED)
                                            @else
                                            LOLOS KE TAHAP {{ strtoupper($statusLabel ?? 'SELANJUTNYA') }}
                                            @endif
                                        </div>
                                        <div style="font-size: 13px; color: #14532d; line-height: 1.6;">
                                            @if($isAccepted)
                                            Selamat atas pencapaian gemilang Saudara/i! Anda telah berhasil menyelesaikan seluruh rangkaian tahapan seleksi dan resmi terpilih untuk bergabung dengan kami. Tim Human Capital kami akan segera menghubungi Anda untuk pembahasan penawaran resmi (<em>offering letter</em>) dan penandatanganan kontrak kerja.
                                            @else
                                            Kualifikasi dan kompetensi Saudara/i memenuhi standar kriteria yang kami tetapkan. Anda berhak melanjutkan ke tahapan seleksi <strong>{{ $statusLabel ?? 'berikutnya' }}</strong>. Mohon perhatikan petunjuk dan persiapan yang tertera di bawah ini.
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Details Table (Clean, no lines) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; background-color: #f8fafc; border-radius: 12px; font-size: 13px;">
                                <tr>
                                    <td style="padding: 14px 18px 8px 18px; color: #71717a; width: 40%;">No. Registrasi / Pendaftaran</td>
                                    <td style="padding: 14px 18px 8px 18px; color: #18181b; font-weight: 600; font-family: ui-monospace, Menlo, Consolas, monospace;">
                                        {{ $pelamar->no_pendaftaran }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 18px; color: #71717a;">Posisi yang Dilamar</td>
                                    <td style="padding: 8px 18px; color: #18181b; font-weight: 600;">
                                        {{ $posisi }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 18px; color: #71717a;">Status Keputusan</td>
                                    <td style="padding: 8px 18px; color: #15803d; font-weight: 700;">
                                        &#10003; LULUS / LOLOS SELEKSI
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 18px {{ (isset($schedule) && $schedule) ? '8px' : '14px' }} 18px; color: #71717a;">Tahapan Lanjutan</td>
                                    <td style="padding: 8px 18px {{ (isset($schedule) && $schedule) ? '8px' : '14px' }} 18px; color: #18181b; font-weight: 600;">
                                        {{ $statusLabel ?? 'Tahap Berikutnya' }}
                                    </td>
                                </tr>

                                @if(isset($schedule) && $schedule)
                                <tr>
                                    <td style="padding: 8px 18px; color: #71717a;">Tanggal Interview</td>
                                    <td style="padding: 8px 18px; color: #18181b; font-weight: 600;">
                                        {{ \Carbon\Carbon::parse($schedule->tanggal_interview)->locale('id')->isoFormat('dddd, D MMMM Y') }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 18px; color: #71717a;">Waktu / Jam</td>
                                    <td style="padding: 8px 18px; color: #18181b; font-weight: 600;">
                                        {{ $schedule->jam_mulai }} WIB{{ $schedule->jam_selesai ? ' s/d ' . $schedule->jam_selesai . ' WIB' : '' }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 18px; color: #71717a;">Metode Wawancara</td>
                                    <td style="padding: 8px 18px; color: #18181b; font-weight: 600;">
                                        {{ $schedule->tipe_interview === 'online' ? 'Online Video Call (Google Meet / Zoom)' : 'Tatap Muka (Offline)' }}
                                    </td>
                                </tr>
                                @if($schedule->tipe_interview === 'offline' && !empty($schedule->lokasi))
                                <tr>
                                    <td style="padding: 8px 18px {{ empty($schedule->pewawancara_nama) ? '14px' : '8px' }} 18px; color: #71717a;">Lokasi Wawancara</td>
                                    <td style="padding: 8px 18px {{ empty($schedule->pewawancara_nama) ? '14px' : '8px' }} 18px; color: #18181b; font-weight: 600;">
                                        {{ $schedule->lokasi }}
                                    </td>
                                </tr>
                                @endif
                                @if($schedule->tipe_interview === 'online' && !empty($schedule->link_meeting))
                                <tr>
                                    <td style="padding: 8px 18px {{ empty($schedule->pewawancara_nama) ? '14px' : '8px' }} 18px; color: #71717a;">Link Google Meet / Zoom</td>
                                    <td style="padding: 8px 18px {{ empty($schedule->pewawancara_nama) ? '14px' : '8px' }} 18px; color: #0284c7; font-weight: 600; word-break: break-all;">
                                        <a href="{{ $schedule->link_meeting }}" target="_blank" style="color: #0284c7; text-decoration: underline;">{{ $schedule->link_meeting }}</a>
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($schedule->pewawancara_nama))
                                <tr>
                                    <td style="padding: 8px 18px 14px 18px; color: #71717a;">Pewawancara</td>
                                    <td style="padding: 8px 18px 14px 18px; color: #18181b; font-weight: 600;">
                                        {{ $schedule->pewawancara_nama }}
                                    </td>
                                </tr>
                                @endif
                                @endif
                            </table>

                            @if(isset($schedule) && $schedule && $schedule->tipe_interview === 'online' && !empty($schedule->link_meeting))
                            <!-- Tombol Masuk Online Meeting -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td>
                                        <a href="{{ $schedule->link_meeting }}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; letter-spacing: -0.01em;">
                                            Masuk ke Ruang Video Call &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            @if(isset($schedule) && $schedule && !empty($schedule->catatan_untuk_kandidat))
                            <!-- Catatan Khusus Wawancara (Clean & Borderless) -->
                            <div style="margin: 0 0 24px 0; background-color: #f1f5f9; border-radius: 12px; padding: 18px 20px;">
                                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; margin-bottom: 6px;">
                                    Petunjuk &amp; Persiapan Wawancara
                                </div>
                                <div style="font-size: 13px; color: #1e293b; line-height: 1.6;">
                                    {!! nl2br(e($schedule->catatan_untuk_kandidat)) !!}
                                </div>
                            </div>
                            @endif

                            @if(!empty($catatan))
                            <!-- Recruiter Note Box (Clean, no lines) -->
                            <div style="margin: 0 0 24px 0; background-color: #f0f9ff; border-radius: 12px; padding: 18px 20px;">
                                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0284c7; margin-bottom: 6px;">
                                    Catatan / Instruksi dari Tim Rekrutmen
                                </div>
                                <div style="font-size: 13px; color: #0f172a; line-height: 1.6;">
                                    {!! nl2br(e($catatan)) !!}
                                </div>
                            </div>
                            @endif

                            <!-- Next Steps Guide (Clean, no lines) -->
                            <div style="margin: 0 0 24px 0; background-color: #f8fafc; border-radius: 12px; padding: 18px 20px;">
                                <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
                                    📌 Langkah Selanjutnya yang Perlu Diperhatikan:
                                </div>
                                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.65;">
                                    <li style="margin-bottom: 4px;">Pastikan nomor telepon/WhatsApp dan alamat email Anda aktif untuk menerima undangan jadwal resmi.</li>
                                    <li style="margin-bottom: 4px;">Siapkan dokumen pendukung (KTP, Ijazah/Transkrip, Portofolio, atau berkas relevan lainnya).</li>
                                    <li>Anda dapat memantau status perkembangan serta jadwal seleksi langsung melalui portal kandidat.</li>
                                </ul>
                            </div>

                            <!-- Direct Link Action CTA -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                                <tr>
                                    <td>
                                        <a href="{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; letter-spacing: -0.01em;">
                                            Buka Portal Rekrutmen &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="padding-top: 12px;">
                                <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.6;">
                                    Apabila Anda memiliki pertanyaan terkait tahapan seleksi ini, silakan hubungi tim rekrutmen kami melalui portal karir atau membalas email ini.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- Letterhead Signoff -->
                    <tr>
                        <td style="padding: 0 32px 24px 32px;">
                            <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                                Salam sukses,<br>
                                <strong style="color: #27272a;">Tim Human Capital &amp; Talent Acquisition</strong><br>
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