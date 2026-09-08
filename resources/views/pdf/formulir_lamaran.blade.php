<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Formulir Lamaran Kerja - {{ $formulir?->nama_lengkap ?? $pelamar->nama_lengkap }}</title>
    <style>
        @page {
            margin: 12mm 14mm 12mm 14mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Calibri', 'Carlito', 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 9.5pt;
            line-height: 1.35;
            color: #000000;
            margin: 0;
            padding: 0;
        }

        .header-table {
            width: 100%;
            padding-bottom: 4px;
            margin-bottom: 4px;
        }

        .company-name {
            font-size: 13pt;
            font-weight: bold;
            color: #000000;
            letter-spacing: 0.5px;
        }

        .doc-title {
            font-size: 11.5pt;
            font-weight: bold;
            color: #000000;
            margin-top: 2px;
        }

        .sub-header {
            font-size: 8.5pt;
            color: #000000;
            margin-top: 3px;
        }

        .sub-header .val {
            color: #000000;
            font-weight: normal;
        }

        .photo-box {
            width: 80px;
            height: 105px;
            border: 1px solid #000000;
            text-align: center;
            vertical-align: middle;
            background-color: #f8fafc;
            overflow: hidden;
        }

        .photo-img {
            width: 80px;
            height: 105px;
            object-fit: cover;
        }

        .photo-placeholder {
            font-size: 7.5pt;
            color: #555555;
            font-weight: normal;
            line-height: 1.2;
        }

        .instruction-banner {
            font-size: 7.5pt;
            font-weight: bold;
            color: #000000;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .section-title {
            font-size: 9.5pt;
            font-weight: bold;
            color: #000000;
            border-bottom: 1.5px solid #000000;
            padding-bottom: 2px;
            margin-top: 10px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            table-layout: fixed;
        }

        .grid-table td {
            padding: 3px 0;
            vertical-align: middle;
            font-size: 8.5pt;
            color: #000000;
        }

        .col-label-1 {
            width: 20%;
            color: #000000;
            font-weight: normal;
        }

        .col-colon-1 {
            width: 2%;
            text-align: center;
            color: #000000;
        }

        .col-val-1 {
            width: 28%;
            color: #000000;
            font-weight: normal;
            padding-right: 14px;
        }

        .col-label-2 {
            width: 20%;
            color: #000000;
            font-weight: normal;
        }

        .col-colon-2 {
            width: 2%;
            text-align: center;
            color: #000000;
        }

        .col-val-2 {
            width: 28%;
            color: #000000;
            font-weight: normal;
        }

        .col-val-full {
            color: #000000;
            font-weight: normal;
            vertical-align: middle;
        }

        .grid-single-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            table-layout: fixed;
        }

        .grid-single-table td {
            padding: 3px 0;
            vertical-align: middle;
            font-size: 8.5pt;
            color: #000000;
        }

        .single-label {
            width: 40%;
            color: #000000;
            font-weight: normal;
        }

        .single-colon {
            width: 2%;
            text-align: center;
            color: #000000;
        }

        .single-value {
            width: 58%;
            color: #000000;
            font-weight: normal;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 6px;
            font-size: 8pt;
            border: 1px solid #000000;
        }

        .data-table th {
            background-color: #f1f5f9;
            color: #000000;
            font-weight: bold;
            border: 1px solid #000000;
            padding: 4px 5px;
            text-align: left;
        }

        .data-table td {
            border: 1px solid #000000;
            padding: 3.5px 5px;
            vertical-align: middle;
            color: #000000;
            font-weight: normal;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-muted {
            color: #000000;
        }

        .italic-box {
            background-color: #f8fafc;
            border: 1px solid #000000;
            border-radius: 4px;
            padding: 4px 6px;
            font-style: italic;
            color: #000000;
            font-size: 8pt;
            margin-top: 2px;
            margin-bottom: 5px;
        }

        .q-label {
            font-size: 8.5pt;
            font-weight: normal;
            color: #000000;
            margin-top: 4px;
            margin-bottom: 2px;
        }

        .avoid-break {
            page-break-inside: avoid;
        }

        .page-break {
            page-break-after: always;
        }

        .signature-table {
            width: 100%;
            margin-top: 14px;
            border-collapse: collapse;
            color: #000000;
        }

        .signature-box {
            width: 220px;
            text-align: center;
            font-size: 8.5pt;
            color: #000000;
        }
    </style>
</head>

<body>

    <!-- Header Section -->
    <table class="header-table">
        <tr>
            <td style="vertical-align: middle;">
                <div class="company-name">PT. MENARA AGUNG</div>
                <div class="doc-title">FORMULIR LAMARAN KERJA</div>
                <div class="sub-header">
                    No. Lamaran: <span class="val">{{ $formulir?->no_lamaran ?? $pelamar->no_pendaftaran }}</span> &bull;
                    Posisi: <span class="val">{{ $pelamar->posisi_dilamar }}</span>
                </div>
            </td>
            <td style="width: 85px; text-align: right; vertical-align: middle;">
                <div class="photo-box">
                    @if(!empty($fotoBase64))
                    <img src="{{ $fotoBase64 }}" class="photo-img" alt="Pas Foto">
                    @else
                    <div class="photo-placeholder" style="padding-top: 38px;">Pas Foto<br>3 x 4</div>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- 1. IDENTITAS -->
    <div class="avoid-break">
        <div class="section-title">1. Identitas Pelamar</div>
        <table class="grid-table">
            <colgroup>
                <col style="width: 20%;">
                <col style="width: 2%;">
                <col style="width: 28%;">
                <col style="width: 20%;">
                <col style="width: 2%;">
                <col style="width: 28%;">
            </colgroup>
            <tbody>
                <tr>
                    <td class="col-label-1">Nama Lengkap *)</td>
                    <td class="col-colon-1">:</td>
                    <td class="col-val-1">{{ $formulir?->nama_lengkap ?? $pelamar->nama_lengkap }}</td>
                    <td class="col-label-2">Agama</td>
                    <td class="col-colon-2">:</td>
                    <td class="col-val-2">{{ $formulir?->agama ?? ($pelamar->agama ?? '-') }}</td>
                </tr>
                <tr>
                    <td class="col-label-1">Tempat / Tgl Lahir</td>
                    <td class="col-colon-1">:</td>
                    <td class="col-val-1">
                        {{ $formulir?->tempat_lahir ?? ($pelamar->tempat_lahir ?? '-') }},
                        {{ $formulir?->tanggal_lahir ? $formulir->tanggal_lahir->format('d/m/Y') : ($pelamar->tanggal_lahir ? $pelamar->tanggal_lahir->format('d/m/Y') : '-') }}
                    </td>
                    <td class="col-label-2">Kewarganegaraan</td>
                    <td class="col-colon-2">:</td>
                    <td class="col-val-2">{{ $formulir?->kewarganegaraan ?? 'Indonesia' }}</td>
                </tr>
                <tr>
                    <td class="col-label-1">No. KTP / SIM</td>
                    <td class="col-colon-1">:</td>
                    <td class="col-val-1">{{ $formulir?->no_ktp_sim ?? '-' }}</td>
                    <td class="col-label-2">Status Pernikahan</td>
                    <td class="col-colon-2">:</td>
                    <td class="col-val-2">{{ $formulir?->status_pernikahan ?? ($pelamar->status_pernikahan ?? '-') }} {{ $formulir?->status_pernikahan_sejak ? '(Sejak ' . $formulir->status_pernikahan_sejak->format('d/m/Y') . ')' : '' }}</td>
                </tr>
                <tr>
                    <td class="col-label-1">No. Telp / HP</td>
                    <td class="col-colon-1">:</td>
                    <td class="col-val-1">
                        {{ $formulir?->hp_padang ?? ($formulir?->telp_padang ?? ($pelamar->nomor_kontak ?? '-')) }}
                    </td>
                    <td class="col-label-2">Telp. Luar Padang</td>
                    <td class="col-colon-2">:</td>
                    <td class="col-val-2">
                        {{ $formulir?->telp_luar_padang ?? ($formulir?->telp_padang && $formulir?->telp_padang !== $formulir?->hp_padang ? $formulir->telp_padang : '-') }}
                    </td>
                </tr>
                <tr>
                    <td class="col-label-1">Alamat di Padang</td>
                    <td class="col-colon-1">:</td>
                    <td colspan="4" class="col-val-full">
                        {{ $formulir?->alamat_padang ?? ($pelamar->alamat ?? '-') }}
                    </td>
                </tr>
                @if(!empty($formulir?->alamat_luar_padang))
                <tr>
                    <td class="col-label-1">Alamat Luar Padang</td>
                    <td class="col-colon-1">:</td>
                    <td colspan="4" class="col-val-full">
                        {{ $formulir->alamat_luar_padang }}
                    </td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <!-- 2. PENDIDIKAN -->
    <div class="avoid-break" style="margin-top: 4px;">
        <div class="section-title">2. Riwayat Pendidikan</div>
        <div class="q-label">1. Pendidikan Formal</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 14%;">Jenjang</th>
                    <th style="width: 32%;">Nama Sekolah / Perguruan Tinggi</th>
                    <th style="width: 24%;">Jurusan</th>
                    <th style="width: 15%;">Tempat</th>
                    <th style="width: 15%;">Tahun Lulus</th>
                </tr>
            </thead>
            <tbody>
                @forelse(($formulir?->pendidikan_formal ?? []) as $pf)
                <tr>
                    <td>{{ $pf['jenjang'] ?? '-' }}</td>
                    <td>{{ $pf['nama_sekolah'] ?? '-' }}</td>
                    <td>{{ $pf['jurusan'] ?? '-' }}</td>
                    <td>{{ $pf['tempat'] ?? '-' }}</td>
                    <td>{{ $pf['tahun'] ?? '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="text-center text-muted">Tidak ada data</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        @if(!empty($formulir?->alasan_pilih_jurusan))
        <div class="q-label">2. Alasan memilih jurusan tersebut di Perguruan Tinggi :</div>
        <div class="italic-box">{{ $formulir->alasan_pilih_jurusan }}</div>
        @endif

        @if(!empty($formulir?->karya_ilmiah))
        <div class="q-label">3. Karya Ilmiah yang pernah dibuat (skripsi, artikel, tugas akhir, dll) :</div>
        <div class="italic-box">{{ $formulir->karya_ilmiah }}</div>
        @endif

        @if(!empty($formulir?->pendidikan_non_formal) && count(array_filter($formulir->pendidikan_non_formal, fn($k) => !empty($k['nama_kursus']))))
        <div class="q-label">4. Pendidikan Non Formal / Kursus :</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;" class="text-center">No</th>
                    <th style="width: 40%;">Nama Kursus / Pelatihan</th>
                    <th style="width: 25%;">Tempat</th>
                    <th style="width: 15%;">Tahun</th>
                    <th style="width: 15%;">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($formulir->pendidikan_non_formal as $idx => $kursus)
                @if(!empty($kursus['nama_kursus']))
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $kursus['nama_kursus'] }}</td>
                    <td>{{ $kursus['tempat'] ?? '-' }}</td>
                    <td>{{ $kursus['tahun'] ?? '-' }}</td>
                    <td>{{ $kursus['ket'] ?? '-' }}</td>
                </tr>
                @endif
                @endforeach
            </tbody>
        </table>
        @endif

        @if(!empty($formulir?->bahasa_asing))
        <div class="q-label">5. Kemampuan Bahasa :</div>
        <table class="data-table" style="width: 65%;">
            <thead>
                <tr>
                    <th style="width: 50%;">Bahasa</th>
                    <th style="width: 25%;" class="text-center">Lisan</th>
                    <th style="width: 25%;" class="text-center">Tertulis</th>
                </tr>
            </thead>
            <tbody>
                @foreach($formulir->bahasa_asing as $bhs)
                <tr>
                    <td>{{ $bhs['bahasa'] ?? '-' }}</td>
                    <td class="text-center">{{ $bhs['lisan'] ?? '-' }}</td>
                    <td class="text-center">{{ $bhs['tertulis'] ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- 3. LINGKUNGAN KELUARGA -->
    <div class="avoid-break" style="margin-top: 6px;">
        <div class="section-title">3. Lingkungan Keluarga</div>

        @if(!empty($formulir?->keluarga_inti) && count(array_filter($formulir->keluarga_inti, fn($k) => !empty($k['nama']))))
        <div class="q-label">1. Susunan Keluarga Inti (Suami / Istri & Anak)</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Hubungan</th>
                    <th style="width: 25%;">Nama</th>
                    <th style="width: 8%;" class="text-center">L/P</th>
                    <th style="width: 22%;">Tempat/Tgl Lahir</th>
                    <th style="width: 15%;">Pendidikan</th>
                    <th style="width: 15%;">Pekerjaan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($formulir->keluarga_inti as $ki)
                @if(!empty($ki['nama']))
                <tr>
                    <td>{{ $ki['status'] ?? '-' }}</td>
                    <td>{{ $ki['nama'] }}</td>
                    <td class="text-center">{{ $ki['jenis_kelamin'] ?? '-' }}</td>
                    <td>{{ $ki['tempat_tgl_lahir'] ?? '-' }}</td>
                    <td>{{ $ki['pendidikan'] ?? '-' }}</td>
                    <td>{{ $ki['pekerjaan'] ?? '-' }}</td>
                </tr>
                @endif
                @endforeach
            </tbody>
        </table>
        @endif

        <div class="q-label">2. Susunan Keluarga (Orang Tua & Saudara Kandung termasuk Pelamar)</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Hubungan</th>
                    <th style="width: 25%;">Nama</th>
                    <th style="width: 8%;" class="text-center">L/P</th>
                    <th style="width: 22%;">Tempat/Tgl Lahir</th>
                    <th style="width: 15%;">Pendidikan</th>
                    <th style="width: 15%;">Pekerjaan</th>
                </tr>
            </thead>
            <tbody>
                @forelse(($formulir?->susunan_keluarga ?? []) as $sk)
                @if(!empty($sk['nama']))
                <tr>
                    <td>{{ $sk['status'] ?? '-' }}</td>
                    <td>{{ $sk['nama'] }}</td>
                    <td class="text-center">{{ $sk['jenis_kelamin'] ?? '-' }}</td>
                    <td>{{ $sk['tempat_tgl_lahir'] ?? '-' }}</td>
                    <td>{{ $sk['pendidikan'] ?? '-' }}</td>
                    <td>{{ $sk['pekerjaan'] ?? '-' }}</td>
                </tr>
                @endif
                @empty
                <tr>
                    <td colspan="6" class="text-center text-muted">Tidak ada data</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- 4. PENGALAMAN KERJA -->
    <div class="avoid-break" style="margin-top: 6px;">
        <div class="section-title">4. Riwayat Pengalaman Kerja</div>
        @if(!empty($formulir?->pengalaman_kerja) && count(array_filter($formulir->pengalaman_kerja, fn($p) => !empty($p['nama_perusahaan']))))
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 16%;">Periode</th>
                    <th style="width: 24%;">Nama Perusahaan</th>
                    <th style="width: 15%;">Jabatan Awal</th>
                    <th style="width: 15%;">Jabatan Akhir</th>
                    <th style="width: 15%;">Gaji Terakhir</th>
                    <th style="width: 15%;">Alasan Berhenti</th>
                </tr>
            </thead>
            <tbody>
                @foreach($formulir->pengalaman_kerja as $pk)
                @if(!empty($pk['nama_perusahaan']))
                <tr>
                    <td>{{ $pk['dari_bulan_tahun'] ?? '' }} - {{ $pk['sampai_bulan_tahun'] ?? 'Sekarang' }}</td>
                    <td>{{ $pk['nama_perusahaan'] }}@if(!empty($pk['alamat_perusahaan']))<br><small class="text-muted">{{ $pk['alamat_perusahaan'] }}</small>@endif</td>
                    <td>{{ $pk['jabatan_awal'] ?? '-' }}</td>
                    <td>{{ $pk['jabatan_akhir'] ?? '-' }}</td>
                    <td>{{ $pk['gaji_terakhir'] ?? '-' }}</td>
                    <td>{{ $pk['alasan_berhenti'] ?? '-' }}</td>
                </tr>
                @endif
                @endforeach
            </tbody>
        </table>
        @else
        <p style="font-size: 8pt; color: #64748b; font-style: italic;">Belum memiliki riwayat pengalaman kerja formal (Fresh Graduate).</p>
        @endif

        @if(!empty($formulir?->gambaran_jabatan))
        <div class="q-label">Uraian singkat pekerjaan / tanggung jawab pada jabatan terakhir :</div>
        <div class="italic-box">{{ $formulir->gambaran_jabatan }}</div>
        @endif

        @if(!empty($formulir?->masalah_kerja_dan_solusi))
        <div class="q-label">Masalah penting yang pernah dihadapi dan bagaimana solusinya :</div>
        <div class="italic-box">{{ $formulir->masalah_kerja_dan_solusi }}</div>
        @endif

        @if(!empty($formulir?->kesan_perusahaan_sebelumnya))
        <div class="q-label">Kesan terhadap perusahaan tempat bekerja sebelumnya :</div>
        <div class="italic-box">{{ $formulir->kesan_perusahaan_sebelumnya }}</div>
        @endif
    </div>

    <!-- 5. MINAT & PRIBADI -->
    <div class="avoid-break" style="margin-top: 6px;">
        <div class="section-title">5. Minat & Konsep Pribadi</div>
        <table class="grid-single-table">
            <colgroup>
                <col style="width: 40%;">
                <col style="width: 2%;">
                <col style="width: 58%;">
            </colgroup>
            <tbody>
                @if(!empty($formulir?->cita_cita))
                <tr>
                    <td class="single-label">1. Cita-cita jangka panjang</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->cita_cita }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->pendorong_kerja))
                <tr>
                    <td class="single-label">2. Pendorong ingin bekerja</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->pendorong_kerja }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->alasan_melamar_perusahaan))
                <tr>
                    <td class="single-label">3. Alasan melamar ke Perusahaan</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->alasan_melamar_perusahaan }}</td>
                </tr>
                @endif
                <tr>
                    <td class="single-label">4. Gaji yang diharapkan</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir?->gaji_diharapkan ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="single-label">5. Kapan mulai bekerja</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir?->kapan_mulai_kerja ?? '-' }}</td>
                </tr>
                @if(!empty($formulir?->fasilitas_diharapkan))
                <tr>
                    <td class="single-label">6. Fasilitas lain yang diharapkan</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->fasilitas_diharapkan }}</td>
                </tr>
                @endif
                <tr>
                    <td class="single-label">7. Bersedia ditempatkan di luar daerah</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir?->bersedia_luar_daerah ?? 'Bersedia' }}</td>
                </tr>
                @if(!empty($formulir?->tipe_orang_disenangi))
                <tr>
                    <td class="single-label">8. Tipe orang yang disenangi</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->tipe_orang_disenangi }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->hal_sulit_ambil_keputusan))
                <tr>
                    <td class="single-label">9. Hal sulit mengambil keputusan</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->hal_sulit_ambil_keputusan }}</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <!-- 6. AKTIVITAS SOSIAL & LAIN-LAIN -->
    <div class="avoid-break" style="margin-top: 6px;">
        <div class="section-title">6. Aktivitas Sosial & Informasi Lain</div>

        @if(!empty($formulir?->kenalan_perusahaan) && count(array_filter($formulir->kenalan_perusahaan, fn($k) => !empty($k['nama']))))
        <div class="q-label">Kenalan di Perusahaan PT. Menara Agung :</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 35%;">Nama</th>
                    <th style="width: 35%;">Bagian / Jabatan</th>
                    <th style="width: 30%;">Hubungan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($formulir->kenalan_perusahaan as $kenalan)
                @if(!empty($kenalan['nama']))
                <tr>
                    <td>{{ $kenalan['nama'] }}</td>
                    <td>{{ $kenalan['bagian'] ?? '-' }}</td>
                    <td>{{ $kenalan['hubungan'] ?? '-' }}</td>
                </tr>
                @endif
                @endforeach
            </tbody>
        </table>
        @endif

        @if(!empty($formulir?->referensi) && count(array_filter($formulir->referensi, fn($r) => !empty($r['nama']))))
        <div class="q-label">Referensi Orang yang Dapat Dihubungi :</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 35%;">Nama</th>
                    <th style="width: 40%;">Alamat / No. Telp</th>
                    <th style="width: 25%;">Hubungan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($formulir->referensi as $ref)
                @if(!empty($ref['nama']))
                <tr>
                    <td>{{ $ref['nama'] }}</td>
                    <td>{{ $ref['alamat_telp'] ?? '-' }}</td>
                    <td>{{ $ref['hubungan'] ?? '-' }}</td>
                </tr>
                @endif
                @endforeach
            </tbody>
        </table>
        @endif

        <table class="grid-single-table" style="margin-top: 4px;">
            <colgroup>
                <col style="width: 40%;">
                <col style="width: 2%;">
                <col style="width: 58%;">
            </colgroup>
            <tbody>
                @if(!empty($formulir?->hobi))
                <tr>
                    <td class="single-label">Hobi / Kegemaran</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->hobi }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->cara_mengisi_waktu_luang))
                <tr>
                    <td class="single-label">Cara Mengisi Waktu Luang</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->cara_mengisi_waktu_luang }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->kekuatan_diri))
                <tr>
                    <td class="single-label">Kekuatan (Strong Point)</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->kekuatan_diri }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->kelemahan_diri))
                <tr>
                    <td class="single-label">Kelemahan (Weak Point)</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->kelemahan_diri }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->pernah_sakit_lama))
                <tr>
                    <td class="single-label">Pernah Sakit Lama Sembuh</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->pernah_sakit_lama }}</td>
                </tr>
                @endif
                @if(!empty($formulir?->gangguan_jasmani))
                <tr>
                    <td class="single-label">Gangguan Jasmani</td>
                    <td class="single-colon">:</td>
                    <td class="single-value">{{ $formulir->gangguan_jasmani }}</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <!-- 7. PERNYATAAN & TANDA TANGAN -->
    <div class="avoid-break" style="margin-top: 10px; border-top: 1px dashed #94a3b8; padding-top: 8px;">
        <p style="font-size: 7.5pt; text-align: justify; line-height: 1.35; color: #000000; margin-bottom: 8px;">
            Diisi dengan sesungguhnya. Apabila dikemudian hari ternyata ada hal-hal yang bertentangan, maka saya bersedia dituntut sesuai dengan hukum yang berlaku dan lamaran ini dapat dibatalkan.
        </p>

        <table class="signature-table">
            <tr>
                <td style="width: 60%;"></td>
                <td style="width: 40%; text-align: center; vertical-align: top;">
                    <div style="font-size: 8pt; margin-bottom: 45px; color: #000000;">
                        Padang, {{ $formulir?->tanggal_pernyataan ? $formulir->tanggal_pernyataan->translatedFormat('d F Y') : date('d F Y') }}<br>
                        Pemohon / Pelamar
                    </div>
                    <div style="font-size: 8.5pt; text-decoration: underline; color: #000000;">
                        ( {{ $formulir?->nama_lengkap ?? $pelamar->nama_lengkap }} )
                    </div>
                </td>
            </tr>
        </table>
    </div>

</body>

</html>