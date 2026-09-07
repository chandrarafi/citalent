import { useState, useRef, useEffect } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import { Badge, Blob } from '@/components/pouf/media'
import { Select, Dialog } from '@/components/pouf/controls'
import { Checkbox } from '@/components/pouf/checkbox'
import { RichContentViewer } from '@/components/pouf/RichTextEditor'
import {
  IconFileTypePdf,
  IconPhoto,
  IconEye,
  IconTrash,
  IconUpload,
  IconExternalLink,
  IconAlertCircle,
  IconCircleCheck,
  IconSparkles,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react'

interface LowonganData {
  id: number
  kode_lowongan: string
  slug: string
  judul: string
  posisi_nama: string
  departement_nama: string
  kd_departement: string
  jumlah_dibutuhkan: number
  lokasi_kerja: string
  tipe_pekerjaan: string
  deskripsi: string | null
  kualifikasi: string | null
  tgl_buka: string | null
  tgl_tutup: string | null
  is_closed: boolean
  status: string
}

interface Props {
  lowongan: LowonganData
}

const JENIS_KELAMIN_OPTIONS = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
]

const STATUS_PERNIKAHAN_OPTIONS = [
  { value: 'Belum Menikah', label: 'Belum Menikah' },
  { value: 'Menikah', label: 'Menikah' },
  { value: 'Cerai', label: 'Cerai' },
]

const AGAMA_OPTIONS = [
  { value: 'Islam', label: 'Islam' },
  { value: 'Kristen', label: 'Kristen Protestan' },
  { value: 'Katolik', label: 'Katolik' },
  { value: 'Hindu', label: 'Hindu' },
  { value: 'Buddha', label: 'Buddha' },
  { value: 'Konghucu', label: 'Konghucu' },
  { value: 'Lainnya', label: 'Lainnya' },
]

const PENDIDIKAN_OPTIONS = [
  { value: 'SMA/SMK', label: 'SMA / SMK / Sederajat' },
  { value: 'D3', label: 'Diploma 3 (D3)' },
  { value: 'D4/S1', label: 'Sarjana / Diploma 4 (S1 / D4)' },
  { value: 'S2', label: 'Magister / Master (S2)' },
  { value: 'S3', label: 'Doktoral (S3)' },
]

export default function Apply({ lowongan }: Props) {
  const { flash } = usePage<any>().props
  const applicationSuccess = flash?.application_success

  // Photo metadata & animation states
  const [fotoFileName, setFotoFileName] = useState<string>('')
  const [fotoFileSize, setFotoFileSize] = useState<string>('')
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null)
  const [fotoProgress, setFotoProgress] = useState<number>(0)
  const [isUploadingFoto, setIsUploadingFoto] = useState<boolean>(false)

  // File metadata & animation states
  const [cvFileName, setCvFileName] = useState<string>('')
  const [cvFileSize, setCvFileSize] = useState<string>('')
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null)
  const [cvProgress, setCvProgress] = useState<number>(0)
  const [isUploadingCv, setIsUploadingCv] = useState<boolean>(false)
  const [isDraggingCv, setIsDraggingCv] = useState<boolean>(false)

  const [suratFileName, setSuratFileName] = useState<string>('')
  const [suratFileSize, setSuratFileSize] = useState<string>('')
  const [suratPreviewUrl, setSuratPreviewUrl] = useState<string | null>(null)
  const [suratProgress, setSuratProgress] = useState<number>(0)
  const [isUploadingSurat, setIsUploadingSurat] = useState<boolean>(false)
  const [isDraggingSurat, setIsDraggingSurat] = useState<boolean>(false)

  // Preview Modal
  const [previewModal, setPreviewModal] = useState<{
    open: boolean
    title: string
    url: string | null
  }>({
    open: false,
    title: '',
    url: null,
  })

  const fotoUrlRef = useRef<string | null>(null)
  const cvUrlRef = useRef<string | null>(null)
  const suratUrlRef = useRef<string | null>(null)

  // Cleanup object URLs ONLY when component unmounts
  useEffect(() => {
    return () => {
      if (fotoUrlRef.current) URL.revokeObjectURL(fotoUrlRef.current)
      if (cvUrlRef.current) URL.revokeObjectURL(cvUrlRef.current)
      if (suratUrlRef.current) URL.revokeObjectURL(suratUrlRef.current)
    }
  }, [])

  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)
  const [fileAlertDialog, setFileAlertDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(Boolean(applicationSuccess))

  // Auto open success dialog if applicationSuccess exists
  useEffect(() => {
    if (applicationSuccess) {
      setShowSuccessDialog(true)
    }
  }, [applicationSuccess])

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  function handleFotoChange(file: File | null) {
    if (fotoUrlRef.current) {
      URL.revokeObjectURL(fotoUrlRef.current)
      fotoUrlRef.current = null
    }

    if (!file) {
      setData('foto_file', null)
      setFotoFileName('')
      setFotoFileSize('')
      setFotoPreviewUrl(null)
      setFotoProgress(0)
      setIsUploadingFoto(false)
      return
    }

    // Must be image
    if (!file.type.startsWith('image/')) {
      setFileAlertDialog({
        open: true,
        message: `File "${file.name}" bukan merupakan file gambar. Harap unggah file foto dengan format JPG, JPEG, PNG, atau WEBP.`,
      })
      return
    }

    // 2 MB Maximum Limit Check (2048 KB)
    if (file.size > 2 * 1024 * 1024) {
      setFileAlertDialog({
        open: true,
        message: `Ukuran file pas foto "${file.name}" (${formatFileSize(file.size)}) melebihi batas maksimal 2 MB. Silakan gunakan file foto yang lebih kecil.`,
      })
      return
    }

    const url = URL.createObjectURL(file)
    fotoUrlRef.current = url

    setIsUploadingFoto(true)
    setFotoProgress(30)
    setData('foto_file', file)
    setFotoFileName(file.name)
    setFotoFileSize(formatFileSize(file.size))

    setTimeout(() => setFotoProgress(75), 100)
    setTimeout(() => {
      setFotoProgress(100)
      setIsUploadingFoto(false)
      setFotoPreviewUrl(url)
    }, 280)
  }

  function handleCvChange(file: File | null) {
    if (cvUrlRef.current) {
      URL.revokeObjectURL(cvUrlRef.current)
      cvUrlRef.current = null
    }

    if (!file) {
      setData('cv_file', null)
      setCvFileName('')
      setCvFileSize('')
      setCvPreviewUrl(null)
      setCvProgress(0)
      setIsUploadingCv(false)
      return
    }

    // 2 MB Maximum Limit Check (2048 KB)
    if (file.size > 2 * 1024 * 1024) {
      setFileAlertDialog({
        open: true,
        message: `Ukuran file "${file.name}" (${formatFileSize(file.size)}) melebihi batas maksimal 2 MB. Silakan kompres dokumen Anda atau gunakan file lain.`,
      })
      return
    }

    const url = URL.createObjectURL(file)
    cvUrlRef.current = url

    setIsUploadingCv(true)
    setCvProgress(25)
    setData('cv_file', file)
    setCvFileName(file.name)
    setCvFileSize(formatFileSize(file.size))

    setTimeout(() => setCvProgress(70), 120)
    setTimeout(() => {
      setCvProgress(100)
      setIsUploadingCv(false)
      setCvPreviewUrl(url)
    }, 320)
  }

  function handleSuratChange(file: File | null) {
    if (suratUrlRef.current) {
      URL.revokeObjectURL(suratUrlRef.current)
      suratUrlRef.current = null
    }

    if (!file) {
      setData('surat_lamaran_file', null)
      setSuratFileName('')
      setSuratFileSize('')
      setSuratPreviewUrl(null)
      setSuratProgress(0)
      setIsUploadingSurat(false)
      return
    }

    // 2 MB Maximum Limit Check (2048 KB)
    if (file.size > 2 * 1024 * 1024) {
      setFileAlertDialog({
        open: true,
        message: `Ukuran file "${file.name}" (${formatFileSize(file.size)}) melebihi batas maksimal 2 MB. Silakan kompres dokumen Anda atau gunakan file lain.`,
      })
      return
    }

    const url = URL.createObjectURL(file)
    suratUrlRef.current = url

    setIsUploadingSurat(true)
    setSuratProgress(25)
    setData('surat_lamaran_file', file)
    setSuratFileName(file.name)
    setSuratFileSize(formatFileSize(file.size))

    setTimeout(() => setSuratProgress(70), 120)
    setTimeout(() => {
      setSuratProgress(100)
      setIsUploadingSurat(false)
      setSuratPreviewUrl(url)
    }, 320)
  }

  const { data, setData, post, processing, errors, reset } = useForm<{
    nama_lengkap: string
    tempat_lahir: string
    tanggal_lahir: string
    jenis_kelamin: string
    status_pernikahan: string
    agama: string
    alamat: string
    domisili: string
    nomor_kontak: string
    email: string
    pendidikan_terakhir: string
    nama_institusi: string
    jurusan: string
    tahun_lulus: string
    posisi_dilamar: string
    foto_file: File | null
    cv_file: File | null
    surat_lamaran_file: File | null
    pernyataan_kebenaran: boolean
  }>({
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    status_pernikahan: 'Belum Menikah',
    agama: 'Islam',
    alamat: '',
    domisili: '',
    nomor_kontak: '',
    email: '',
    pendidikan_terakhir: 'D4/S1',
    nama_institusi: '',
    jurusan: '',
    tahun_lulus: '',
    posisi_dilamar: lowongan.posisi_nama || lowongan.judul,
    foto_file: null,
    cv_file: null,
    surat_lamaran_file: null,
    pernyataan_kebenaran: false,
  })

  const [copiedRegNo, setCopiedRegNo] = useState<boolean>(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(`/karir/${lowongan.slug}/apply`, {
      forceFormData: true,
      onSuccess: () => {
        reset()
        handleFotoChange(null)
        handleCvChange(null)
        handleSuratChange(null)
        setShowSuccessDialog(true)
      },
      onError: () => {
        // Open validation error dialog
        setShowErrorDialog(true)
      },
    })
  }

  function handleCopyRegNo(no: string) {
    navigator.clipboard.writeText(no)
    setCopiedRegNo(true)
    setTimeout(() => setCopiedRegNo(false), 2000)
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <Head title={`Pendaftaran Lowongan - ${lowongan.judul}`} />

      <div className="max-w-4xl mx-auto">
        <Stack gap={5}>

          {/* Job Vacancy Info Card */}
          <Card>
            <Stack gap={4}>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 w-full">
                <Stack gap={1} className="flex-1 min-w-0">
                  <Eyebrow>{lowongan.departement_nama}</Eyebrow>
                  <Heading level={1}>{lowongan.judul}</Heading>
                  <Text size="sm" muted>
                    Posisi: <strong>{lowongan.posisi_nama}</strong> &bull; Kuota: <strong>{lowongan.jumlah_dibutuhkan} Posisi</strong>
                  </Text>
                </Stack>
                <Badge tone={lowongan.is_closed ? 'pink' : 'mint'} className="shrink-0">
                  {lowongan.is_closed ? 'LOWONGAN DITUTUP' : 'TERBUKA'}
                </Badge>
              </div>

              <Row gap={2} wrap={true}>
                <Badge tone="blue">{lowongan.lokasi_kerja}</Badge>
                <Badge tone="purple">{lowongan.tipe_pekerjaan}</Badge>
                {lowongan.tgl_tutup && (
                  <Badge tone="yellow">Batas Akhir: {lowongan.tgl_tutup}</Badge>
                )}
              </Row>

              {lowongan.deskripsi && (
                <Stack gap={1}>
                  <Text size="sm">
                    <strong>Deskripsi Pekerjaan:</strong>
                  </Text>
                  <div className="bg-[var(--color-surface)] p-3.5 rounded-[12px] ">
                    <RichContentViewer content={lowongan.deskripsi} />
                  </div>
                </Stack>
              )}

              {lowongan.kualifikasi && (
                <Stack gap={1}>
                  <Text size="sm">
                    <strong>Kualifikasi & Persyaratan:</strong>
                  </Text>
                  <div className="bg-[var(--color-surface)] p-3.5 rounded-[12px]">
                    <RichContentViewer content={lowongan.kualifikasi} />
                  </div>
                </Stack>
              )}
            </Stack>
          </Card>

          {/* If job is closed */}
          {lowongan.is_closed ? (
            <Card>
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <Blob icon="fail" tone="pink" size="md" />
                <Heading level={2}>Pendaftaran Lowongan Telah Ditutup</Heading>
                <Text size="sm" muted>
                  Mohon maaf, penerimaan berkas untuk posisi {lowongan.judul} saat ini sudah berakhir. Silakan cek lowongan lainnya di lain waktu.
                </Text>
              </div>
            </Card>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit}>
              <Stack gap={6}>
                {/* 1. Data Diri */}
                <Card>
                  <Stack gap={4}>
                    <Row gap={2} align="center">
                      <Blob icon="user" tone="purple" size="sm" />
                      <Heading level={2}>1. Data Pribadi Kandidat</Heading>
                    </Row>

                    {/* Pas Foto Formal Pelamar (Wajib) */}
                    <div className={`p-4 rounded-[16px] border ${errors.foto_file ? 'border-red-300 bg-red-50/40' : 'border-[var(--color-line)] bg-[var(--color-surface)]'} shadow-xs transition-colors`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Foto Preview / Placeholder */}
                        <div className="relative shrink-0">
                          {fotoPreviewUrl ? (
                            <div className="w-24 h-32 rounded-[12px] overflow-hidden border-2 border-[#a855f7] shadow-md relative group bg-black/5">
                              <img
                                src={fotoPreviewUrl}
                                alt="Pas Foto Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleFotoChange(null)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white shadow-xs hover:bg-red-600 transition-colors"
                                title="Hapus Foto"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          ) : (
                            <label className={`w-24 h-32 rounded-[12px] border-2 border-dashed ${errors.foto_file ? 'border-red-400 bg-red-100/50 text-red-500' : 'border-[#d8b4fe] bg-[#faf5ff] text-[#a855f7]'} flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:border-[#a855f7] hover:bg-[#f3e8ff] transition-all`}>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  handleFotoChange(file)
                                }}
                              />
                              <IconPhoto size={28} />
                              <span className="text-[10px] font-bold mt-1 leading-tight">
                                Unggah Pas Foto
                              </span>
                            </label>
                          )}
                        </div>

                        {/* Upload Controls & Guidelines */}
                        <Stack gap={2} className="flex-1 min-w-0">
                          <Row gap={2} align="center" wrap={true}>
                            <Text size="sm">
                              <strong>Pas Foto Formal Pelamar *</strong>
                            </Text>
                            <Badge tone={fotoPreviewUrl ? 'mint' : errors.foto_file ? 'pink' : 'purple'}>
                              {fotoPreviewUrl ? 'TERUNGGAH' : 'WAJIB DIUNGGAH'}
                            </Badge>
                            {fotoFileSize && <Badge tone="blue">{fotoFileSize}</Badge>}
                          </Row>

                          <Text size="sm" muted>
                            Unggah pas foto formal / setengah badan (rasio 3x4 atau 4x6). Format <strong>JPG, JPEG, PNG, atau WEBP</strong> (Maksimal 2 MB).
                          </Text>

                          {/* Progress animation */}
                          {isUploadingFoto && (
                            <div className="w-full bg-[#f3e8ff] h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-[#7c3aed] h-full rounded-full transition-all duration-200"
                                style={{ width: `${fotoProgress}%` }}
                              />
                            </div>
                          )}

                          {/* Buttons */}
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  handleFotoChange(file)
                                }}
                              />
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer shadow-xs active:scale-95">
                                <IconUpload size={14} />
                                <span>{fotoPreviewUrl ? 'Ganti Pas Foto' : 'Pilih File Foto...'}</span>
                              </span>
                            </label>

                            {fotoPreviewUrl && (
                              <Button
                                size="sm"
                                tone="pink"
                                onClick={() => handleFotoChange(null)}
                                className="py-1 px-2.5 text-xs"
                              >
                                <IconTrash size={13} />
                                <span>Hapus Foto</span>
                              </Button>
                            )}
                          </div>

                          {errors.foto_file && (
                            <p className="text-xs text-red-500 font-bold mt-1">
                              ⚠️ {errors.foto_file}
                            </p>
                          )}
                        </Stack>
                      </div>
                    </div>

                    <Field label="Nama Lengkap (Sesuai KTP) *" error={errors.nama_lengkap}>
                      {(id, describedBy) => (
                        <Input
                          id={id}
                          describedBy={describedBy}
                          value={data.nama_lengkap}
                          onChange={(v) => setData('nama_lengkap', v)}
                          placeholder="Masukkan nama lengkap Anda..."
                        />
                      )}
                    </Field>

                    <Grid cols={2}>
                      <Field label="Tempat Lahir *" error={errors.tempat_lahir}>
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            value={data.tempat_lahir}
                            onChange={(v) => setData('tempat_lahir', v)}
                            placeholder="Kota tempat lahir"
                          />
                        )}
                      </Field>

                      <Field label="Tanggal Lahir *" error={errors.tanggal_lahir}>
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            type="date"
                            value={data.tanggal_lahir}
                            onChange={(v) => setData('tanggal_lahir', v)}
                          />
                        )}
                      </Field>
                    </Grid>

                    <Grid cols={3}>
                      <Field label="Jenis Kelamin *" error={errors.jenis_kelamin}>
                        {() => (
                          <Select
                            value={data.jenis_kelamin}
                            onChange={(v) => setData('jenis_kelamin', v)}
                            options={JENIS_KELAMIN_OPTIONS}
                          />
                        )}
                      </Field>

                      <Field label="Status Pernikahan *" error={errors.status_pernikahan}>
                        {() => (
                          <Select
                            value={data.status_pernikahan}
                            onChange={(v) => setData('status_pernikahan', v)}
                            options={STATUS_PERNIKAHAN_OPTIONS}
                          />
                        )}
                      </Field>

                      <Field label="Agama *" error={errors.agama}>
                        {() => (
                          <Select
                            value={data.agama}
                            onChange={(v) => setData('agama', v)}
                            options={AGAMA_OPTIONS}
                          />
                        )}
                      </Field>
                    </Grid>

                    <Field label="Alamat Lengkap (Sesuai KTP) *" error={errors.alamat}>
                      {(id, describedBy) => (
                        <Input
                          id={id}
                          describedBy={describedBy}
                          value={data.alamat}
                          onChange={(v) => setData('alamat', v)}
                          placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
                        />
                      )}
                    </Field>

                    <Grid cols={3}>
                      <Field label="Kota Domisili Saat Ini *" error={errors.domisili}>
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            value={data.domisili}
                            onChange={(v) => setData('domisili', v)}
                            placeholder="contoh: Jakarta Selatan"
                          />
                        )}
                      </Field>

                      <Field label="Nomor WhatsApp / HP *" error={errors.nomor_kontak} hint="Aktif WhatsApp">
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            type="tel"
                            value={data.nomor_kontak}
                            onChange={(v) => setData('nomor_kontak', v)}
                            placeholder="081234567890"
                            mono
                          />
                        )}
                      </Field>

                      <Field label="Email Aktif *" error={errors.email} hint="Untuk notifikasi seleksi">
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            type="email"
                            value={data.email}
                            onChange={(v) => setData('email', v)}
                            placeholder="kandidat@email.com"
                            mono
                          />
                        )}
                      </Field>
                    </Grid>
                  </Stack>
                </Card>

                {/* 2. Pendidikan & Posisi */}
                <Card>
                  <Stack gap={4}>
                    <Row gap={2} align="center">
                      <Blob icon="target" tone="blue" size="sm" />
                      <Heading level={2}>2. Riwayat Pendidikan & Posisi</Heading>
                    </Row>

                    <Field label="Posisi yang Dilamar" error={errors.posisi_dilamar}>
                      {(id, describedBy) => (
                        <Input
                          id={id}
                          describedBy={describedBy}
                          value={data.posisi_dilamar}
                          onChange={() => {}}
                          disabled
                        />
                      )}
                    </Field>

                    <Grid cols={2}>
                      <Field label="Pendidikan Terakhir *" error={errors.pendidikan_terakhir}>
                        {() => (
                          <Select
                            value={data.pendidikan_terakhir}
                            onChange={(v) => setData('pendidikan_terakhir', v)}
                            options={PENDIDIKAN_OPTIONS}
                          />
                        )}
                      </Field>

                      <Field label="Nama Institusi / Universitas / Sekolah *" error={errors.nama_institusi}>
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            value={data.nama_institusi}
                            onChange={(v) => setData('nama_institusi', v)}
                            placeholder="contoh: Universitas Indonesia"
                          />
                        )}
                      </Field>
                    </Grid>

                    <Grid cols={2}>
                      <Field label="Jurusan *" error={errors.jurusan}>
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            value={data.jurusan}
                            onChange={(v) => setData('jurusan', v)}
                            placeholder="contoh: Teknik Informatika / Manajemen"
                          />
                        )}
                      </Field>

                      <Field label="Tahun Kelulusan *" error={errors.tahun_lulus}>
                        {(id, describedBy) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            value={data.tahun_lulus}
                            onChange={(v) => setData('tahun_lulus', v)}
                            placeholder="contoh: 2024"
                            mono
                          />
                        )}
                      </Field>
                    </Grid>
                  </Stack>
                </Card>

                {/* 3. Berkas & Dokumen */}
                <Card>
                  <Stack gap={4}>
                    <Row gap={2} align="center">
                      <Blob icon="database" tone="mint" size="sm" />
                      <Heading level={2}>3. Unggah Berkas & Dokumen</Heading>
                    </Row>

                    <Grid cols={2}>
                      {/* CV Upload */}
                      <Stack gap={2}>
                        <div className="flex justify-between items-center">
                          <Text size="sm">
                            <strong>Upload CV (Curriculum Vitae) *</strong>
                          </Text>
                          {cvFileSize && (
                            <Badge tone="purple">{cvFileSize}</Badge>
                          )}
                        </div>
                        <Text size="sm" muted>
                          Wajib format PDF (.pdf), ukuran maksimal 2 MB
                        </Text>

                        {/* If uploading animation is active */}
                        {isUploadingCv ? (
                          <div className="p-4 rounded-[16px] border-2 border-[#c084fc] bg-gradient-to-r from-[#faf5ff] to-[#f3e8ff] shadow-sm animate-pulse">
                            <Stack gap={2}>
                              <Row gap={2} align="center">
                                <div className="p-2 rounded-[10px] bg-[#7c3aed] text-white">
                                  <IconUpload size={18} className="animate-bounce" />
                                </div>
                                <Stack gap={1} className="flex-1 min-w-0">
                                  <Text size="sm" className="truncate font-bold text-[#7c3aed]">
                                    Memproses {cvFileName}...
                                  </Text>
                                  <span className="text-xs text-muted">
                                    Memvalidasi dan menyiapkan dokumen
                                  </span>
                                </Stack>
                                <span className="text-xs font-bold text-[#7c3aed]">{cvProgress}%</span>
                              </Row>
                              {/* Progress bar */}
                              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#d8b4fe]">
                                <div
                                  className="bg-gradient-to-r from-[#7c3aed] to-[#c084fc] h-full rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${cvProgress}%` }}
                                />
                              </div>
                            </Stack>
                          </div>
                        ) : cvFileName ? (
                          /* If file is uploaded & ready */
                          <div className="p-3.5 rounded-[16px] border-2 border-[#d8b4fe] bg-gradient-to-r from-[#faf5ff] via-[#fdf4ff] to-[#f5f3ff] shadow-sm transition-all duration-200 hover:shadow-md animate-in zoom-in-95 fade-in duration-200">
                            <Stack gap={2}>
                              <Row gap={2} align="center">
                                <div className="w-10 h-10 rounded-[12px] bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shadow-xs shrink-0">
                                  <IconFileTypePdf size={24} stroke={2.2} />
                                </div>
                                <Stack gap={1} className="flex-1 min-w-0">
                                  <span className="text-sm font-bold truncate text-[var(--color-ink)]" title={cvFileName}>
                                    {cvFileName}
                                  </span>
                                  <Row gap={2} align="center">
                                    <Badge tone="mint">✓ Siap Dikirim</Badge>
                                    <span className="text-xs text-muted">&bull; {cvFileSize}</span>
                                  </Row>
                                </Stack>
                              </Row>

                              {/* Action buttons */}
                              <Row gap={2} align="center" className="pt-1 border-t border-[#e9d5ff]/70">
                                <Button
                                  type="button"
                                  size="sm"
                                  tone="purple"
                                  onClick={() => setPreviewModal({
                                    open: true,
                                    title: `Pratinjau CV - ${cvFileName}`,
                                    url: cvPreviewUrl,
                                  })}
                                  className="flex-1"
                                >
                                  <IconEye size={15} stroke={2.4} />
                                  <span>Lihat Preview PDF</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  tone="pink"
                                  onClick={() => handleCvChange(null)}
                                  title="Hapus / Ganti File"
                                >
                                  <IconTrash size={15} stroke={2.4} />
                                  <span>Hapus</span>
                                </Button>
                              </Row>
                            </Stack>
                          </div>
                        ) : (
                          /* Empty Dropzone State */
                          <div
                            onDragOver={(e) => {
                              e.preventDefault()
                              setIsDraggingCv(true)
                            }}
                            onDragLeave={() => setIsDraggingCv(false)}
                            onDrop={(e) => {
                              e.preventDefault()
                              setIsDraggingCv(false)
                              const file = e.dataTransfer.files?.[0] || null
                              if (file && file.type === 'application/pdf') {
                                handleCvChange(file)
                              }
                            }}
                            className={`relative border-2 border-dashed rounded-[16px] p-5 text-center transition-all duration-200 cursor-pointer ${
                              isDraggingCv
                                ? 'border-[#7c3aed] bg-[#f3e8ff]/70 scale-[1.02] shadow-md ring-4 ring-[#7c3aed]/20'
                                : 'border-[#d8b4fe] hover:border-[#7c3aed] bg-gradient-to-b from-[#faf5ff]/80 to-[var(--color-surface)] hover:bg-[#f3e8ff]/30 hover:scale-[1.005]'
                            }`}
                          >
                            <input
                              type="file"
                              accept="application/pdf"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                handleCvChange(file)
                              }}
                            />
                            <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                              <div className="w-10 h-10 rounded-[12px] bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center shadow-xs border border-[#ddd6fe] transition-transform group-hover:scale-110">
                                <IconUpload size={22} stroke={2.4} />
                              </div>
                              <Text size="sm" className="font-semibold text-[var(--color-ink)]">
                                Klik atau seret file <span className="text-[#7c3aed] underline">CV PDF</span> ke sini
                              </Text>
                              <span className="text-[11px] text-muted">Format PDF (Maksimal 2 MB)</span>
                            </div>
                          </div>
                        )}

                        {errors.cv_file && (
                          <p className="text-sm text-red-500 font-medium">{errors.cv_file}</p>
                        )}
                      </Stack>

                      {/* Surat Lamaran Upload */}
                      <Stack gap={2}>
                        <div className="flex justify-between items-center">
                          <Text size="sm">
                            <strong>Upload Surat Lamaran (Cover Letter)</strong>
                          </Text>
                          {suratFileSize && (
                            <Badge tone="mint">{suratFileSize}</Badge>
                          )}
                        </div>
                        <Text size="sm" muted>
                          Opsional &bull; Format PDF (.pdf), maksimal 2 MB
                        </Text>

                        {/* If uploading animation is active */}
                        {isUploadingSurat ? (
                          <div className="p-4 rounded-[16px] border-2 border-[#6ee7b7] bg-gradient-to-r from-[#ecfdf5] to-[#d1fae5] shadow-sm animate-pulse">
                            <Stack gap={2}>
                              <Row gap={2} align="center">
                                <div className="p-2 rounded-[10px] bg-[#059669] text-white">
                                  <IconUpload size={18} className="animate-bounce" />
                                </div>
                                <Stack gap={1} className="flex-1 min-w-0">
                                  <Text size="sm" className="truncate font-bold text-[#059669]">
                                    Memproses {suratFileName}...
                                  </Text>
                                  <span className="text-xs text-muted">
                                    Memvalidasi dokumen
                                  </span>
                                </Stack>
                                <span className="text-xs font-bold text-[#059669]">{suratProgress}%</span>
                              </Row>
                              {/* Progress bar */}
                              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#a7f3d0]">
                                <div
                                  className="bg-gradient-to-r from-[#059669] to-[#34d399] h-full rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${suratProgress}%` }}
                                />
                              </div>
                            </Stack>
                          </div>
                        ) : suratFileName ? (
                          /* If file is uploaded & ready */
                          <div className="p-3.5 rounded-[16px] border-2 border-[#a7f3d0] bg-gradient-to-r from-[#f0fdf4] via-[#ecfdf5] to-[#f5f3ff] shadow-sm transition-all duration-200 hover:shadow-md animate-in zoom-in-95 fade-in duration-200">
                            <Stack gap={2}>
                              <Row gap={2} align="center">
                                <div className="w-10 h-10 rounded-[12px] bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shadow-xs shrink-0">
                                  <IconFileTypePdf size={24} stroke={2.2} />
                                </div>
                                <Stack gap={1} className="flex-1 min-w-0">
                                  <span className="text-sm font-bold truncate text-[var(--color-ink)]" title={suratFileName}>
                                    {suratFileName}
                                  </span>
                                  <Row gap={2} align="center">
                                    <Badge tone="mint">✓ Siap Dikirim</Badge>
                                    <span className="text-xs text-muted">&bull; {suratFileSize}</span>
                                  </Row>
                                </Stack>
                              </Row>

                              {/* Action buttons */}
                              <Row gap={2} align="center" className="pt-1 border-t border-[#d1fae5]/70">
                                <Button
                                  type="button"
                                  size="sm"
                                  tone="mint"
                                  onClick={() => setPreviewModal({
                                    open: true,
                                    title: `Pratinjau Surat Lamaran - ${suratFileName}`,
                                    url: suratPreviewUrl,
                                  })}
                                  className="flex-1"
                                >
                                  <IconEye size={15} stroke={2.4} />
                                  <span>Lihat Preview PDF</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  tone="pink"
                                  onClick={() => handleSuratChange(null)}
                                  title="Hapus / Ganti File"
                                >
                                  <IconTrash size={15} stroke={2.4} />
                                  <span>Hapus</span>
                                </Button>
                              </Row>
                            </Stack>
                          </div>
                        ) : (
                          /* Empty Dropzone State */
                          <div
                            onDragOver={(e) => {
                              e.preventDefault()
                              setIsDraggingSurat(true)
                            }}
                            onDragLeave={() => setIsDraggingSurat(false)}
                            onDrop={(e) => {
                              e.preventDefault()
                              setIsDraggingSurat(false)
                              const file = e.dataTransfer.files?.[0] || null
                              if (file && file.type === 'application/pdf') {
                                handleSuratChange(file)
                              }
                            }}
                            className={`relative border-2 border-dashed rounded-[16px] p-5 text-center transition-all duration-200 cursor-pointer ${
                              isDraggingSurat
                                ? 'border-[#059669] bg-[#d1fae5]/70 scale-[1.02] shadow-md ring-4 ring-[#059669]/20'
                                : 'border-[#a7f3d0] hover:border-[#059669] bg-gradient-to-b from-[#f0fdf4]/80 to-[var(--color-surface)] hover:bg-[#d1fae5]/30 hover:scale-[1.005]'
                            }`}
                          >
                            <input
                              type="file"
                              accept="application/pdf"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                handleSuratChange(file)
                              }}
                            />
                            <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                              <div className="w-10 h-10 rounded-[12px] bg-[#d1fae5] text-[#059669] flex items-center justify-center shadow-xs border border-[#a7f3d0] transition-transform group-hover:scale-110">
                                <IconUpload size={22} stroke={2.4} />
                              </div>
                              <Text size="sm" className="font-semibold text-[var(--color-ink)]">
                                Klik atau seret <span className="text-[#059669] underline">Surat Lamaran PDF</span>
                              </Text>
                              <span className="text-[11px] text-muted">Format PDF (Maksimal 2 MB)</span>
                            </div>
                          </div>
                        )}

                        {errors.surat_lamaran_file && (
                          <p className="text-sm text-red-500 font-medium">{errors.surat_lamaran_file}</p>
                        )}
                      </Stack>
                    </Grid>

                    {/* Checkbox Pernyataan */}
                    <div className="mt-4 pt-4 ">
                      <Checkbox
                        checked={data.pernyataan_kebenaran}
                        onChange={(checked) => setData('pernyataan_kebenaran', Boolean(checked))}
                        label="Saya menyatakan bahwa semua data, informasi, dan dokumen yang saya berikan adalah benar dan dapat dipertanggungjawabkan keabsahannya."
                      />
                      {errors.pernyataan_kebenaran && (
                        <p className="text-sm text-red-500 font-medium mt-1">
                          {errors.pernyataan_kebenaran}
                        </p>
                      )}
                    </div>
                  </Stack>
                </Card>

                {/* Submit Action */}
                <Row justify="end" align="center">
                  <Button
                    type="submit"
                    tone="purple"
                    size="lg"
                    loading={processing}
                    disabled={!data.pernyataan_kebenaran}
                  >
                    Kirim Lamaran Pekerjaan
                  </Button>
                </Row>
              </Stack>
            </form>
          )}
        </Stack>
      </div>

      {/* PDF Document Preview Modal */}
      {previewModal.open && (
        <Dialog
          open={previewModal.open}
          onOpenChange={(open) => setPreviewModal((prev) => ({ ...prev, open }))}
          title={previewModal.title}
          description="Pratinjau dokumen PDF yang telah Anda unggah."
          size="lg"
        >
          <Stack gap={3}>
            {previewModal.url ? (
              <iframe
                src={previewModal.url}
                className="w-full h-[65vh] rounded-[14px] border-2 border-[var(--color-line)] bg-white shadow-inner"
                title={previewModal.title}
              />
            ) : (
              <div className="p-8 text-center text-muted">
                Dokumen tidak dapat dimuat untuk pratinjau.
              </div>
            )}

            <Row justify="between" align="center" className="pt-2 border-t border-[var(--color-line)]">
              {previewModal.url && (
                <Button
                  tone="blue"
                  size="sm"
                  onClick={() => window.open(previewModal.url || '', '_blank')}
                >
                  <IconExternalLink size={15} />
                  <span>Buka di Tab Baru ↗</span>
                </Button>
              )}
              <Button
                tone="purple"
                size="sm"
                onClick={() => setPreviewModal((prev) => ({ ...prev, open: false }))}
                className="ml-auto"
              >
                Tutup Pratinjau
              </Button>
            </Row>
          </Stack>
        </Dialog>
      )}

      {/* 1. Validation Error Dialog Modal */}
      {showErrorDialog && (
        <Dialog
          open={showErrorDialog}
          onOpenChange={(open) => setShowErrorDialog(open)}
          title="Pengisian Formulir Belum Lengkap"
          description="Terdapat kolom wajib yang belum diisi atau belum memenuhi ketentuan."
          size="lg"
        >
          <Stack gap={4}>
            <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200">
              <Row gap={2} align="top">

                <Stack gap={1} className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-red-800">
                    Ditemukan {Object.keys(errors).length} kendala validasi:
                  </span>
                  <ul className="list-disc list-inside text-xs text-red-700 space-y-1 font-medium mt-1">
                    {Object.entries(errors).map(([key, err]) => (
                      <li key={key}>
                        <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {err}
                      </li>
                    ))}
                  </ul>
                </Stack>
              </Row>
            </div>

            <Text size="sm" muted>
              Silakan periksa kembali kolom yang bertanda merah pada halaman formulir untuk melengkapi berkas pendaftaran Anda.
            </Text>

            <Row justify="end">
              <Button
                tone="mint"
                size="sm"
                onClick={() => setShowErrorDialog(false)}
              >
                Saya Mengerti / Perbaiki Formulir
              </Button>
            </Row>
          </Stack>
        </Dialog>
      )}

      {/* 2. File Size Alert Dialog Modal */}
      {fileAlertDialog.open && (
        <Dialog
          open={fileAlertDialog.open}
          onOpenChange={(open) => setFileAlertDialog((prev) => ({ ...prev, open }))}
          title="Ukuran File Melebihi Batas"
          description="Batas maksimal ukuran dokumen adalah 2 MB."
          size="md"
        >
          <Stack gap={3}>
            <div className="p-3.5 rounded-[14px] bg-amber-50 border border-amber-200">
              <Row gap={2} align="top">
                <div className="p-1.5 rounded-[8px] bg-amber-500 text-white shrink-0 mt-0.5">
                  <IconAlertCircle size={18} stroke={2.4} />
                </div>
                <Text size="sm" className="text-amber-900 text-xs leading-relaxed">
                  {fileAlertDialog.message}
                </Text>
              </Row>
            </div>

            <Row justify="end">
              <Button
                tone="purple"
                size="sm"
                onClick={() => setFileAlertDialog((prev) => ({ ...prev, open: false }))}
              >
                Mengerti
              </Button>
            </Row>
          </Stack>
        </Dialog>
      )}

      {/* 3. Application Success Dialog Modal */}
      {showSuccessDialog && (
        <Dialog
          open={showSuccessDialog}
          onOpenChange={(open) => {
            setShowSuccessDialog(open)
            if (!open && applicationSuccess) {
              window.location.reload()
            }
          }}
          title="Pendaftaran Berhasil Dikirim!"
          description="Terima kasih, data dan berkas lamaran Anda telah berhasil kami terima."
          size="md"
        >
          <Stack gap={4}>

            {applicationSuccess && (
              <div className="p-4 rounded-[16px] bg-gradient-to-b from-[#faf5ff] to-[var(--color-surface)] border-2 border-[#d8b4fe] text-left shadow-xs">
                <Stack gap={2}>
                  <div className="flex justify-between items-center pb-2 border-b border-[#e9d5ff]">
                    <span className="text-xs font-bold text-[#7c3aed]">BUKTI PENDAFTARAN</span>
                    <Button
                      size="sm"
                      tone={copiedRegNo ? 'mint' : 'purple'}
                      onClick={() => handleCopyRegNo(applicationSuccess.no_pendaftaran)}
                      className="py-0.5 px-2 text-xs"
                    >
                      {copiedRegNo ? (
                        <>
                          <IconCheck size={13} />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <IconCopy size={13} />
                          <span>Salin No. Reg</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <Row justify="between" align="center">
                    <span className="text-xs text-muted">Nomor Registrasi:</span>
                    <span className="text-sm font-mono font-bold text-[#7c3aed] bg-[#ede9fe] px-2 py-0.5 rounded-[6px] border border-[#ddd6fe]">
                      {applicationSuccess.no_pendaftaran}
                    </span>
                  </Row>
                  <Row justify="between" align="center">
                    <span className="text-xs text-muted">Nama Lengkap:</span>
                    <span className="text-sm font-bold text-[var(--color-ink)]">{applicationSuccess.nama_lengkap}</span>
                  </Row>
                  <Row justify="between" align="center">
                    <span className="text-xs text-muted">Posisi Dilamar:</span>
                    <span className="text-sm font-semibold text-[var(--color-ink)]">{applicationSuccess.posisi_dilamar}</span>
                  </Row>
                  <Row justify="between" align="center">
                    <span className="text-xs text-muted">Email Konfirmasi:</span>
                    <span className="text-sm text-[var(--color-ink)]">{applicationSuccess.email}</span>
                  </Row>
                  <Row justify="between" align="center">
                    <span className="text-xs text-muted">Waktu Pengiriman:</span>
                    <span className="text-xs font-mono text-muted">{applicationSuccess.submitted_at}</span>
                  </Row>
                </Stack>
              </div>
            )}

            <Row justify="end" gap={2}>
              <Button
                tone="purple"
                size="sm"
                onClick={() => {
                  setShowSuccessDialog(false)
                  window.location.reload()
                }}
              >
                Selesai / Tutup
              </Button>
            </Row>
          </Stack>
        </Dialog>
      )}
    </div>
  )
}
