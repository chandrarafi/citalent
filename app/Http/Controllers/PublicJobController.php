<?php

namespace App\Http\Controllers;

use App\Models\Lowongan;
use App\Models\Pelamar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicJobController extends Controller
{
    /**
     * Display the public job vacancy and candidate application form.
     */
    public function show(string $slug): Response
    {
        $lowongan = Lowongan::with(['departement', 'jabatan'])
            ->where('slug', $slug)
            ->firstOrFail();

        $candidateProfile = null;
        if (Auth::check()) {
            $user = Auth::user()->load('kandidatProfile');
            $p = $user->kandidatProfile;
            $candidateProfile = [
                'nama_lengkap' => $user->name,
                'email' => $user->email,
                'nomor_kontak' => $user->phone ?? '',
                'tempat_lahir' => $p?->tempat_lahir ?? '',
                'tanggal_lahir' => $p?->tanggal_lahir?->format('Y-m-d') ?? '',
                'jenis_kelamin' => $p?->jenis_kelamin ?? '',
                'status_pernikahan' => $p?->status_pernikahan ?? '',
                'agama' => $p?->agama ?? '',
                'alamat' => $p?->alamat ?? '',
                'domisili' => $p?->domisili ?? '',
                'pendidikan_terakhir' => $p?->pendidikan_terakhir ?? '',
                'nama_institusi' => $p?->nama_institusi ?? '',
                'jurusan' => $p?->jurusan ?? '',
                'tahun_lulus' => $p?->tahun_lulus ?? '',
                'foto_url' => $p?->foto_url ?? null,
                'cv_url' => $p?->cv_url ?? null,
                'surat_lamaran_url' => $p?->surat_lamaran_url ?? null,
            ];
        }

        return Inertia::render('careers/Apply', [
            'lowongan' => [
                'id' => $lowongan->id,
                'kode_lowongan' => $lowongan->kode_lowongan,
                'slug' => $lowongan->slug,
                'judul' => $lowongan->judul,
                'posisi_nama' => $lowongan->jabatan?->nama_jabatan ?? $lowongan->judul,
                'departement_nama' => $lowongan->departement?->deskripsi ?? 'General',
                'kd_departement' => $lowongan->departement?->kd_departement ?? '',
                'jumlah_dibutuhkan' => $lowongan->jumlah_dibutuhkan,
                'lokasi_kerja' => $lowongan->lokasi_kerja,
                'tipe_pekerjaan' => $lowongan->tipe_pekerjaan,
                'deskripsi' => $lowongan->deskripsi,
                'kualifikasi' => $lowongan->kualifikasi,
                'tgl_buka' => $lowongan->tgl_buka ? $lowongan->tgl_buka->format('Y-m-d') : null,
                'tgl_tutup' => $lowongan->tgl_tutup ? $lowongan->tgl_tutup->format('Y-m-d') : null,
                'is_closed' => $isClosed,
                'status' => $lowongan->status,
            ],
            'candidateProfile' => $candidateProfile,
        ]);
    }

    /**
     * Handle candidate application submission.
     */
    public function apply(Request $request, string $slug): RedirectResponse
    {
        $lowongan = Lowongan::where('slug', $slug)->firstOrFail();

        if ($lowongan->status !== 'aktif' ||
            ($lowongan->tgl_tutup && Carbon::parse($lowongan->tgl_tutup)->endOfDay()->isPast())) {
            return back()->with('error', 'Maaf, lowongan pekerjaan ini sudah ditutup.');
        }

        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'tempat_lahir' => ['required', 'string', 'max:150'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'jenis_kelamin' => ['required', 'in:Laki-laki,Perempuan'],
            'status_pernikahan' => ['required', 'string', 'max:50'],
            'agama' => ['required', 'string', 'max:50'],
            'alamat' => ['required', 'string'],
            'domisili' => ['required', 'string', 'max:150'],
            'nomor_kontak' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'pendidikan_terakhir' => ['required', 'string', 'max:50'],
            'nama_institusi' => ['required', 'string', 'max:255'],
            'jurusan' => ['required', 'string', 'max:255'],
            'tahun_lulus' => ['required', 'string', 'max:10'],
            'posisi_dilamar' => ['required', 'string', 'max:255'],
            'foto_file' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'], // Max 2MB Image
            'cv_file' => ['required', 'file', 'mimes:pdf', 'max:2048'], // Max 2MB PDF
            'surat_lamaran_file' => ['nullable', 'file', 'mimes:pdf', 'max:2048'],
            'pernyataan_kebenaran' => ['required', 'accepted'],
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'tempat_lahir.required' => 'Tempat lahir wajib diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tanggal_lahir.before' => 'Tanggal lahir harus sebelum hari ini.',
            'jenis_kelamin.required' => 'Pilih jenis kelamin.',
            'status_pernikahan.required' => 'Pilih status pernikahan.',
            'agama.required' => 'Pilih agama.',
            'alamat.required' => 'Alamat lengkap wajib diisi.',
            'domisili.required' => 'Kota domisili saat ini wajib diisi.',
            'nomor_kontak.required' => 'Nomor kontak / WhatsApp wajib diisi.',
            'email.required' => 'Alamat email aktif wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'pendidikan_terakhir.required' => 'Pendidikan terakhir wajib dipilih.',
            'nama_institusi.required' => 'Nama institusi / universitas / sekolah wajib diisi.',
            'jurusan.required' => 'Jurusan pendidikan wajib diisi.',
            'tahun_lulus.required' => 'Tahun kelulusan wajib diisi.',
            'posisi_dilamar.required' => 'Posisi yang dilamar wajib diisi.',
            'foto_file.required' => 'Pas foto formal kandidat wajib diunggah.',
            'foto_file.image' => 'File pas foto harus berupa file gambar.',
            'foto_file.mimes' => 'Format file pas foto harus JPG, JPEG, PNG, atau WEBP.',
            'foto_file.max' => 'Ukuran file pas foto maksimal 2 MB.',
            'cv_file.required' => 'File CV (Curriculum Vitae) dalam format PDF wajib diunggah.',
            'cv_file.mimes' => 'Format file CV harus berupa PDF (.pdf).',
            'cv_file.max' => 'Ukuran file CV maksimal 2 MB.',
            'surat_lamaran_file.mimes' => 'Format file Surat Lamaran harus berupa PDF (.pdf).',
            'surat_lamaran_file.max' => 'Ukuran file Surat Lamaran maksimal 2 MB.',
            'pernyataan_kebenaran.accepted' => 'Anda wajib menyetujui pernyataan kebenaran data.',
        ]);

        // Upload Pas Foto
        $fotoPath = $request->file('foto_file')->store('rekrutmen/foto', 'public');

        // Upload CV
        $cvPath = $request->file('cv_file')->store('rekrutmen/cv', 'public');

        // Upload Surat Lamaran (if provided)
        $suratLamaranPath = null;
        if ($request->hasFile('surat_lamaran_file')) {
            $suratLamaranPath = $request->file('surat_lamaran_file')->store('rekrutmen/surat_lamaran', 'public');
        }

        // Generate No. Pendaftaran: REG-YYYYMMDD-SEQ
        $todayPrefix = 'REG-' . date('Ymd') . '-';
        $countToday = Pelamar::where('no_pendaftaran', 'like', "{$todayPrefix}%")->count();
        $noPendaftaran = $todayPrefix . str_pad((string) ($countToday + 1), 4, '0', STR_PAD_LEFT);

        $pelamar = Pelamar::create([
            'lowongan_id' => $lowongan->id,
            'no_pendaftaran' => $noPendaftaran,
            'nama_lengkap' => $validated['nama_lengkap'],
            'tempat_lahir' => $validated['tempat_lahir'],
            'tanggal_lahir' => $validated['tanggal_lahir'],
            'jenis_kelamin' => $validated['jenis_kelamin'],
            'status_pernikahan' => $validated['status_pernikahan'],
            'agama' => $validated['agama'],
            'alamat' => $validated['alamat'],
            'domisili' => $validated['domisili'],
            'nomor_kontak' => $validated['nomor_kontak'],
            'email' => $validated['email'],
            'pendidikan_terakhir' => $validated['pendidikan_terakhir'],
            'nama_institusi' => $validated['nama_institusi'],
            'jurusan' => $validated['jurusan'],
            'tahun_lulus' => $validated['tahun_lulus'],
            'posisi_dilamar' => $validated['posisi_dilamar'],
            'sumber_informasi' => $request->input('sumber_informasi') ?: 'Website Karir Perusahaan',
            'foto_path' => $fotoPath,
            'cv_path' => $cvPath,
            'surat_lamaran_path' => $suratLamaranPath,
            'pernyataan_kebenaran' => true,
            'status' => 'submitted',
        ]);

        return back()->with('application_success', [
            'no_pendaftaran' => $pelamar->no_pendaftaran,
            'nama_lengkap' => $pelamar->nama_lengkap,
            'posisi_dilamar' => $pelamar->posisi_dilamar,
            'email' => $pelamar->email,
            'submitted_at' => Carbon::now()->isoFormat('D MMMM Y, HH:mm'),
        ]);
    }
}
