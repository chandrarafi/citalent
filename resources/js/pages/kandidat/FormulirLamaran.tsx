import { useState } from 'react'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import { Select, Dialog } from '@/components/pouf/controls'
import { Badge, Blob } from '@/components/pouf/media'
import { Separator } from '@/components/pouf/separator'
import { toast } from '@/components/pouf/toaster'
import {
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
  IconDeviceFloppy,
  IconSend,
  IconPrinter,
  IconPlus,
  IconTrash,
  IconBuildingCommunity,
  IconSchool,
  IconUsers,
  IconBriefcase,
  IconHeartHandshake,
  IconTarget,
  IconInfoCircle,
} from '@tabler/icons-react'

interface PelamarInfo {
  id: number
  no_pendaftaran: string
  posisi_dilamar: string
  foto_url?: string | null
  status: string
}

interface Props {
  pelamar: PelamarInfo
  initialForm: any
  isSubmitted: boolean
  isAdmin?: boolean
}

const AGAMA_OPTIONS = [
  { value: 'Islam', label: 'Islam' },
  { value: 'Kristen', label: 'Kristen Protestan' },
  { value: 'Katolik', label: 'Katolik' },
  { value: 'Hindu', label: 'Hindu' },
  { value: 'Buddha', label: 'Buddha' },
  { value: 'Konghucu', label: 'Konghucu' },
  { value: 'Lainnya', label: 'Lainnya' },
]

const KELAMIN_OPTIONS = [
  { value: 'L', label: 'Laki-laki (L)' },
  { value: 'P', label: 'Perempuan (P)' },
]

const KEMAMPUAN_BAHASA_OPTIONS = ['Kurang', 'Cukup', 'Baik']

export default function FormulirLamaran({ pelamar, initialForm, isSubmitted, isAdmin = false }: Props) {
  const isReadOnly = isSubmitted && !isAdmin
  const { flash } = usePage<any>().props
  const [activeTab, setActiveTab] = useState<number>(1)
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false)

  const { data, setData, post, processing, errors } = useForm<any>({
    ...initialForm,
    is_submit: false,
  })

  function handleSaveDraft() {
    if (isReadOnly) return
    setData('is_submit', false)
    post(`/kandidat/lamaran/${pelamar.no_pendaftaran}/formulir`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Draf formulir berhasil disimpan!', {
          description: 'Data formulir Anda telah disimpan sementara.',
        })
      },
      onError: () => {
        toast.error('Gagal menyimpan draf', {
          description: 'Silakan periksa kembali isian formulir Anda.',
        })
      },
    })
  }

  function handleFinalSubmit() {
    if (isReadOnly) return
    setConfirmSubmitModal(false)
    setData('is_submit', true)
    post(`/kandidat/lamaran/${pelamar.no_pendaftaran}/formulir`, {
      preserveScroll: true,
    })
  }

  // Helper dynamic row handlers
  function addRow(field: string, defaultObj: any) {
    if (isReadOnly) return
    const arr = [...(data[field] || [])]
    arr.push({ ...defaultObj, no: arr.length + 1 })
    setData(field, arr)
  }

  function removeRow(field: string, index: number) {
    if (isReadOnly) return
    const arr = [...(data[field] || [])]
    arr.splice(index, 1)
    // Re-index
    const reindexed = arr.map((item, idx) => ({ ...item, no: idx + 1 }))
    setData(field, reindexed)
  }

  function updateRowItem(field: string, index: number, key: string, val: any) {
    if (isReadOnly) return
    const arr = [...(data[field] || [])]
    arr[index] = { ...arr[index], [key]: val }
    setData(field, arr)
  }

  const tabs = [
    { id: 1, label: '1. Identitas', icon: IconUsers },
    { id: 2, label: '2. Pendidikan', icon: IconSchool },
    { id: 3, label: '3. Keluarga', icon: IconHeartHandshake },
    { id: 4, label: '4. Riwayat Kerja', icon: IconBriefcase },
    { id: 5, label: '5. Minat & Pribadi', icon: IconTarget },
    { id: 6, label: '6. Aktivitas Sosial', icon: IconBuildingCommunity },
    { id: 7, label: '7. Lain-lain & Konfirmasi', icon: IconCheck },
  ]

  return (
    <AppLayout>
      <Head title={`Formulir Lamaran Kerja - ${pelamar.posisi_dilamar}`} />

      <div className="max-w-5xl mx-auto pb-20 pt-1 sm:pt-2">
        <Stack gap={5}>
          {/* Action Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Button
              tone="purple"
              size="sm"
              onClick={() => router.visit(`/kandidat/lamaran/${pelamar.no_pendaftaran}`)}
            >
              <IconArrowLeft size={16} />
              Kembali ke Detail Lamaran
            </Button>

            <div className="flex items-center gap-2.5">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => window.open(`/kandidat/lamaran/${pelamar.no_pendaftaran}/formulir/cetak`, '_blank')}
                className="hidden sm:inline-flex"
              >
                <IconPrinter size={16} />
                Cetak Formulir (PDF)
              </Button>

             
            </div>
          </div>

          {/* Read-Only Banner for Candidate */}
          {isReadOnly && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <IconCheck size={20} />
                </div>
                <div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Formulir lamaran ini telah berhasil dikirimkan secara resmi ke Tim Rekrutmen. Anda dapat meninjau seluruh data di bawah ini atau mencetak dokumen dalam format PDF.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Form Card */}
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Blob icon="form" tone="purple" size="lg" />
                <Stack gap={1}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Heading level={2}>FORMULIR LAMARAN KERJA</Heading>
                    <Badge tone="purple">{pelamar.posisi_dilamar}</Badge>
                  </div>
                  <Text size="sm" muted>
                    PT. MENARA AGUNG &bull; No. Lamaran: <strong className="text-slate-800 font-mono">{pelamar.no_pendaftaran}</strong>
                  </Text>
                </Stack>
              </div>

              {pelamar.foto_url && (
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
                    <img src={pelamar.foto_url} alt="Pas Foto" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Pas Foto 3x4</span>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500 mt-3 italic">
              * Harap isi seluruh data dengan lengkap, benar, dan teliti sesuai dengan fakta sebenarnya.
            </p>
          </Card>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => {
              const IconComp = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <IconComp size={15} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* TAB 1: IDENTITAS */}
          {activeTab === 1 && (
            <Card>
              <Stack gap={4}>
                <Row gap={2} align="center">
                  <Blob icon="user" tone="purple" size="sm" />
                  <div>
                    <Heading level={3}>1. Data Identitas Pribadi</Heading>
                    <Text size="sm" muted>Informasi identitas kependudukan dan alamat tinggal</Text>
                  </div>
                </Row>
                <Separator />

                <fieldset disabled={isReadOnly} className="space-y-4 border-0 p-0 m-0">
                  <Grid cols={2} gap={4}>
                    <Field label="Nama Lengkap *)" error={errors.nama_lengkap}>
                      {(id) => (
                        <Input
                          id={id}
                          value={data.nama_lengkap}
                          onChange={(val) => setData('nama_lengkap', val)}
                          placeholder="Nama lengkap sesuai KTP"
                          required
                        />
                      )}
                    </Field>

                    <Field label="No. KTP / SIM" error={errors.no_ktp_sim}>
                      {(id) => (
                        <Input
                          id={id}
                          value={data.no_ktp_sim}
                          onChange={(val) => setData('no_ktp_sim', val.replace(/\D/g, '').slice(0, 16))}
                          maxLength={16}
                          inputMode="numeric"
                          placeholder="Contoh: 1371012345678901"
                        />
                      )}
                    </Field>

                    <Field label="Tempat Lahir">
                      {(id) => (
                        <Input
                          id={id}
                          value={data.tempat_lahir}
                          onChange={(val) => setData('tempat_lahir', val)}
                          placeholder="Kota tempat lahir"
                        />
                      )}
                    </Field>

                    <Field label="Tanggal Lahir">
                      {(id) => (
                        <Input
                          id={id}
                          type="date"
                          value={data.tanggal_lahir}
                          onChange={(val) => setData('tanggal_lahir', val)}
                        />
                      )}
                    </Field>

                    <Field label="Agama">
                      {(id) => (
                        <Select
                          id={id}
                          options={AGAMA_OPTIONS}
                          value={data.agama}
                          onChange={(val) => setData('agama', val)}
                        />
                      )}
                    </Field>

                    <Field label="Kewarganegaraan">
                      {(id) => (
                        <Input
                          id={id}
                          value={data.kewarganegaraan}
                          onChange={(val) => setData('kewarganegaraan', val)}
                          placeholder="Indonesia / WNI"
                        />
                      )}
                    </Field>
                  </Grid>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mt-2">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Alamat Lengkap di Padang & Kontak
                    </p>
                    <Grid cols={2} gap={3}>
                      <div className="col-span-full">
                        <Field label="Alamat Lengkap di Padang">
                          {(id) => (
                            <Input
                              id={id}
                              value={data.alamat_padang}
                              onChange={(val) => setData('alamat_padang', val)}
                              placeholder="Alamat jalan, RT/RW, Kelurahan, Kecamatan"
                            />
                          )}
                        </Field>
                      </div>
                      <Field label="No. Telp Rumah di Padang">
                        {(id) => (
                          <Input
                            id={id}
                            value={data.telp_padang}
                            onChange={(val) => setData('telp_padang', val)}
                            placeholder="Contoh: 0751-xxxxxx"
                          />
                        )}
                      </Field>
                      <Field label="No. Handphone / WhatsApp">
                        {(id) => (
                          <Input
                            id={id}
                            value={data.hp_padang}
                            onChange={(val) => setData('hp_padang', val)}
                            placeholder="081234567890"
                          />
                        )}
                      </Field>
                    </Grid>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Alamat Lengkap di Luar Padang (Bila Ada)
                    </p>
                    <Grid cols={2} gap={3}>
                      <div className="col-span-full">
                        <Field label="Alamat Lengkap di Luar Padang">
                          {(id) => (
                            <Input
                              id={id}
                              value={data.alamat_luar_padang}
                              onChange={(val) => setData('alamat_luar_padang', val)}
                              placeholder="Alamat asal / domisili luar kota jika berbeda"
                            />
                          )}
                        </Field>
                      </div>
                      <Field label="No. Telp di Luar Padang">
                        {(id) => (
                          <Input
                            id={id}
                            value={data.telp_luar_padang}
                            onChange={(val) => setData('telp_luar_padang', val)}
                            placeholder="Nomor telepon rumah / kontak asal"
                          />
                        )}
                      </Field>
                    </Grid>
                  </div>
                </fieldset>

                <div className="flex justify-end pt-3">
                  <Button tone="purple" onClick={() => setActiveTab(2)}>
                    Lanjut ke Pendidikan →
                  </Button>
                </div>
              </Stack>
            </Card>
          )}

          {/* TAB 2: PENDIDIKAN */}
          {activeTab === 2 && (
            <Card>
              <Stack gap={5}>
                <Row gap={2} align="center">
                  <Blob icon="settings" tone="blue" size="sm" />
                  <div>
                    <Heading level={3}>2. Riwayat Pendidikan</Heading>
                    <Text size="sm" muted>Pendidikan formal, non-formal, bahasa asing, dan karya ilmiah</Text>
                  </div>
                </Row>
                <Separator />

                <fieldset disabled={isReadOnly} className="space-y-5 border-0 p-0 m-0">
                  {/* 1. Pendidikan Formal Table */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      1. Pendidikan Formal (SLA, Dipl, S-1, S-2)
                    </label>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-20">Jenjang</th>
                            <th className="p-2.5">Nama Sekolah / Universitas</th>
                            <th className="p-2.5">Jurusan</th>
                            <th className="p-2.5">Tempat / Kota</th>
                            <th className="p-2.5 w-28">Tahun (s/d)</th>
                            <th className="p-2.5">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.pendidikan_formal?.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-800">{row.jenjang}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama_sekolah || ''}
                                  onChange={(e) => updateRowItem('pendidikan_formal', idx, 'nama_sekolah', e.target.value)}
                                  placeholder="Nama institusi"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.jurusan || ''}
                                  onChange={(e) => updateRowItem('pendidikan_formal', idx, 'jurusan', e.target.value)}
                                  placeholder="Jurusan"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tempat || ''}
                                  onChange={(e) => updateRowItem('pendidikan_formal', idx, 'tempat', e.target.value)}
                                  placeholder="Kota"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tahun || ''}
                                  onChange={(e) => updateRowItem('pendidikan_formal', idx, 'tahun', e.target.value)}
                                  placeholder="2018 - 2022"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.ket || ''}
                                  onChange={(e) => updateRowItem('pendidikan_formal', idx, 'ket', e.target.value)}
                                  placeholder="Lulus / IPK"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2 & 3 Questions */}
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        2. Apa yang menyebabkan Anda memilih jurusan tersebut di Perguruan Tinggi?
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.alasan_pilih_jurusan || ''}
                        onChange={(e) => setData('alasan_pilih_jurusan', e.target.value)}
                        placeholder="Jelaskan motivasi dan alasan Anda memilih jurusan tersebut..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        3. Sebutkan karya Ilmiah yang pernah Anda buat : (skripsi, artikel, karya tulis, dll)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.karya_ilmiah || ''}
                        onChange={(e) => setData('karya_ilmiah', e.target.value)}
                        placeholder="Judul skripsi / penelitian / publikasi ilmiah yang pernah dibuat..."
                      />
                    </div>
                  </div>

                  {/* 4. Pendidikan Non Formal */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        4. Pendidikan Non Formal / Pelatihan / Kursus
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('pendidikan_non_formal', { nama_kursus: '', tempat: '', tahun: '', ket: '' })}
                        >
                          <IconPlus size={14} /> Tambah Baris
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10">No</th>
                            <th className="p-2.5">Nama Kursus / Pelatihan</th>
                            <th className="p-2.5">Tempat / Lembaga</th>
                            <th className="p-2.5 w-28">Tahun (s/d)</th>
                            <th className="p-2.5">Keterangan</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.pendidikan_non_formal?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama_kursus || ''}
                                  onChange={(e) => updateRowItem('pendidikan_non_formal', idx, 'nama_kursus', e.target.value)}
                                  placeholder="Nama kursus / sertifikasi"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tempat || ''}
                                  onChange={(e) => updateRowItem('pendidikan_non_formal', idx, 'tempat', e.target.value)}
                                  placeholder="Penyelenggara / kota"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tahun || ''}
                                  onChange={(e) => updateRowItem('pendidikan_non_formal', idx, 'tahun', e.target.value)}
                                  placeholder="Tahun"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.ket || ''}
                                  onChange={(e) => updateRowItem('pendidikan_non_formal', idx, 'ket', e.target.value)}
                                  placeholder="Sertifikat / Kompetensi"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.pendidikan_non_formal.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('pendidikan_non_formal', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. Bahasa Asing */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        5. Bahasa Asing yang Dikuasai
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('bahasa_asing', { bahasa: '', lisan: 'Cukup', tertulis: 'Cukup' })}
                        >
                          <IconPlus size={14} /> Tambah Bahasa
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10">No</th>
                            <th className="p-2.5">Bahasa</th>
                            <th className="p-2.5 text-center">Lisan</th>
                            <th className="p-2.5 text-center">Tertulis</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.bahasa_asing?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.bahasa || ''}
                                  onChange={(e) => updateRowItem('bahasa_asing', idx, 'bahasa', e.target.value)}
                                  placeholder="Contoh: Bahasa Inggris / Mandarin / Jepang"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  {KEMAMPUAN_BAHASA_OPTIONS.map((opt) => (
                                    <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`lisan_${idx}`}
                                        value={opt}
                                        checked={row.lisan === opt}
                                        onChange={() => updateRowItem('bahasa_asing', idx, 'lisan', opt)}
                                        className="text-purple-600 focus:ring-purple-500"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  {KEMAMPUAN_BAHASA_OPTIONS.map((opt) => (
                                    <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`tertulis_${idx}`}
                                        value={opt}
                                        checked={row.tertulis === opt}
                                        onChange={() => updateRowItem('bahasa_asing', idx, 'tertulis', opt)}
                                        className="text-purple-600 focus:ring-purple-500"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.bahasa_asing.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('bahasa_asing', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </fieldset>

                <div className="flex justify-between pt-3">
                  <Button variant="quiet" onClick={() => setActiveTab(1)}>
                    ← Kembali ke Identitas
                  </Button>
                  <Button tone="purple" onClick={() => setActiveTab(3)}>
                    Lanjut ke Keluarga →
                  </Button>
                </div>
              </Stack>
            </Card>
          )}

          {/* TAB 3: KELUARGA */}
          {activeTab === 3 && (
            <Card>
              <Stack gap={5}>
                <Row gap={2} align="center">
                  <Blob icon="users" tone="mint" size="sm" />
                  <div>
                    <Heading level={3}>3. Keluarga dan Lingkungan</Heading>
                    <Text size="sm" muted>Status pernikahan, keluarga inti, dan susunan orang tua serta saudara kandung</Text>
                  </div>
                </Row>
                <Separator />

                <fieldset disabled={isReadOnly} className="space-y-5 border-0 p-0 m-0">
                  {/* 1. Status Pernikahan */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                      1. Status Pernikahan
                    </label>
                    <Grid cols={2} gap={4}>
                      <Field label="Status Pernikahan Saat Ini">
                        {(id) => (
                          <Select
                            id={id}
                            options={[
                              { value: 'Single / Tunangan', label: 'Single / Tunangan' },
                              { value: 'Menikah', label: 'Menikah' },
                              { value: 'Bercerai', label: 'Bercerai' },
                            ]}
                            value={data.status_pernikahan || 'Single / Tunangan'}
                            onChange={(val) => setData('status_pernikahan', val)}
                          />
                        )}
                      </Field>

                      <Field label="Sejak Tanggal (Bila Berkeluarga / Tunangan / Cerai)">
                        {(id) => (
                          <Input
                            id={id}
                            type="date"
                            value={data.status_pernikahan_sejak || ''}
                            onChange={(val) => setData('status_pernikahan_sejak', val)}
                          />
                        )}
                      </Field>
                    </Grid>
                  </div>

                  {/* 2. Status Keluarga (Suami / Istri dan anak) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Status Keluarga (Suami / Istri dan Anak)
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('keluarga_inti', { status: 'Anak', nama: '', jenis_kelamin: '', tempat_tgl_lahir: '', pendidikan: '', pekerjaan: '' })}
                        >
                          <IconPlus size={14} /> Tambah Anggota
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-28">Status</th>
                            <th className="p-2.5">Nama Lengkap</th>
                            <th className="p-2.5 w-24 text-center">L / P</th>
                            <th className="p-2.5">Tempat / Tgl Lahir</th>
                            <th className="p-2.5">Pendidikan</th>
                            <th className="p-2.5">Pekerjaan</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.keluarga_inti?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 font-bold text-slate-700">{row.status}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama || ''}
                                  onChange={(e) => updateRowItem('keluarga_inti', idx, 'nama', e.target.value)}
                                  placeholder="Nama"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <select
                                  className="px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                                  value={row.jenis_kelamin || ''}
                                  onChange={(e) => updateRowItem('keluarga_inti', idx, 'jenis_kelamin', e.target.value)}
                                >
                                  <option value="">-</option>
                                  <option value="L">L</option>
                                  <option value="P">P</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tempat_tgl_lahir || ''}
                                  onChange={(e) => updateRowItem('keluarga_inti', idx, 'tempat_tgl_lahir', e.target.value)}
                                  placeholder="Padang, 01-01-2000"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.pendidikan || ''}
                                  onChange={(e) => updateRowItem('keluarga_inti', idx, 'pendidikan', e.target.value)}
                                  placeholder="SMA / S1 / Belum"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.pekerjaan || ''}
                                  onChange={(e) => updateRowItem('keluarga_inti', idx, 'pekerjaan', e.target.value)}
                                  placeholder="Pekerjaan saat ini"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.keluarga_inti.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('keluarga_inti', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. Susunan Keluarga (Ayah, Ibu, Saudara sekandung termasuk anda) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        3. Susunan Keluarga (Ayah, Ibu, Saudara Sekandung Termasuk Anda)
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('susunan_keluarga', { status: 'Anak', nama: '', jenis_kelamin: '', tempat_tgl_lahir: '', pendidikan: '', pekerjaan: '' })}
                        >
                          <IconPlus size={14} /> Tambah Saudara
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-28">Status</th>
                            <th className="p-2.5">Nama Lengkap</th>
                            <th className="p-2.5 w-24 text-center">L / P</th>
                            <th className="p-2.5">Tempat / Tgl Lahir</th>
                            <th className="p-2.5">Pendidikan</th>
                            <th className="p-2.5">Pekerjaan</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.susunan_keluarga?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 font-bold text-slate-700">{row.status}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama || ''}
                                  onChange={(e) => updateRowItem('susunan_keluarga', idx, 'nama', e.target.value)}
                                  placeholder="Nama"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <select
                                  className="px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                                  value={row.jenis_kelamin || ''}
                                  onChange={(e) => updateRowItem('susunan_keluarga', idx, 'jenis_kelamin', e.target.value)}
                                >
                                  <option value="">-</option>
                                  <option value="L">L</option>
                                  <option value="P">P</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tempat_tgl_lahir || ''}
                                  onChange={(e) => updateRowItem('susunan_keluarga', idx, 'tempat_tgl_lahir', e.target.value)}
                                  placeholder="Tempat, Tgl Lahir"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.pendidikan || ''}
                                  onChange={(e) => updateRowItem('susunan_keluarga', idx, 'pendidikan', e.target.value)}
                                  placeholder="Pendidikan"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.pekerjaan || ''}
                                  onChange={(e) => updateRowItem('susunan_keluarga', idx, 'pekerjaan', e.target.value)}
                                  placeholder="Pekerjaan"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.susunan_keluarga.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('susunan_keluarga', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </fieldset>

                <div className="flex justify-between pt-3">
                  <Button variant="quiet" onClick={() => setActiveTab(2)}>
                    ← Kembali ke Pendidikan
                  </Button>
                  <Button tone="purple" onClick={() => setActiveTab(4)}>
                    Lanjut ke Riwayat Kerja →
                  </Button>
                </div>
              </Stack>
            </Card>
          )}

          {/* TAB 4: RIWAYAT PEKERJAAN */}
          {activeTab === 4 && (
            <Card>
              <Stack gap={5}>
                <Row gap={2} align="center">
                  <Blob icon="target" tone="purple" size="sm" />
                  <div>
                    <Heading level={3}>4. Riwayat Pekerjaan</Heading>
                    <Text size="sm" muted>Pengalaman kerja, atasan, bawahan, tantangan, dan penyelesaian masalah</Text>
                  </div>
                </Row>
                <Separator />

                <fieldset disabled={isReadOnly} className="space-y-5 border-0 p-0 m-0">
                  {/* 1. Pengalaman Kerja Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        1. Pengalaman Kerja
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('pengalaman_kerja', { nama_perusahaan: '', jabatan: '', periode: '', gaji: '', alasan_pindah: '' })}
                        >
                          <IconPlus size={14} /> Tambah Pengalaman
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10">No</th>
                            <th className="p-2.5">Nama Perusahaan</th>
                            <th className="p-2.5">Jabatan</th>
                            <th className="p-2.5 w-28">Periode (s/d)</th>
                            <th className="p-2.5 w-28">Gaji Terakhir</th>
                            <th className="p-2.5">Alasan Pindah</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.pengalaman_kerja?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama_perusahaan || ''}
                                  onChange={(e) => updateRowItem('pengalaman_kerja', idx, 'nama_perusahaan', e.target.value)}
                                  placeholder="PT. Menara Agung"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.jabatan || ''}
                                  onChange={(e) => updateRowItem('pengalaman_kerja', idx, 'jabatan', e.target.value)}
                                  placeholder="Staff / Supervisor"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.periode || ''}
                                  onChange={(e) => updateRowItem('pengalaman_kerja', idx, 'periode', e.target.value)}
                                  placeholder="2020 - 2023"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.gaji || ''}
                                  onChange={(e) => updateRowItem('pengalaman_kerja', idx, 'gaji', e.target.value)}
                                  placeholder="Rp. 5.000.000"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.alasan_pindah || ''}
                                  onChange={(e) => updateRowItem('pengalaman_kerja', idx, 'alasan_pindah', e.target.value)}
                                  placeholder="Alasan pindah / resign"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.pengalaman_kerja.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('pengalaman_kerja', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. Gambaran Singkat Jabatan */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      2. Berikan gambaran singkat mengenai jabatan-jabatan di atas !
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.gambaran_jabatan || ''}
                      onChange={(e) => setData('gambaran_jabatan', e.target.value)}
                      placeholder="Uraikan tugas, tanggung jawab, dan pencapaian utama Anda..."
                    />
                  </div>

                  {/* 3. Atasan & Jumlah Bawahan */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        3. Sebutkan siapa yang pernah menjadi atasan Anda, dan jumlah bawahan Anda saat itu :
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('atasan_bawahan', { nama: '', jabatan: '', perusahaan: '', jumlah_bawahan: '' })}
                        >
                          <IconPlus size={14} /> Tambah Atasan
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10">No</th>
                            <th className="p-2.5">Nama Atasan</th>
                            <th className="p-2.5">Jabatan Atasan</th>
                            <th className="p-2.5">Perusahaan</th>
                            <th className="p-2.5 w-32">Jumlah Bawahan Anda</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.atasan_bawahan?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama || ''}
                                  onChange={(e) => updateRowItem('atasan_bawahan', idx, 'nama', e.target.value)}
                                  placeholder="Nama atasan"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.jabatan || ''}
                                  onChange={(e) => updateRowItem('atasan_bawahan', idx, 'jabatan', e.target.value)}
                                  placeholder="Manager / Direktur"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.perusahaan || ''}
                                  onChange={(e) => updateRowItem('atasan_bawahan', idx, 'perusahaan', e.target.value)}
                                  placeholder="Perusahaan"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.jumlah_bawahan || ''}
                                  onChange={(e) => updateRowItem('atasan_bawahan', idx, 'jumlah_bawahan', e.target.value)}
                                  placeholder="Contoh: 3 orang"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.atasan_bawahan.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('atasan_bawahan', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4, 5, 6 Questions */}
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        4. Masalah penting apa saja yang pernah Anda hadapi dalam pekerjaan, dan bagaimana mengatasinya ?
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.masalah_kerja_dan_solusi || ''}
                        onChange={(e) => setData('masalah_kerja_dan_solusi', e.target.value)}
                        placeholder="Ceritakan situasi masalah dan tindakan pemecahan yang Anda ambil..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        5. Ceritakanlah pandangan / kesan Anda terhadap perusahaan tersebut diatas.
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.kesan_perusahaan_sebelumnya || ''}
                        onChange={(e) => setData('kesan_perusahaan_sebelumnya', e.target.value)}
                        placeholder="Pandangan dan kesan Anda..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        6. Bagaimana bila Anda menghadapi persoalan dalam pekerjaan dan harus mengambil keputusan ?
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.penanganan_masalah_keputusan || ''}
                        onChange={(e) => setData('penanganan_masalah_keputusan', e.target.value)}
                        placeholder="Metode atau pola Anda dalam mengambil keputusan di bawah tekanan..."
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="flex justify-between pt-3">
                  <Button variant="quiet" onClick={() => setActiveTab(3)}>
                    ← Kembali ke Keluarga
                  </Button>
                  <Button tone="purple" onClick={() => setActiveTab(5)}>
                    Lanjut ke Minat & Pribadi →
                  </Button>
                </div>
              </Stack>
            </Card>
          )}

          {/* TAB 5: MINAT DAN KONSEP PRIBADI */}
          {activeTab === 5 && (
            <Card>
              <Stack gap={5}>
                <Row gap={2} align="center">
                  <Blob icon="settings" tone="blue" size="sm" />
                  <div>
                    <Heading level={3}>5. Minat dan Konsep Pribadi</Heading>
                    <Text size="sm" muted>Ekspektasi karir, kompensasi, kesiapan penempatan, dan pola kerja</Text>
                  </div>
                </Row>
                <Separator />

                <fieldset disabled={isReadOnly} className="space-y-4 border-0 p-0 m-0">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      1. Uraikan yang menjadi cita-cita Anda :
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.cita_cita || ''}
                      onChange={(e) => setData('cita_cita', e.target.value)}
                      placeholder="Cita-cita dan target jangka panjang Anda..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      2. Apa yang mendorong Anda ingin bekerja ?
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.pendorong_kerja || ''}
                      onChange={(e) => setData('pendorong_kerja', e.target.value)}
                      placeholder="Motivasi utama Anda ingin bekerja..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      3. Mengapa Anda ingin bekerja di Perusahaan kami ?
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.alasan_melamar_perusahaan || ''}
                      onChange={(e) => setData('alasan_melamar_perusahaan', e.target.value)}
                      placeholder="Alasan memilih PT. Menara Agung..."
                    />
                  </div>

                  <Grid cols={2} gap={4}>
                    <Field label="4. Berapa gaji yang Anda inginkan ? (Rp.)">
                      {(id) => (
                        <Input
                          id={id}
                          value={data.gaji_diharapkan}
                          onChange={(val) => setData('gaji_diharapkan', val)}
                          placeholder="Contoh: Rp. 5.000.000 / Nego"
                        />
                      )}
                    </Field>

                    <Field label="5. Kapan Anda dapat mulai bekerja ?">
                      {(id) => (
                        <Input
                          id={id}
                          value={data.kapan_mulai_kerja}
                          onChange={(val) => setData('kapan_mulai_kerja', val)}
                          placeholder="Secepatnya / 1 bulan setelah offering"
                        />
                      )}
                    </Field>
                  </Grid>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      6. Sebutkan fasilitas lainnya yang Anda harapkan !
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.fasilitas_diharapkan || ''}
                      onChange={(e) => setData('fasilitas_diharapkan', e.target.value)}
                      placeholder="BPJS Kesehatan & Ketenagakerjaan, jenjang karir, dll..."
                    />
                  </div>

                  {/* 7. Bersedia Luar Daerah */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      7. Bersediakah Anda ditempatkan di luar daerah ?
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="radio"
                          name="bersedia_luar_daerah"
                          value="Bersedia"
                          checked={data.bersedia_luar_daerah === 'Bersedia'}
                          onChange={() => setData('bersedia_luar_daerah', 'Bersedia')}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span>Bersedia</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="radio"
                          name="bersedia_luar_daerah"
                          value="Tidak Bersedia"
                          checked={data.bersedia_luar_daerah === 'Tidak Bersedia'}
                          onChange={() => setData('bersedia_luar_daerah', 'Tidak Bersedia')}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span>Tidak Bersedia</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      8. Sebutkan type orang yang Anda senangi.
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.tipe_orang_disenangi || ''}
                      onChange={(e) => setData('tipe_orang_disenangi', e.target.value)}
                      placeholder="Karakter rekan kerja atau pemimpin yang Anda sukai..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      9. Terhadap hal apa saja Anda sulit mengambil keputusan :
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.hal_sulit_ambil_keputusan || ''}
                      onChange={(e) => setData('hal_sulit_ambil_keputusan', e.target.value)}
                      placeholder="Situasi atau kondisi di mana Anda merasa memerlukan pertimbangan ekstra..."
                    />
                  </div>
                </fieldset>

                <div className="flex justify-between pt-3">
                  <Button variant="quiet" onClick={() => setActiveTab(4)}>
                    ← Kembali ke Riwayat Kerja
                  </Button>
                  <Button tone="purple" onClick={() => setActiveTab(6)}>
                    Lanjut ke Aktivitas Sosial →
                  </Button>
                </div>
              </Stack>
            </Card>
          )}

          {/* TAB 6: AKTIVITAS SOSIAL */}
          {activeTab === 6 && (
            <Card>
              <Stack gap={5}>
                <Row gap={2} align="center">
                  <Blob icon="database" tone="blue" size="sm" />
                  <div>
                    <Heading level={3}>6. Aktivitas Sosial & Organisasi</Heading>
                    <Text size="sm" muted>Kenalan internal, referensi kerja, hobi, dan riwayat organisasi</Text>
                  </div>
                </Row>
                <Separator />

                <fieldset disabled={isReadOnly} className="space-y-5 border-0 p-0 m-0">
                  {/* 1. Kenalan di Perusahaan */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        1. Adakah kenalan Anda di Perusahaan kami ?
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                          <input
                            type="radio"
                            name="ada_kenalan_perusahaan"
                            value="Ada"
                            checked={data.ada_kenalan_perusahaan === 'Ada'}
                            onChange={() => setData('ada_kenalan_perusahaan', 'Ada')}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Ada</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                          <input
                            type="radio"
                            name="ada_kenalan_perusahaan"
                            value="Tidak ada"
                            checked={data.ada_kenalan_perusahaan === 'Tidak ada'}
                            onChange={() => setData('ada_kenalan_perusahaan', 'Tidak ada')}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Tidak ada</span>
                        </label>
                      </div>
                    </div>

                    {data.ada_kenalan_perusahaan === 'Ada' && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5 w-10">No</th>
                              <th className="p-2.5">Nama</th>
                              <th className="p-2.5">Perusahaan / Cabang</th>
                              <th className="p-2.5">Jabatan</th>
                              <th className="p-2.5">No. Telp</th>
                              <th className="p-2.5">Hubungan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data.kenalan_perusahaan?.map((row: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.nama || ''}
                                    onChange={(e) => updateRowItem('kenalan_perusahaan', idx, 'nama', e.target.value)}
                                    placeholder="Nama kenalan"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.perusahaan || ''}
                                    onChange={(e) => updateRowItem('kenalan_perusahaan', idx, 'perusahaan', e.target.value)}
                                    placeholder="Cabang / PT"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.jabatan || ''}
                                    onChange={(e) => updateRowItem('kenalan_perusahaan', idx, 'jabatan', e.target.value)}
                                    placeholder="Jabatan"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.no_telp || ''}
                                    onChange={(e) => updateRowItem('kenalan_perusahaan', idx, 'no_telp', e.target.value)}
                                    placeholder="0812xxxx"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.hubungan || ''}
                                    onChange={(e) => updateRowItem('kenalan_perusahaan', idx, 'hubungan', e.target.value)}
                                    placeholder="Teman / Saudara"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 2. Referensi */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Sebutkan Referensi Anda :
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('referensi', { nama: '', perusahaan: '', jabatan: '', no_telp: '', hubungan: '' })}
                        >
                          <IconPlus size={14} /> Tambah Referensi
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10">No</th>
                            <th className="p-2.5">Nama</th>
                            <th className="p-2.5">Perusahaan</th>
                            <th className="p-2.5">Jabatan</th>
                            <th className="p-2.5">No. Telp</th>
                            <th className="p-2.5">Hubungan</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.referensi?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama || ''}
                                  onChange={(e) => updateRowItem('referensi', idx, 'nama', e.target.value)}
                                  placeholder="Nama referensi"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.perusahaan || ''}
                                  onChange={(e) => updateRowItem('referensi', idx, 'perusahaan', e.target.value)}
                                  placeholder="Perusahaan"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.jabatan || ''}
                                  onChange={(e) => updateRowItem('referensi', idx, 'jabatan', e.target.value)}
                                  placeholder="Jabatan"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.no_telp || ''}
                                  onChange={(e) => updateRowItem('referensi', idx, 'no_telp', e.target.value)}
                                  placeholder="0812xxxx"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.hubungan || ''}
                                  onChange={(e) => updateRowItem('referensi', idx, 'hubungan', e.target.value)}
                                  placeholder="Mantan Atasan / Dosen"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.referensi.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('referensi', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3 & 4 Questions */}
                  <Grid cols={2} gap={4}>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        3. Apakah hobby / kegemaran Anda ?
                      </label>
                      <textarea
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.hobi || ''}
                        onChange={(e) => setData('hobi', e.target.value)}
                        placeholder="Membaca, olahraga, coding, desain, dll..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        4. Bagaimana cara Anda mengisi waktu luang ?
                      </label>
                      <textarea
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.cara_mengisi_waktu_luang || ''}
                        onChange={(e) => setData('cara_mengisi_waktu_luang', e.target.value)}
                        placeholder="Aktivitas di akhir pekan atau hari libur..."
                      />
                    </div>
                  </Grid>

                  {/* 5. Organisasi */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        5. Organisasi yang Pernah Anda Ikuti ?
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('organisasi', { nama_organisasi: '', tempat: '', jabatan: '', periode: '' })}
                        >
                          <IconPlus size={14} /> Tambah Organisasi
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10">No</th>
                            <th className="p-2.5">Nama Organisasi</th>
                            <th className="p-2.5">Tempat / Lembaga</th>
                            <th className="p-2.5">Jabatan</th>
                            <th className="p-2.5 w-32">Periode (s/d)</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.organisasi?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.nama_organisasi || ''}
                                  onChange={(e) => updateRowItem('organisasi', idx, 'nama_organisasi', e.target.value)}
                                  placeholder="BEM / Himpunan / Komunitas"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tempat || ''}
                                  onChange={(e) => updateRowItem('organisasi', idx, 'tempat', e.target.value)}
                                  placeholder="Kampus / Kota"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.jabatan || ''}
                                  onChange={(e) => updateRowItem('organisasi', idx, 'jabatan', e.target.value)}
                                  placeholder="Ketua / Anggota"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.periode || ''}
                                  onChange={(e) => updateRowItem('organisasi', idx, 'periode', e.target.value)}
                                  placeholder="2019 - 2021"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.organisasi.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('organisasi', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </fieldset>

                <div className="flex justify-between pt-3">
                  <Button variant="quiet" onClick={() => setActiveTab(5)}>
                    ← Kembali ke Minat & Pribadi
                  </Button>
                  <Button tone="purple" onClick={() => setActiveTab(7)}>
                    Lanjut ke Lain-lain & Konfirmasi →
                  </Button>
                </div>
              </Stack>
            </Card>
          )}

          {/* TAB 7: LAIN-LAIN & KONFIRMASI */}
          {activeTab === 7 && (
            <Card>
              <Stack gap={5}>
                <Row gap={2} align="center">
                  <Blob icon="form" tone="mint" size="sm" />
                  <div>
                    <Heading level={3}>7. Lain - lain & Pernyataan Kebenaran</Heading>
                    <Text size="sm" muted>Riwayat psikotest, evaluasi diri, riwayat kesehatan, dan pernyataan hukum</Text>
                  </div>
                </Row>
                <Separator />

                <fieldset disabled={isReadOnly} className="space-y-5 border-0 p-0 m-0">
                  {/* 1. Psikotest */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        1. Pernahkah Anda mengikuti psikotest sebelumnya :
                      </label>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="quiet"
                          tone="purple"
                          onClick={() => addRow('riwayat_psikotest', { waktu: '', tempat: '', tujuan: '' })}
                        >
                          <IconPlus size={14} /> Tambah Baris
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-10">No</th>
                            <th className="p-2.5 w-32">Waktu (Bulan/Thn)</th>
                            <th className="p-2.5">Tempat / Lembaga</th>
                            <th className="p-2.5">Tujuan</th>
                            {!isReadOnly && <th className="p-2.5 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.riwayat_psikotest?.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.waktu || ''}
                                  onChange={(e) => updateRowItem('riwayat_psikotest', idx, 'waktu', e.target.value)}
                                  placeholder="Contoh: Jan 2023"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tempat || ''}
                                  onChange={(e) => updateRowItem('riwayat_psikotest', idx, 'tempat', e.target.value)}
                                  placeholder="Tempat / Biro Psikologi"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                  value={row.tujuan || ''}
                                  onChange={(e) => updateRowItem('riwayat_psikotest', idx, 'tujuan', e.target.value)}
                                  placeholder="Seleksi kerja / peminatan"
                                />
                              </td>
                              {!isReadOnly && (
                                <td className="p-2 text-center">
                                  {data.riwayat_psikotest.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeRow('riwayat_psikotest', idx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <IconTrash size={14} />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2 & 3 Questions */}
                  <Grid cols={2} gap={4}>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        2. Apa yang menjadi kekuatan ( strong point ) Anda ?
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.kekuatan_diri || ''}
                        onChange={(e) => setData('kekuatan_diri', e.target.value)}
                        placeholder="Kelebihan, kompetensi utama, atau keunggulan diri Anda..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        3. Apa yang Anda rasakan perlu diperbaiki ( weak point ) pada diri Anda ?
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                        value={data.kelemahan_diri || ''}
                        onChange={(e) => setData('kelemahan_diri', e.target.value)}
                        placeholder="Area perbaikan atau kelemahan yang sedang Anda kembangkan..."
                      />
                    </div>
                  </Grid>

                  {/* 4. Riwayat Sakit Lama */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        4. Pernahkah Anda menderita sakit yang lama sembuh ?
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                          <input
                            type="radio"
                            name="pernah_sakit_lama"
                            value="Pernah"
                            checked={data.pernah_sakit_lama === 'Pernah'}
                            onChange={() => setData('pernah_sakit_lama', 'Pernah')}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Pernah</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                          <input
                            type="radio"
                            name="pernah_sakit_lama"
                            value="Tidak pernah"
                            checked={data.pernah_sakit_lama === 'Tidak pernah'}
                            onChange={() => setData('pernah_sakit_lama', 'Tidak pernah')}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Tidak pernah</span>
                        </label>
                      </div>
                    </div>

                    {data.pernah_sakit_lama === 'Pernah' && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5 w-10">No</th>
                              <th className="p-2.5">Nama Penyakit</th>
                              <th className="p-2.5 w-36">Periode (... s/d ...)</th>
                              <th className="p-2.5">Akibatnya</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data.riwayat_penyakit?.map((row: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.nama_penyakit || ''}
                                    onChange={(e) => updateRowItem('riwayat_penyakit', idx, 'nama_penyakit', e.target.value)}
                                    placeholder="Nama penyakit"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.periode || ''}
                                    onChange={(e) => updateRowItem('riwayat_penyakit', idx, 'periode', e.target.value)}
                                    placeholder="Contoh: 2021"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                    value={row.akibat || ''}
                                    onChange={(e) => updateRowItem('riwayat_penyakit', idx, 'akibat', e.target.value)}
                                    placeholder="Sembuh total / dll"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 5. Gangguan Jasmani */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      5. Apakah ada gangguan jasmani yang tetap / kerap mengganggu Anda ?
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white disabled:bg-slate-50"
                      value={data.gangguan_jasmani || ''}
                      onChange={(e) => setData('gangguan_jasmani', e.target.value)}
                      placeholder="Isi '-' jika tidak ada gangguan jasmani..."
                    />
                  </div>

                  {/* 6. Legal Declaration Card */}
                  <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950">
                    <div className="flex items-start gap-3">
                      <IconInfoCircle size={22} className="text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                          Pernyataan dan Persetujuan Hukum
                        </p>
                        <p className="text-xs leading-relaxed text-amber-900 italic">
                          &quot;Diisi dengan sesungguhnya. Apabila dikemudian hari ternyata ada hal-hal yang bertentangan, maka saya bersedia dituntut sesuai dengan hukum yang berlaku dan lamaran ini dapat dibatalkan.&quot;
                        </p>

                        <label className="mt-3.5 flex items-center gap-2 cursor-pointer font-bold text-xs text-amber-950">
                          <input
                            type="checkbox"
                            checked={data.pernyataan_kebenaran}
                            onChange={(e) => setData('pernyataan_kebenaran', e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span>Saya menyetujui pernyataan di atas dan menyatakan data formulir ini adalah benar.</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <div className="flex justify-between pt-3">
                  <Button variant="quiet" onClick={() => setActiveTab(6)}>
                    ← Kembali ke Aktivitas Sosial
                  </Button>
                  {isReadOnly && (
                    <Button
                      tone="purple"
                      onClick={() => router.visit(`/kandidat/lamaran/${pelamar.no_pendaftaran}`)}
                    >
                      Kembali ke Detail Lamaran
                    </Button>
                  )}
                </div>
              </Stack>
            </Card>
          )}

         
        </Stack>
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog
        open={confirmSubmitModal}
        onOpenChange={(open) => setConfirmSubmitModal(open)}
        title="Konfirmasi Pengiriman Formulir"
      >
        <Stack gap={4}>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-sm">
            <IconAlertCircle size={22} className="text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Apakah Anda yakin ingin mengirim formulir ini?</p>
              <p className="mt-1 text-xs text-purple-800">
                Seluruh data identitas, pendidikan, keluarga, dan pengalaman kerja akan dikirimkan secara resmi ke Tim Rekrutmen PT. Menara Agung. Setelah dikirim, Anda tidak dapat mengedit formulir ini kembali.
              </p>
            </div>
          </div>

          <Row justify="end" gap={2}>
            <Button variant="quiet" onClick={() => setConfirmSubmitModal(false)}>
              Batal
            </Button>
            <Button tone="mint" loading={processing} onClick={handleFinalSubmit}>
              <IconCheck size={16} />
              Ya, Kirim Sekarang
            </Button>
          </Row>
        </Stack>
      </Dialog>
    </AppLayout>
  )
}
