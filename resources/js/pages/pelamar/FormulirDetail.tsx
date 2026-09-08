import { Head, router } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge, Blob } from '@/components/pouf/media'
import { Separator } from '@/components/pouf/separator'
import {
  IconArrowLeft,
  IconPrinter,
  IconCheck,
  IconFileText,
  IconBuildingCommunity,
  IconSchool,
  IconUsers,
  IconBriefcase,
  IconTarget,
} from '@tabler/icons-react'

interface Props {
  pelamar: {
    id: number
    no_pendaftaran: string
    posisi_dilamar: string
    nama_lengkap: string
    email: string
    nomor_kontak: string
    foto_url?: string | null
    cv_url?: string | null
    status: string
    created_at: string
  }
  formulir?: any | null
}

export default function FormulirDetail({ pelamar, formulir }: Props) {
  return (
    <AppLayout>
      <Head title={`Formulir Lamaran Kerja - ${pelamar.nama_lengkap}`} />

      <div className="max-w-5xl mx-auto pb-20 pt-1 sm:pt-2">
        <Stack gap={5}>
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
            <Button
              tone="purple"
              size="sm"
              onClick={() => router.visit(`/pelamar/${pelamar.id}`)}
            >
              <IconArrowLeft size={16} />
              Kembali ke Detail Pelamar
            </Button>

            <div className="flex items-center gap-2">
              <Button
                tone="mint"
                size="sm"
                onClick={() => window.open(`/pelamar/${pelamar.id}/formulir/cetak`, '_blank')}
              >
                <IconPrinter size={16} />
                Cetak Formulir (PDF)
              </Button>
            </div>
          </div>

          {!formulir ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <IconFileText size={32} />
                </div>
                <Heading level={3}>Kandidat Belum Mengisi Formulir</Heading>
                <Text size="sm" muted className="mt-1 max-w-md mx-auto">
                  Pelamar {pelamar.nama_lengkap} belum melengkapi / mengirimkan Formulir Lamaran Kerja.
                </Text>
              </div>
            </Card>
          ) : (
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8 text-slate-800 text-xs">
              {/* Document Header matching physical sheet */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-lg font-black tracking-wider uppercase text-slate-900">PT. MENARA AGUNG</h1>
                  <h2 className="text-base font-extrabold tracking-tight uppercase text-purple-900 mt-0.5">
                    FORMULIR LAMARAN KERJA
                  </h2>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    NO. LAMARAN : <strong className="font-mono text-slate-900">{formulir.no_lamaran || pelamar.no_pendaftaran}</strong> &bull; Posisi: <strong className="text-slate-900">{pelamar.posisi_dilamar}</strong>
                  </p>
                </div>

                <div className="w-24 h-32 border-2 border-slate-400 rounded flex flex-col items-center justify-center text-center overflow-hidden bg-slate-50 shrink-0">
                  {pelamar.foto_url ? (
                    <img src={pelamar.foto_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold leading-tight">Pas Foto<br />3 x 4</span>
                  )}
                </div>
              </div>

              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                ISILAH DENGAN HURUF CETAK !
              </p>

              {/* 1. IDENTITAS */}
              <section>
                <h3 className="font-bold text-sm text-slate-900 mb-2 border-b border-slate-300 pb-1 uppercase">
                  Identitas
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-semibold">Nama Lengkap *)</span>
                    <span className="w-4">:</span>
                    <span className="font-bold flex-1">{formulir.nama_lengkap || pelamar.nama_lengkap}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-semibold">Agama</span>
                    <span className="w-4">:</span>
                    <span className="font-medium flex-1">{formulir.agama || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-semibold">Tempat & Tgl Lahir</span>
                    <span className="w-4">:</span>
                    <span className="font-medium flex-1">{formulir.tempat_lahir || '-'}, {formulir.tanggal_lahir || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-semibold">Kewarganegaraan</span>
                    <span className="w-4">:</span>
                    <span className="font-medium flex-1">{formulir.kewarganegaraan || 'Indonesia'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-semibold">No. KTP / SIM</span>
                    <span className="w-4">:</span>
                    <span className="font-mono font-medium flex-1">{formulir.no_ktp_sim || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-slate-500 font-semibold">Status Pernikahan</span>
                    <span className="w-4">:</span>
                    <span className="font-medium flex-1">{formulir.status_pernikahan || '-'}</span>
                  </div>
                  <div className="flex col-span-2">
                    <span className="w-36 text-slate-500 font-semibold shrink-0">Alamat di Padang</span>
                    <span className="w-4 shrink-0">:</span>
                    <span className="font-medium flex-1">{formulir.alamat_padang || '-'} (HP: {formulir.hp_padang || '-'})</span>
                  </div>
                  {formulir.alamat_luar_padang && (
                    <div className="flex col-span-2">
                      <span className="w-36 text-slate-500 font-semibold shrink-0">Alamat Luar Padang</span>
                      <span className="w-4 shrink-0">:</span>
                      <span className="font-medium flex-1">{formulir.alamat_luar_padang} (Telp: {formulir.telp_luar_padang || '-'})</span>
                    </div>
                  )}
                </div>
              </section>

              {/* 2. PENDIDIKAN */}
              <section className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 mb-2 border-b border-slate-300 pb-1 uppercase">
                  Pendidikan
                </h3>
                <div>
                  <p className="font-bold text-slate-700 mb-1.5">1. Pendidikan Formal</p>
                  <table className="w-full border border-slate-300 text-[11px] text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300 w-16">Jenjang</th>
                        <th className="p-1.5 border-r border-slate-300">Nama Sekolah</th>
                        <th className="p-1.5 border-r border-slate-300">Jurusan</th>
                        <th className="p-1.5 border-r border-slate-300">Tempat</th>
                        <th className="p-1.5 border-r border-slate-300 w-24">Tahun</th>
                        <th className="p-1.5">Ket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formulir.pendidikan_formal?.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-1.5 font-bold border-r border-slate-300">{r.jenjang}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.nama_sekolah || '-'}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.jurusan || '-'}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.tempat || '-'}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.tahun || '-'}</td>
                          <td className="p-1.5">{r.ket || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <span className="font-bold text-slate-700 block">
                      2. Apa yang menyebabkan Anda memilih jurusan tersebut di Perguruan Tinggi ?
                    </span>
                    <p className="p-2 rounded bg-slate-50 border border-slate-200 mt-1 italic text-slate-700">
                      {formulir.alasan_pilih_jurusan || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">
                      3. Sebutkan karya Ilmiah yang pernah Anda buat : (skripsi, artikel, karya tulis, dll)
                    </span>
                    <p className="p-2 rounded bg-slate-50 border border-slate-200 mt-1 italic text-slate-700">
                      {formulir.karya_ilmiah || '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-700 mb-1.5">4. Pendidikan Non Formal</p>
                  <table className="w-full border border-slate-300 text-[11px] text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300 w-8 text-center">No</th>
                        <th className="p-1.5 border-r border-slate-300">Nama Kursus</th>
                        <th className="p-1.5 border-r border-slate-300">Tempat</th>
                        <th className="p-1.5 border-r border-slate-300 w-24">Tahun</th>
                        <th className="p-1.5">Ket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formulir.pendidikan_non_formal?.filter((r: any) => r.nama_kursus)?.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-1.5 text-center border-r border-slate-300">{idx + 1}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.nama_kursus}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.tempat || '-'}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.tahun || '-'}</td>
                          <td className="p-1.5">{r.ket || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="font-bold text-slate-700 mb-1.5">5. Bahasa Asing yang Dikuasai</p>
                  <table className="w-full border border-slate-300 text-[11px] text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300 w-8 text-center">No</th>
                        <th className="p-1.5 border-r border-slate-300">Bahasa</th>
                        <th className="p-1.5 border-r border-slate-300 text-center">Lisan</th>
                        <th className="p-1.5 text-center">Tertulis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formulir.bahasa_asing?.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-1.5 text-center border-r border-slate-300">{idx + 1}</td>
                          <td className="p-1.5 border-r border-slate-300 font-semibold">{r.bahasa}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center">{r.lisan}</td>
                          <td className="p-1.5 text-center">{r.tertulis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 3. KELUARGA */}
              <section className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 mb-2 border-b border-slate-300 pb-1 uppercase">
                  Keluarga dan Lingkungan
                </h3>
                <div>
                  <p className="font-bold text-slate-700 mb-1.5">2. Status Keluarga (Suami / Istri dan anak)</p>
                  <table className="w-full border border-slate-300 text-[11px] text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300 w-24">Status</th>
                        <th className="p-1.5 border-r border-slate-300">Nama</th>
                        <th className="p-1.5 border-r border-slate-300 w-12 text-center">L/P</th>
                        <th className="p-1.5 border-r border-slate-300">Tempat / Tgl Lahir</th>
                        <th className="p-1.5 border-r border-slate-300">Pendidikan</th>
                        <th className="p-1.5">Pekerjaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formulir.keluarga_inti?.filter((r: any) => r.nama)?.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-1.5 font-semibold border-r border-slate-300">{r.status}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.nama}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center">{r.jenis_kelamin}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.tempat_tgl_lahir || '-'}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.pendidikan || '-'}</td>
                          <td className="p-1.5">{r.pekerjaan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="font-bold text-slate-700 mb-1.5">3. Susunan Keluarga (Ayah, Ibu, Saudara Sekandung)</p>
                  <table className="w-full border border-slate-300 text-[11px] text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300 w-24">Status</th>
                        <th className="p-1.5 border-r border-slate-300">Nama</th>
                        <th className="p-1.5 border-r border-slate-300 w-12 text-center">L/P</th>
                        <th className="p-1.5 border-r border-slate-300">Tempat / Tgl Lahir</th>
                        <th className="p-1.5 border-r border-slate-300">Pendidikan</th>
                        <th className="p-1.5">Pekerjaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formulir.susunan_keluarga?.filter((r: any) => r.nama)?.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-1.5 font-semibold border-r border-slate-300">{r.status}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.nama}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center">{r.jenis_kelamin}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.tempat_tgl_lahir || '-'}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.pendidikan || '-'}</td>
                          <td className="p-1.5">{r.pekerjaan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 4. RIWAYAT PEKERJAAN */}
              <section className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 mb-2 border-b border-slate-300 pb-1 uppercase">
                  Riwayat Pekerjaan
                </h3>
                <div>
                  <p className="font-bold text-slate-700 mb-1.5">1. Pengalaman Kerja</p>
                  <table className="w-full border border-slate-300 text-[11px] text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300 w-8 text-center">No</th>
                        <th className="p-1.5 border-r border-slate-300">Nama Perusahaan</th>
                        <th className="p-1.5 border-r border-slate-300">Jabatan</th>
                        <th className="p-1.5 border-r border-slate-300 w-24">Periode</th>
                        <th className="p-1.5 border-r border-slate-300">Gaji</th>
                        <th className="p-1.5">Alasan Pindah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formulir.pengalaman_kerja?.filter((r: any) => r.nama_perusahaan)?.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-1.5 text-center border-r border-slate-300">{idx + 1}</td>
                          <td className="p-1.5 border-r border-slate-300 font-semibold">{r.nama_perusahaan}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.jabatan}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.periode}</td>
                          <td className="p-1.5 border-r border-slate-300">{r.gaji}</td>
                          <td className="p-1.5">{r.alasan_pindah}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-bold text-slate-700 block">2. Gambaran Tugas & Jabatan :</span>
                    <p className="p-2 rounded bg-slate-50 border border-slate-200 mt-1 italic text-slate-700">
                      {formulir.gambaran_jabatan || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">4. Masalah Pekerjaan & Solusi :</span>
                    <p className="p-2 rounded bg-slate-50 border border-slate-200 mt-1 italic text-slate-700">
                      {formulir.masalah_kerja_dan_solusi || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">5. Kesan Terhadap Perusahaan :</span>
                    <p className="p-2 rounded bg-slate-50 border border-slate-200 mt-1 italic text-slate-700">
                      {formulir.kesan_perusahaan_sebelumnya || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">6. Pengambilan Keputusan :</span>
                    <p className="p-2 rounded bg-slate-50 border border-slate-200 mt-1 italic text-slate-700">
                      {formulir.penanganan_masalah_keputusan || '-'}
                    </p>
                  </div>
                </div>
              </section>

              {/* 5. MINAT & LAIN-LAIN */}
              <section className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 mb-2 border-b border-slate-300 pb-1 uppercase">
                  Minat, Aktivitas Sosial & Karakteristik
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block">Gaji yang Diharapkan:</span>
                    <span className="font-bold text-purple-900">{formulir.gaji_diharapkan || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Kesiapan Mulai Kerja:</span>
                    <span className="font-bold">{formulir.kapan_mulai_kerja || 'Secepatnya'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Bersedia Ditempatkan di Luar Daerah:</span>
                    <span className="font-bold">{formulir.bersedia_luar_daerah || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Kekuatan (Strong Point):</span>
                    <span className="font-medium italic">{formulir.kekuatan_diri || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Area Perbaikan (Weak Point):</span>
                    <span className="font-medium italic">{formulir.kelemahan_diri || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Riwayat Penyakit Berat:</span>
                    <span className="font-medium">{formulir.pernah_sakit_lama || 'Tidak pernah'}</span>
                  </div>
                </div>
              </section>

              {/* Deklarasi & Tanda Tangan */}
              <div className="border-t-2 border-slate-900 pt-6 mt-8 flex justify-between items-end">
                <div className="max-w-md">
                  <p className="text-[11px] italic leading-relaxed text-slate-600">
                    &quot;Diisi dengan sesungguhnya. Apabila dikemudian hari ternyata ada hal-hal yang bertentangan, maka saya bersedia dituntut sesuai dengan hukum yang berlaku dan lamaran ini dapat dibatalkan.&quot;
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-2">
                    ✓ Disetujui & Dikonfirmasi secara elektronik pada: {formulir.submitted_at || formulir.tanggal_pernyataan || '-'}
                  </p>
                </div>

                <div className="text-center w-56">
                  <p className="text-xs text-slate-600 mb-12">Hormat Saya,</p>
                  <p className="font-bold text-xs underline uppercase">{formulir.nama_lengkap || pelamar.nama_lengkap}</p>
                </div>
              </div>
            </div>
          )}
        </Stack>
      </div>
    </AppLayout>
  )
}
