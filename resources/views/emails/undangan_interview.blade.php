<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isReminder ? 'Pengingat Jadwal Wawancara Kerja' : 'Undangan Wawancara Kerja' }}</title>
</head>

<body style="margin: 0; padding: 20px; background-color: #f9f9f9; font-family: Arial, Helvetica, sans-serif; color: #222222; font-size: 14px; line-height: 1.6;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 4px; padding: 30px;">
        <!-- Kop Perusahaan -->
        <tr>
            <td style="border-bottom: 2px solid #333333; padding-bottom: 15px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <div style="font-size: 18px; font-weight: bold; color: #111111; text-transform: uppercase; letter-spacing: 0.5px;">
                                PT. Menara Agung
                            </div>
                            <div style="font-size: 12px; color: #666666; margin-top: 2px;">
                                Divisi Human Capital &amp; Recruitment
                            </div>
                        </td>
                        <td align="right" style="font-size: 12px; color: #666666; vertical-align: bottom;">
                            {{ date('d F Y') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Isi Surat -->
        <tr>
            <td style="padding-top: 25px;">
                <p style="margin: 0 0 15px 0;">
                    Kepada Yth.<br>
                    <strong>Sdr/Sdri. {{ $pelamar->nama_lengkap }}</strong><br>
                    <span style="color: #666666; font-size: 13px;">No. Pendaftaran: {{ $pelamar->no_pendaftaran }}</span>
                </p>

                <p style="margin: 0 0 15px 0;">
                    Dengan hormat,
                </p>

                <p style="margin: 0 0 15px 0; text-align: justify;">
                    @if ($isReminder)
                    Sehubungan dengan proses rekrutmen untuk posisi <strong>{{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'yang dilamar') }}</strong>, kami menyampaikan pengingat jadwal wawancara kerja yang akan diselenggarakan sebagai berikut:
                    @else
                    Sehubungan dengan lamaran pekerjaan yang Saudara/i ajukan untuk posisi <strong>{{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'yang dilamar') }}</strong>, bersama ini kami mengundang Saudara/i untuk menghadiri tahapan <strong>{{ $schedule->tahap_label }}</strong> yang akan diselenggarakan pada:
                    @endif
                </p>

                <!-- Tabel Rincian Jadwal -->
                <table width="100%" border="0" cellpadding="6" cellspacing="0" style="margin: 15px 0 20px 0; background-color: #fafafa; border: 1px solid #e5e5e5; font-size: 13px;">
                    <tr>
                        <td width="30%" style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Tahap</td>
                        <td width="70%" style="border-bottom: 1px solid #eeeeee; color: #111111;">: {{ $schedule->tahap_label }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Hari, Tanggal</td>
                        <td style="border-bottom: 1px solid #eeeeee; color: #111111;">: {{ \Carbon\Carbon::parse($schedule->tanggal_interview)->locale('id')->isoFormat('dddd, D MMMM Y') }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Waktu</td>
                        <td style="border-bottom: 1px solid #eeeeee; color: #111111;">
                            : {{ $schedule->jam_mulai }} WIB
                            @if ($schedule->jam_selesai)
                            s/d {{ $schedule->jam_selesai }} WIB
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Metode</td>
                        <td style="border-bottom: 1px solid #eeeeee; color: #111111;">
                            : {{ $schedule->tipe_interview === 'online' ? 'Online (Video Conference)' : 'Tatap Muka (Offline)' }}
                        </td>
                    </tr>
                    @if ($schedule->tipe_interview === 'offline' && $schedule->lokasi)
                    <tr>
                        <td style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Lokasi / Ruangan</td>
                        <td style="border-bottom: 1px solid #eeeeee; color: #111111;">: {{ $schedule->lokasi }}</td>
                    </tr>
                    @endif
                    @if ($schedule->tipe_interview === 'online' && $schedule->link_meeting)
                    <tr>
                        <td style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Tautan Meeting</td>
                        <td style="border-bottom: 1px solid #eeeeee; color: #111111;">
                            : <a href="{{ $schedule->link_meeting }}" target="_blank" style="color: #0056b3;">{{ $schedule->link_meeting }}</a>
                        </td>
                    </tr>
                    @endif
                </table>

                @if ($schedule->tipe_interview === 'online' && $schedule->link_meeting)
                <div style="margin: 15px 0;">
                    <a href="{{ $schedule->link_meeting }}" target="_blank" style="display: inline-block; background-color: #1a56db; color: #ffffff; text-decoration: none; padding: 9px 18px; font-size: 13px; font-weight: bold; border-radius: 3px;">
                        Masuk ke Sesi Wawancara Online
                    </a>
                </div>
                @endif

                @if ($schedule->catatan_untuk_kandidat)
                <p style="margin: 15px 0 10px 0; font-weight: bold; color: #333333;">Catatan / Petunjuk:</p>
                <div style="background-color: #fdfdfd; border-left: 3px solid #666666; padding: 10px 14px; margin-bottom: 15px; font-size: 13px; color: #444444;">
                    {!! nl2br(e($schedule->catatan_untuk_kandidat)) !!}
                </div>
                @else
                <p style="margin: 15px 0 10px 0; font-weight: bold; color: #333333;">Ketentuan:</p>
                <ul style="margin: 0 0 15px 0; padding-left: 20px; font-size: 13px; color: #444444;">
                    <li>Hadir atau bersiap setidaknya 10 menit sebelum waktu wawancara dimulai.</li>
                    <li>Mengenakan pakaian kerja formal dan rapi.</li>
                    @if ($schedule->tipe_interview === 'online')
                    <li>Memastikan perangkat kamera, mikrofon, dan koneksi internet dalam kondisi stabil.</li>
                    @endif
                </ul>
                @endif

                <p style="margin: 0 0 15px 0; text-align: justify;">
                    Saudara/i dapat melihat riwayat dan perkembangan proses lamaran melalui portal rekrutmen: <a href="{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}" target="_blank" style="color: #0056b3;">{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}</a>
                </p>

                <p style="margin: 0 0 20px 0; text-align: justify;">
                    Demikian surat pemberitahuan ini kami sampaikan. Apabila terdapat hal yang perlu dikonfirmasi, Saudara/i dapat membalas email ini secara langsung. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
                </p>

                <!-- Tanda Tangan Formal -->
                <p style="margin: 25px 0 0 0; font-size: 13px;">
                    Hormat kami,<br>
                    <strong>Tim Rekrutmen &amp; SDM</strong><br>
                    {{ config('app.name', 'PT. Menara Agung') }}
                </p>
            </td>
        </tr>

        <!-- Footer Kerahasiaan -->
        <tr>
            <td style="border-top: 1px solid #e5e5e5; margin-top: 25px; padding-top: 15px; font-size: 11px; color: #888888; text-align: center;">
                Email ini dikirim secara otomatis oleh Sistem Rekrutmen {{ config('app.name', 'PT. Menara Agung') }}. Dokumen ini bersifat rahasia dan ditujukan khusus untuk penerima yang tertera di atas.
            </td>
        </tr>
    </table>
</body>

</html>