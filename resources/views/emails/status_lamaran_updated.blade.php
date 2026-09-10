<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pemberitahuan Status Seleksi Rekrutmen</title>
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
                                {{ config('app.name', 'PT. Menara Agung') }}
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
                    Terima kasih atas partisipasi dan minat Saudara/i dalam mengikuti rangkaian proses seleksi penerimaan karyawan untuk posisi <strong>{{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? 'yang dilamar') }}</strong> di {{ config('app.name', 'PT. Menara Agung') }}.
                </p>

                <table width="100%" border="0" cellpadding="6" cellspacing="0" style="margin: 15px 0 20px 0; background-color: #fafafa; border: 1px solid #e5e5e5; font-size: 13px;">
                    <tr>
                        <td width="30%" style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">No. Pendaftaran</td>
                        <td width="70%" style="border-bottom: 1px solid #eeeeee; color: #111111;">: {{ $pelamar->no_pendaftaran }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Posisi yang Dilamar</td>
                        <td style="border-bottom: 1px solid #eeeeee; color: #111111;">: {{ $pelamar->posisi_dilamar ?: ($pelamar->lowongan?->judul ?? '-') }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; color: #444444; border-bottom: 1px solid #eeeeee;">Status Perkembangan</td>
                        <td style="border-bottom: 1px solid #eeeeee; font-weight: bold; color: #111111;">
                            : {{ $statusLabel }}
                        </td>
                    </tr>
                </table>

                @if($status === 'rejected')
                <p style="margin: 0 0 15px 0; text-align: justify;">
                    Berdasarkan hasil evaluasi kualifikasi pada tahapan seleksi, bersama ini kami sampaikan bahwa saat ini kami belum dapat melanjutkan lamaran Saudara/i ke tahapan berikutnya.
                </p>
                <p style="margin: 0 0 15px 0; text-align: justify;">
                    Data Saudara/i akan tetap tersimpan dalam basis data talent pool kami untuk pertimbangan posisi lain yang sesuai di masa mendatang. Kami menyampaikan apresiasi yang setinggi-tingginya atas waktu dan usaha yang telah Saudara/i berikan.
                </p>
                @elseif($status === 'accepted')
                <p style="margin: 0 0 15px 0; text-align: justify;">
                    Selamat, Saudara/i dinyatakan <strong>Diterima Bekerja</strong> di {{ config('app.name', 'PT. Menara Agung') }}. Tim HR kami akan segera menghubungi Saudara/i terkait penandatanganan offering letter dan perjanjian kerja.
                </p>
                @else
                <p style="margin: 0 0 15px 0; text-align: justify;">
                    Lamaran Saudara/i telah diperbarui ke tahapan: <strong>{{ $statusLabel }}</strong>. Rincian dan jadwal lebih lanjut akan disampaikan secara berkala melalui sistem dan email ini.
                </p>
                @endif

                @if(!empty($catatan))
                <p style="margin: 15px 0 6px 0; font-weight: bold; color: #333333;">Catatan dari Tim Rekrutmen:</p>
                <div style="background-color: #fdfdfd; border-left: 3px solid #666666; padding: 10px 14px; margin-bottom: 15px; font-size: 13px; color: #444444;">
                    {!! nl2br(e($catatan)) !!}
                </div>
                @endif

                <p style="margin: 15px 0 15px 0; text-align: justify;">
                    Saudara/i dapat memantau rincian proses seleksi melalui portal: <a href="{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}" target="_blank" style="color: #0056b3;">{{ url('/kandidat/lamaran/' . $pelamar->no_pendaftaran) }}</a>
                </p>

                <p style="margin: 0 0 20px 0; text-align: justify;">
                    Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
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