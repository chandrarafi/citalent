<?php

namespace App\Http\Controllers;

use App\Models\FormulirLamaran;
use App\Models\Pelamar;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FormulirLamaranController extends Controller
{
    /**
     * Show candidate application form editor.
     */
    public function edit(Pelamar $pelamar): Response|RedirectResponse
    {
        $user = Auth::user()->load('kandidatProfile');
        $isAdmin = $user->can('manage-permintaan-rekrutmen') || $user->hasRole('super-admin');

        // Security check: Candidate can only edit/view their own application, admin can access any
        if (! $isAdmin && $pelamar->email !== $user->email) {
            abort(403, 'Akses ditolak.');
        }

        $profile = $user->kandidatProfile;
        $formulir = FormulirLamaran::where('pelamar_id', $pelamar->id)->first();

        // Default formal education structure
        $defaultPendidikanFormal = [
            ['jenjang' => 'SLA', 'nama_sekolah' => '', 'jurusan' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
            ['jenjang' => 'Dipl', 'nama_sekolah' => '', 'jurusan' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
            ['jenjang' => 'S-1', 'nama_sekolah' => '', 'jurusan' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
            ['jenjang' => 'S-2', 'nama_sekolah' => '', 'jurusan' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
        ];

        // Fill from pelamar/profile if matching
        if ($pelamar->pendidikan_terakhir || $profile?->pendidikan_terakhir) {
            $lastEdu = $pelamar->pendidikan_terakhir ?: $profile?->pendidikan_terakhir;
            $namaInst = $pelamar->nama_institusi ?: $profile?->nama_institusi;
            $jur = $pelamar->jurusan ?: $profile?->jurusan;
            $thn = $pelamar->tahun_lulus ?: $profile?->tahun_lulus;

            foreach ($defaultPendidikanFormal as &$item) {
                if (
                    ($item['jenjang'] === 'SLA' && str_contains(strtoupper($lastEdu), 'SMA')) ||
                    ($item['jenjang'] === 'Dipl' && str_contains(strtoupper($lastEdu), 'D3')) ||
                    ($item['jenjang'] === 'S-1' && (str_contains(strtoupper($lastEdu), 'S1') || str_contains(strtoupper($lastEdu), 'D4'))) ||
                    ($item['jenjang'] === 'S-2' && str_contains(strtoupper($lastEdu), 'S2'))
                ) {
                    $item['nama_sekolah'] = $namaInst ?: '';
                    $item['jurusan'] = $jur ?: '';
                    $item['tahun'] = $thn ?: '';
                }
            }
            unset($item);
        }

        $defaultBahasa = [
            ['bahasa' => 'Bahasa Indonesia', 'lisan' => 'Baik', 'tertulis' => 'Baik'],
            ['bahasa' => 'Bahasa Inggris', 'lisan' => 'Cukup', 'tertulis' => 'Cukup'],
        ];

        $defaultKeluargaInti = [
            ['status' => 'Suami/Istri', 'nama' => '', 'jenis_kelamin' => 'P', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 1', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 2', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 3', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
        ];

        $defaultSusunanKeluarga = [
            ['status' => 'Ayah', 'nama' => '', 'jenis_kelamin' => 'L', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Ibu', 'nama' => '', 'jenis_kelamin' => 'P', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 1', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 2', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 3', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 4', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 5', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 6', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
            ['status' => 'Anak 7', 'nama' => '', 'jenis_kelamin' => '', 'tempat_tgl_lahir' => '', 'pendidikan' => '', 'pekerjaan' => ''],
        ];

        $defaultPrioritasPekerjaan = [
            ['jenis' => 'Service / Maintenance', 'no_urut' => ''],
            ['jenis' => 'Marketing / Sales', 'no_urut' => ''],
            ['jenis' => 'Finance', 'no_urut' => ''],
            ['jenis' => 'Accounting / Pembukuan', 'no_urut' => ''],
        ];

        $formData = [
            'id' => $formulir?->id,
            'pelamar_id' => $pelamar->id,
            'no_lamaran' => $formulir?->no_lamaran ?: $pelamar->no_pendaftaran,
            'nama_lengkap' => $formulir?->nama_lengkap ?: $pelamar->nama_lengkap,
            'tempat_lahir' => $formulir?->tempat_lahir ?: ($pelamar->tempat_lahir ?: $profile?->tempat_lahir),
            'tanggal_lahir' => $formulir?->tanggal_lahir ? $formulir->tanggal_lahir->format('Y-m-d') : ($pelamar->tanggal_lahir?->format('Y-m-d') ?: $profile?->tanggal_lahir?->format('Y-m-d')),
            'agama' => $formulir?->agama ?: ($pelamar->agama ?: $profile?->agama ?: 'Islam'),
            'kewarganegaraan' => $formulir?->kewarganegaraan ?: 'Indonesia',
            'no_ktp_sim' => $formulir?->no_ktp_sim ?: '',
            'alamat_padang' => $formulir?->alamat_padang ?: ($pelamar->alamat ?: $profile?->alamat ?: ''),
            'telp_padang' => $formulir?->telp_padang ?: '',
            'hp_padang' => $formulir?->hp_padang ?: ($pelamar->nomor_kontak ?: $user->phone ?: ''),
            'alamat_luar_padang' => $formulir?->alamat_luar_padang ?: '',
            'telp_luar_padang' => $formulir?->telp_luar_padang ?: '',

            // Pendidikan
            'pendidikan_formal' => $formulir?->pendidikan_formal ?: $defaultPendidikanFormal,
            'alasan_pilih_jurusan' => $formulir?->alasan_pilih_jurusan ?: '',
            'karya_ilmiah' => $formulir?->karya_ilmiah ?: '',
            'pendidikan_non_formal' => $formulir?->pendidikan_non_formal ?: [
                ['no' => 1, 'nama_kursus' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
                ['no' => 2, 'nama_kursus' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
                ['no' => 3, 'nama_kursus' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
                ['no' => 4, 'nama_kursus' => '', 'tempat' => '', 'tahun' => '', 'ket' => ''],
            ],
            'bahasa_asing' => $formulir?->bahasa_asing ?: $defaultBahasa,

            // Keluarga
            'status_pernikahan' => $formulir?->status_pernikahan ?: ($pelamar->status_pernikahan ?: 'Single / Tunangan'),
            'status_pernikahan_sejak' => $formulir?->status_pernikahan_sejak ? $formulir->status_pernikahan_sejak->format('Y-m-d') : '',
            'keluarga_inti' => $formulir?->keluarga_inti ?: $defaultKeluargaInti,
            'susunan_keluarga' => $formulir?->susunan_keluarga ?: $defaultSusunanKeluarga,

            // Riwayat Pekerjaan
            'pengalaman_kerja' => $formulir?->pengalaman_kerja ?: [
                ['no' => 1, 'nama_perusahaan' => '', 'jabatan' => '', 'periode' => '', 'gaji' => '', 'alasan_pindah' => ''],
                ['no' => 2, 'nama_perusahaan' => '', 'jabatan' => '', 'periode' => '', 'gaji' => '', 'alasan_pindah' => ''],
                ['no' => 3, 'nama_perusahaan' => '', 'jabatan' => '', 'periode' => '', 'gaji' => '', 'alasan_pindah' => ''],
            ],
            'gambaran_jabatan' => $formulir?->gambaran_jabatan ?: '',
            'atasan_bawahan' => $formulir?->atasan_bawahan ?: [
                ['no' => 1, 'nama' => '', 'jabatan' => '', 'perusahaan' => '', 'jumlah_bawahan' => ''],
                ['no' => 2, 'nama' => '', 'jabatan' => '', 'perusahaan' => '', 'jumlah_bawahan' => ''],
            ],
            'masalah_kerja_dan_solusi' => $formulir?->masalah_kerja_dan_solusi ?: '',
            'kesan_perusahaan_sebelumnya' => $formulir?->kesan_perusahaan_sebelumnya ?: '',
            'penanganan_masalah_keputusan' => $formulir?->penanganan_masalah_keputusan ?: '',

            // Minat dan Konsep Pribadi
            'cita_cita' => $formulir?->cita_cita ?: '',
            'pendorong_kerja' => $formulir?->pendorong_kerja ?: '',
            'alasan_melamar_perusahaan' => $formulir?->alasan_melamar_perusahaan ?: '',
            'gaji_diharapkan' => $formulir?->gaji_diharapkan ?: '',
            'fasilitas_diharapkan' => $formulir?->fasilitas_diharapkan ?: '',
            'kapan_mulai_kerja' => $formulir?->kapan_mulai_kerja ?: 'Secepatnya',
            'prioritas_pekerjaan' => $formulir?->prioritas_pekerjaan ?: $defaultPrioritasPekerjaan,
            'bersedia_luar_daerah' => $formulir?->bersedia_luar_daerah ?: 'Bersedia',
            'tipe_orang_disenangi' => $formulir?->tipe_orang_disenangi ?: '',
            'hal_sulit_ambil_keputusan' => $formulir?->hal_sulit_ambil_keputusan ?: '',

            // Aktivitas Sosial
            'ada_kenalan_perusahaan' => $formulir?->ada_kenalan_perusahaan ?: 'Tidak ada',
            'kenalan_perusahaan' => $formulir?->kenalan_perusahaan ?: [
                ['no' => 1, 'nama' => '', 'perusahaan' => '', 'jabatan' => '', 'no_telp' => '', 'hubungan' => ''],
                ['no' => 2, 'nama' => '', 'perusahaan' => '', 'jabatan' => '', 'no_telp' => '', 'hubungan' => ''],
            ],
            'referensi' => $formulir?->referensi ?: [
                ['no' => 1, 'nama' => '', 'perusahaan' => '', 'jabatan' => '', 'no_telp' => '', 'hubungan' => ''],
                ['no' => 2, 'nama' => '', 'perusahaan' => '', 'jabatan' => '', 'no_telp' => '', 'hubungan' => ''],
            ],
            'hobi' => $formulir?->hobi ?: '',
            'cara_mengisi_waktu_luang' => $formulir?->cara_mengisi_waktu_luang ?: '',
            'organisasi' => $formulir?->organisasi ?: [
                ['no' => 1, 'nama_organisasi' => '', 'tempat' => '', 'jabatan' => '', 'periode' => ''],
                ['no' => 2, 'nama_organisasi' => '', 'tempat' => '', 'jabatan' => '', 'periode' => ''],
                ['no' => 3, 'nama_organisasi' => '', 'tempat' => '', 'jabatan' => '', 'periode' => ''],
            ],

            // Lain - lain
            'riwayat_psikotest' => $formulir?->riwayat_psikotest ?: [
                ['no' => 1, 'waktu' => '', 'tempat' => '', 'tujuan' => ''],
                ['no' => 2, 'waktu' => '', 'tempat' => '', 'tujuan' => ''],
            ],
            'kekuatan_diri' => $formulir?->kekuatan_diri ?: '',
            'kelemahan_diri' => $formulir?->kelemahan_diri ?: '',
            'pernah_sakit_lama' => $formulir?->pernah_sakit_lama ?: 'Tidak pernah',
            'riwayat_penyakit' => $formulir?->riwayat_penyakit ?: [
                ['no' => 1, 'nama_penyakit' => '', 'periode' => '', 'akibat' => ''],
            ],
            'gangguan_jasmani' => $formulir?->gangguan_jasmani ?: '',

            // Deklarasi
            'pernyataan_kebenaran' => $formulir?->pernyataan_kebenaran ?? true,
            'tanggal_pernyataan' => $formulir?->tanggal_pernyataan ? $formulir->tanggal_pernyataan->format('Y-m-d') : date('Y-m-d'),
            'is_submitted' => (bool) $formulir?->is_submitted,
            'submitted_at' => $formulir?->submitted_at ? $formulir->submitted_at->isoFormat('D MMMM Y, HH:mm') : null,
        ];

        return Inertia::render('kandidat/FormulirLamaran', [
            'pelamar' => [
                'id' => $pelamar->id,
                'no_pendaftaran' => $pelamar->no_pendaftaran,
                'posisi_dilamar' => $pelamar->posisi_dilamar,
                'foto_url' => $pelamar->foto_url,
                'status' => $pelamar->status,
            ],
            'initialForm' => $formData,
            'isSubmitted' => (bool) $formulir?->is_submitted,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Save or submit candidate application form.
     */
    public function save(Request $request, Pelamar $pelamar): RedirectResponse
    {
        $user = Auth::user();
        $isAdmin = $user->can('manage-permintaan-rekrutmen') || $user->hasRole('super-admin');

        if (! $isAdmin && $pelamar->email !== $user->email) {
            abort(403, 'Akses ditolak.');
        }

        $formulir = FormulirLamaran::where('pelamar_id', $pelamar->id)->first();

        // If candidate already submitted, block candidate from editing again
        if (! $isAdmin && $formulir?->is_submitted) {
            return back()->with('error', 'Formulir telah dikirim resmi dan tidak dapat diubah kembali.');
        }

        $isSubmit = (bool) $request->boolean('is_submit');

        $validated = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'tempat_lahir' => ['nullable', 'string', 'max:150'],
            'tanggal_lahir' => ['nullable', 'date'],
            'agama' => ['nullable', 'string', 'max:50'],
            'kewarganegaraan' => ['nullable', 'string', 'max:50'],
            'no_ktp_sim' => ['nullable', 'string', 'max:50'],
            'alamat_padang' => ['nullable', 'string', 'max:500'],
            'telp_padang' => ['nullable', 'string', 'max:50'],
            'hp_padang' => ['nullable', 'string', 'max:50'],
            'alamat_luar_padang' => ['nullable', 'string', 'max:500'],
            'telp_luar_padang' => ['nullable', 'string', 'max:50'],

            'pendidikan_formal' => ['nullable', 'array'],
            'alasan_pilih_jurusan' => ['nullable', 'string'],
            'karya_ilmiah' => ['nullable', 'string'],
            'pendidikan_non_formal' => ['nullable', 'array'],
            'bahasa_asing' => ['nullable', 'array'],

            'status_pernikahan' => ['nullable', 'string', 'max:50'],
            'status_pernikahan_sejak' => ['nullable', 'date'],
            'keluarga_inti' => ['nullable', 'array'],
            'susunan_keluarga' => ['nullable', 'array'],

            'pengalaman_kerja' => ['nullable', 'array'],
            'gambaran_jabatan' => ['nullable', 'string'],
            'atasan_bawahan' => ['nullable', 'array'],
            'masalah_kerja_dan_solusi' => ['nullable', 'string'],
            'kesan_perusahaan_sebelumnya' => ['nullable', 'string'],
            'penanganan_masalah_keputusan' => ['nullable', 'string'],

            'cita_cita' => ['nullable', 'string'],
            'pendorong_kerja' => ['nullable', 'string'],
            'alasan_melamar_perusahaan' => ['nullable', 'string'],
            'gaji_diharapkan' => ['nullable', 'string', 'max:50'],
            'fasilitas_diharapkan' => ['nullable', 'string'],
            'kapan_mulai_kerja' => ['nullable', 'string', 'max:100'],
            'prioritas_pekerjaan' => ['nullable', 'array'],
            'bersedia_luar_daerah' => ['nullable', 'string', 'max:20'],
            'tipe_orang_disenangi' => ['nullable', 'string'],
            'hal_sulit_ambil_keputusan' => ['nullable', 'string'],

            'ada_kenalan_perusahaan' => ['nullable', 'string', 'max:20'],
            'kenalan_perusahaan' => ['nullable', 'array'],
            'referensi' => ['nullable', 'array'],
            'hobi' => ['nullable', 'string'],
            'cara_mengisi_waktu_luang' => ['nullable', 'string'],
            'organisasi' => ['nullable', 'array'],

            'riwayat_psikotest' => ['nullable', 'array'],
            'kekuatan_diri' => ['nullable', 'string'],
            'kelemahan_diri' => ['nullable', 'string'],
            'pernah_sakit_lama' => ['nullable', 'string', 'max:20'],
            'riwayat_penyakit' => ['nullable', 'array'],
            'gangguan_jasmani' => ['nullable', 'string'],

            'pernyataan_kebenaran' => ['nullable', 'boolean'],
            'tanggal_pernyataan' => ['nullable', 'date'],
        ]);

        $attributes = array_merge($validated, [
            'pelamar_id' => $pelamar->id,
            'user_id' => $pelamar->email === $user->email ? $user->id : ($formulir?->user_id ?? $user->id),
            'no_lamaran' => $pelamar->no_pendaftaran,
            'is_submitted' => $isSubmit || ($formulir?->is_submitted ?? false),
            'submitted_at' => ($isSubmit && ! $formulir?->submitted_at) ? now() : ($formulir?->submitted_at ?? ($isSubmit ? now() : null)),
        ]);

        FormulirLamaran::updateOrCreate(
            ['pelamar_id' => $pelamar->id],
            $attributes
        );

        if ($isSubmit) {
            // Directly advance pelamar status to next timeline stage without waiting for HR review
            $pelamar->loadMissing(['lowongan.jabatan', 'lowongan.permintaanRekrutmen']);
            $kdJabatan = $pelamar->lowongan?->jabatan?->kd_jabatan
                ?: ($pelamar->lowongan?->permintaanRekrutmen?->kd_jabatan ?: '');

            $skillTestJabatanCodes = ['JBT-5', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31', 'JBT-26'];
            $hasSkillTest = in_array($kdJabatan, $skillTestJabatanCodes);

            $nextStatus = $hasSkillTest ? 'skill_test' : 'interview_hr';

            // Directly advance status if currently in early stages
            if (in_array($pelamar->status, ['submitted', 'screening_cv', 'review', 'lengkapi_formulir'])) {
                $pelamar->status = $nextStatus;
                $pelamar->save();
            }
        }

        $message = $isSubmit
            ? 'Formulir Lamaran Kerja berhasil dikirimkan secara resmi! Status lamaran Anda telah otomatis berlanjut ke tahap berikutnya.'
            : 'Draf Formulir Lamaran Kerja berhasil disimpan sementara.';

        if (! $isSubmit) {
            return back()->with('success', $message);
        }

        return redirect()->route('kandidat.lamaran.show', $pelamar->no_pendaftaran)->with('success', $message);
    }

    /**
     * Show candidate application form for Admin / HR review & printing.
     */
    public function showForAdmin(Pelamar $pelamar): Response
    {
        $pelamar->load(['lowongan.departement', 'lowongan.jabatan', 'formulirLamaran']);
        $formulir = $pelamar->formulirLamaran;

        return Inertia::render('pelamar/FormulirDetail', [
            'pelamar' => [
                'id' => $pelamar->id,
                'no_pendaftaran' => $pelamar->no_pendaftaran,
                'posisi_dilamar' => $pelamar->posisi_dilamar,
                'nama_lengkap' => $pelamar->nama_lengkap,
                'email' => $pelamar->email,
                'nomor_kontak' => $pelamar->nomor_kontak,
                'foto_url' => $pelamar->foto_url,
                'cv_url' => $pelamar->cv_url,
                'status' => $pelamar->status,
                'created_at' => $pelamar->created_at ? $pelamar->created_at->isoFormat('D MMMM Y, HH:mm') : null,
            ],
            'formulir' => $formulir ? [
                'id' => $formulir->id,
                'no_lamaran' => $formulir->no_lamaran,
                'nama_lengkap' => $formulir->nama_lengkap,
                'tempat_lahir' => $formulir->tempat_lahir,
                'tanggal_lahir' => $formulir->tanggal_lahir?->format('d/m/Y'),
                'agama' => $formulir->agama,
                'kewarganegaraan' => $formulir->kewarganegaraan,
                'no_ktp_sim' => $formulir->no_ktp_sim,
                'alamat_padang' => $formulir->alamat_padang,
                'telp_padang' => $formulir->telp_padang,
                'hp_padang' => $formulir->hp_padang,
                'alamat_luar_padang' => $formulir->alamat_luar_padang,
                'telp_luar_padang' => $formulir->telp_luar_padang,
                'pendidikan_formal' => $formulir->pendidikan_formal,
                'alasan_pilih_jurusan' => $formulir->alasan_pilih_jurusan,
                'karya_ilmiah' => $formulir->karya_ilmiah,
                'pendidikan_non_formal' => $formulir->pendidikan_non_formal,
                'bahasa_asing' => $formulir->bahasa_asing,
                'status_pernikahan' => $formulir->status_pernikahan,
                'status_pernikahan_sejak' => $formulir->status_pernikahan_sejak?->format('d/m/Y'),
                'keluarga_inti' => $formulir->keluarga_inti,
                'susunan_keluarga' => $formulir->susunan_keluarga,
                'pengalaman_kerja' => $formulir->pengalaman_kerja,
                'gambaran_jabatan' => $formulir->gambaran_jabatan,
                'atasan_bawahan' => $formulir->atasan_bawahan,
                'masalah_kerja_dan_solusi' => $formulir->masalah_kerja_dan_solusi,
                'kesan_perusahaan_sebelumnya' => $formulir->kesan_perusahaan_sebelumnya,
                'penanganan_masalah_keputusan' => $formulir->penanganan_masalah_keputusan,
                'cita_cita' => $formulir->cita_cita,
                'pendorong_kerja' => $formulir->pendorong_kerja,
                'alasan_melamar_perusahaan' => $formulir->alasan_melamar_perusahaan,
                'gaji_diharapkan' => $formulir->gaji_diharapkan,
                'fasilitas_diharapkan' => $formulir->fasilitas_diharapkan,
                'kapan_mulai_kerja' => $formulir->kapan_mulai_kerja,
                'prioritas_pekerjaan' => $formulir->prioritas_pekerjaan,
                'bersedia_luar_daerah' => $formulir->bersedia_luar_daerah,
                'tipe_orang_disenangi' => $formulir->tipe_orang_disenangi,
                'hal_sulit_ambil_keputusan' => $formulir->hal_sulit_ambil_keputusan,
                'ada_kenalan_perusahaan' => $formulir->ada_kenalan_perusahaan,
                'kenalan_perusahaan' => $formulir->kenalan_perusahaan,
                'referensi' => $formulir->referensi,
                'hobi' => $formulir->hobi,
                'cara_mengisi_waktu_luang' => $formulir->cara_mengisi_waktu_luang,
                'organisasi' => $formulir->organisasi,
                'riwayat_psikotest' => $formulir->riwayat_psikotest,
                'kekuatan_diri' => $formulir->kekuatan_diri,
                'kelemahan_diri' => $formulir->kelemahan_diri,
                'pernah_sakit_lama' => $formulir->pernah_sakit_lama,
                'riwayat_penyakit' => $formulir->riwayat_penyakit,
                'gangguan_jasmani' => $formulir->gangguan_jasmani,
                'pernyataan_kebenaran' => $formulir->pernyataan_kebenaran,
                'tanggal_pernyataan' => $formulir->tanggal_pernyataan?->format('d/m/Y'),
                'is_submitted' => $formulir->is_submitted,
                'submitted_at' => $formulir->submitted_at?->isoFormat('D MMMM Y, HH:mm'),
            ] : null,
        ]);
    }

    /**
     * Download or stream Candidate Application Form PDF for Candidate.
     */
    public function cetakPdf(Pelamar $pelamar)
    {
        $user = Auth::user();

        // Security check
        if ($pelamar->email !== $user->email) {
            abort(403, 'Akses ditolak.');
        }

        return $this->generatePdfResponse($pelamar);
    }

    /**
     * Download or stream Candidate Application Form PDF for Admin / HR.
     */
    public function cetakPdfForAdmin(Pelamar $pelamar)
    {
        return $this->generatePdfResponse($pelamar);
    }

    /**
     * Helper to build and stream the PDF response.
     */
    protected function generatePdfResponse(Pelamar $pelamar)
    {
        $pelamar->load(['lowongan.departement', 'lowongan.jabatan', 'formulirLamaran']);
        $formulir = $pelamar->formulirLamaran;

        $fotoBase64 = null;
        if (extension_loaded('gd')) {
            if ($pelamar->foto_path && Storage::disk('public')->exists($pelamar->foto_path)) {
                $mime = Storage::disk('public')->mimeType($pelamar->foto_path) ?: 'image/jpeg';
                $fotoBase64 = 'data:' . $mime . ';base64,' . base64_encode(Storage::disk('public')->get($pelamar->foto_path));
            } elseif (file_exists(public_path('assets/images/user.png'))) {
                $fotoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('assets/images/user.png')));
            }
        }

        $pdf = Pdf::loadView('pdf.formulir_lamaran', [
            'pelamar' => $pelamar,
            'formulir' => $formulir,
            'fotoBase64' => $fotoBase64,
        ])
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'sans-serif',
            ]);

        $filename = 'Formulir_Lamaran_' . ($pelamar->no_pendaftaran ?: 'REG') . '_' . str_replace(' ', '_', $pelamar->nama_lengkap) . '.pdf';

        return $pdf->stream($filename);
    }
}
