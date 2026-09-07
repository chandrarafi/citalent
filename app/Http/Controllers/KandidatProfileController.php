<?php

namespace App\Http\Controllers;

use App\Models\KandidatProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class KandidatProfileController extends Controller
{
    /**
     * Show candidate profile / biodata form.
     */
    public function edit(): Response
    {
        $user = Auth::user()->load('kandidatProfile');
        $profile = $user->kandidatProfile;

        return Inertia::render('kandidat/Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'profile' => $profile ? [
                'tempat_lahir' => $profile->tempat_lahir,
                'tanggal_lahir' => $profile->tanggal_lahir?->format('Y-m-d'),
                'jenis_kelamin' => $profile->jenis_kelamin,
                'status_pernikahan' => $profile->status_pernikahan,
                'agama' => $profile->agama,
                'alamat' => $profile->alamat,
                'domisili' => $profile->domisili,
                'pendidikan_terakhir' => $profile->pendidikan_terakhir,
                'nama_institusi' => $profile->nama_institusi,
                'jurusan' => $profile->jurusan,
                'tahun_lulus' => $profile->tahun_lulus,
                'foto_url' => $profile->foto_url,
                'cv_url' => $profile->cv_url,
                'is_complete' => $profile->is_complete,
            ] : null,
        ]);
    }

    /**
     * Update candidate profile / biodata.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->kandidatProfile;

        $hasExistingFoto = (bool) ($profile && $profile->foto_path);

        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'nomor_kontak' => ['required', 'string', 'max:25'],
            'tempat_lahir' => ['required', 'string', 'max:150'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', 'in:Laki-laki,Perempuan'],
            'status_pernikahan' => ['required', 'string', 'max:50'],
            'agama' => ['required', 'string', 'max:50'],
            'alamat' => ['required', 'string', 'max:500'],
            'domisili' => ['required', 'string', 'max:150'],
            'pendidikan_terakhir' => ['required', 'string', 'max:50'],
            'nama_institusi' => ['required', 'string', 'max:255'],
            'jurusan' => ['required', 'string', 'max:255'],
            'tahun_lulus' => ['required', 'string', 'max:10'],
            'foto_file' => [
                $hasExistingFoto ? 'nullable' : 'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:2048',
            ],
            'cv_file' => ['nullable', 'file', 'mimes:pdf', 'max:2048'],
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'nomor_kontak.required' => 'Nomor HP / WhatsApp wajib diisi.',
            'tempat_lahir.required' => 'Tempat lahir wajib diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'status_pernikahan.required' => 'Status pernikahan wajib dipilih.',
            'agama.required' => 'Agama wajib dipilih.',
            'alamat.required' => 'Alamat lengkap KTP wajib diisi.',
            'domisili.required' => 'Kota domisili saat ini wajib diisi.',
            'pendidikan_terakhir.required' => 'Pendidikan terakhir wajib dipilih.',
            'nama_institusi.required' => 'Nama institusi pendidikan wajib diisi.',
            'jurusan.required' => 'Jurusan / program studi wajib diisi.',
            'tahun_lulus.required' => 'Tahun kelulusan wajib diisi.',
            'foto_file.required' => 'Pas foto formal wajib diunggah.',
            'foto_file.max' => 'Ukuran pas foto maksimal 2 MB.',
            'cv_file.max' => 'Ukuran file CV maksimal 2 MB.',
        ]);

        // 1. Update user core profile
        $user->update([
            'name' => $validated['nama_lengkap'],
            'phone' => $validated['nomor_kontak'],
        ]);

        // 2. Handle file uploads
        $fotoPath = $profile?->foto_path;
        if ($request->hasFile('foto_file')) {
            if ($fotoPath && Storage::disk('public')->exists($fotoPath)) {
                Storage::disk('public')->delete($fotoPath);
            }
            $fotoPath = $request->file('foto_file')->store('rekrutmen/foto', 'public');
        }

        $cvPath = $profile?->cv_path;
        if ($request->hasFile('cv_file')) {
            if ($cvPath && Storage::disk('public')->exists($cvPath)) {
                Storage::disk('public')->delete($cvPath);
            }
            $cvPath = $request->file('cv_file')->store('rekrutmen/cv', 'public');
        }

        // 3. Update or create KandidatProfile
        KandidatProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'tempat_lahir' => $validated['tempat_lahir'],
                'tanggal_lahir' => $validated['tanggal_lahir'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'status_pernikahan' => $validated['status_pernikahan'],
                'agama' => $validated['agama'],
                'alamat' => $validated['alamat'],
                'domisili' => $validated['domisili'],
                'pendidikan_terakhir' => $validated['pendidikan_terakhir'],
                'nama_institusi' => $validated['nama_institusi'],
                'jurusan' => $validated['jurusan'],
                'tahun_lulus' => $validated['tahun_lulus'],
                'foto_path' => $fotoPath,
                'cv_path' => $cvPath,
                'is_complete' => true,
            ]
        );

        return redirect()->route('dashboard')->with('success', 'Biodata profil Anda berhasil disimpan dan telah lengkap! Selamat datang di Dashboard Citalent.');
    }
}
