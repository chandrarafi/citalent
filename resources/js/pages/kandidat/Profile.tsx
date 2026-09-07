import { useState, useRef, useEffect } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import { Select, Dialog } from '@/components/pouf/controls'
import { Badge, Blob } from '@/components/pouf/media'
import { Separator } from '@/components/pouf/separator'
import {
  IconCheck,
  IconAlertCircle,
  IconPhoto,
  IconFileTypePdf,
  IconUpload,
  IconTrash,
  IconEye,
  IconExternalLink,
  IconSparkles,
} from '@tabler/icons-react'

interface UserData {
  id: number
  name: string
  email: string
  phone?: string | null
}

interface ProfileData {
  tempat_lahir?: string | null
  tanggal_lahir?: string | null
  jenis_kelamin?: string | null
  status_pernikahan?: string | null
  agama?: string | null
  alamat?: string | null
  domisili?: string | null
  pendidikan_terakhir?: string | null
  nama_institusi?: string | null
  jurusan?: string | null
  tahun_lulus?: string | null
  foto_url?: string | null
  cv_url?: string | null
  is_complete?: boolean
}

interface Props {
  user: UserData
  profile?: ProfileData | null
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

export default function Profile({ user, profile }: Props) {
  const { flash } = usePage<any>().props

  // File state
  const [fotoFileName, setFotoFileName] = useState<string>('')
  const [fotoFileSize, setFotoFileSize] = useState<string>('')
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(profile?.foto_url || null)

  const [cvFileName, setCvFileName] = useState<string>('')
  const [cvFileSize, setCvFileSize] = useState<string>('')
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(profile?.cv_url || null)

  const [fileAlertDialog, setFileAlertDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })

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

  useEffect(() => {
    return () => {
      if (fotoUrlRef.current) URL.revokeObjectURL(fotoUrlRef.current)
      if (cvUrlRef.current) URL.revokeObjectURL(cvUrlRef.current)
    }
  }, [])

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const { data, setData, post, processing, errors } = useForm<{
    [key: string]: any
    nama_lengkap: string
    nomor_kontak: string
    tempat_lahir: string
    tanggal_lahir: string
    jenis_kelamin: string
    status_pernikahan: string
    agama: string
    alamat: string
    domisili: string
    pendidikan_terakhir: string
    nama_institusi: string
    jurusan: string
    tahun_lulus: string
    foto_file: File | null
    cv_file: File | null
  }>({
    nama_lengkap: user?.name || '',
    nomor_kontak: user?.phone || '',
    tempat_lahir: profile?.tempat_lahir || '',
    tanggal_lahir: profile?.tanggal_lahir || '',
    jenis_kelamin: profile?.jenis_kelamin || 'Laki-laki',
    status_pernikahan: profile?.status_pernikahan || 'Belum Menikah',
    agama: profile?.agama || 'Islam',
    alamat: profile?.alamat || '',
    domisili: profile?.domisili || '',
    pendidikan_terakhir: profile?.pendidikan_terakhir || 'D4/S1',
    nama_institusi: profile?.nama_institusi || '',
    jurusan: profile?.jurusan || '',
    tahun_lulus: profile?.tahun_lulus || new Date().getFullYear().toString(),
    foto_file: null,
    cv_file: null,
  })

  function handleFotoChange(file: File | null) {
    if (fotoUrlRef.current) {
      URL.revokeObjectURL(fotoUrlRef.current)
      fotoUrlRef.current = null
    }

    if (!file) {
      setData('foto_file', null)
      setFotoFileName('')
      setFotoFileSize('')
      setFotoPreviewUrl(profile?.foto_url || null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setFileAlertDialog({
        open: true,
        message: `File "${file.name}" bukan merupakan file gambar. Harap unggah format JPG, JPEG, PNG, atau WEBP.`,
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileAlertDialog({
        open: true,
        message: `Ukuran pas foto "${file.name}" (${formatFileSize(file.size)}) melebihi batas maksimal 2 MB.`,
      })
      return
    }

    const url = URL.createObjectURL(file)
    fotoUrlRef.current = url
    setData('foto_file', file)
    setFotoFileName(file.name)
    setFotoFileSize(formatFileSize(file.size))
    setFotoPreviewUrl(url)
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
      setCvPreviewUrl(profile?.cv_url || null)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileAlertDialog({
        open: true,
        message: `Ukuran file CV "${file.name}" (${formatFileSize(file.size)}) melebihi batas maksimal 2 MB.`,
      })
      return
    }

    const url = URL.createObjectURL(file)
    cvUrlRef.current = url
    setData('cv_file', file)
    setCvFileName(file.name)
    setCvFileSize(formatFileSize(file.size))
    setCvPreviewUrl(url)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/kandidat/profil', {
      forceFormData: true,
    })
  }

  const isProfileComplete = Boolean(profile?.is_complete)

  return (
    <AppLayout>
      <Head title="Profil & Biodata Kandidat - Citalent" />

      <div className="max-w-4xl mx-auto pb-16 pt-1 sm:pt-2">
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap={5}>
            {/* Header Card */}
            <Card>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <Blob icon="users" tone="mint" size="lg" />
                  <Stack gap={1}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Heading level={2}>Lengkapi Profil Biodata</Heading>
                      <Badge tone={isProfileComplete ? 'mint' : 'orange'}>
                        {isProfileComplete ? '✓ Lengkap' : 'Belum Lengkap'}
                      </Badge>
                    </div>
                    <Text size="sm" muted>
                      Lengkapi data diri, pendidikan, dan berkas lamaran Anda untuk memudahkan proses pendaftaran lowongan kerja.
                    </Text>
                  </Stack>
                </div>
              </div>
            </Card>

            {/* Flash Alerts */}
            {flash?.success && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                <IconCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Berhasil</p>
                  <p className="mt-0.5">{flash.success}</p>
                </div>
              </div>
            )}

            {flash?.error && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                <IconAlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Perhatian</p>
                  <p className="mt-0.5">{flash.error}</p>
                </div>
              </div>
            )}

            {/* Section 1: Data Akun & Pribadi */}
            <Card>
              <Stack gap={4}>
                <Row gap={2} align="center">
                  <Blob icon="target" tone="purple" size="sm" />
                  <Stack gap={1}>
                    <Heading level={3}>1. Data Pribadi</Heading>
                    <Text size="sm" muted>Informasi identitas kependudukan dan kontak aktif</Text>
                  </Stack>
                </Row>

                <Separator />

                <Grid cols={2} gap={4}>
                  {/* Nama Lengkap */}
                  <Field label="Nama Lengkap (Sesuai KTP)" error={errors.nama_lengkap}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="nama_lengkap"
                        describedBy={describedBy}
                        value={data.nama_lengkap}
                        onChange={(val) => setData('nama_lengkap', val)}
                        placeholder="Contoh: Rafi Chandra"
                        required
                        invalid={!!errors.nama_lengkap}
                      />
                    )}
                  </Field>

                  {/* Email */}
                  <Field label="Alamat Email (Akun Terdaftar)">
                    {(id) => (
                      <Input
                        id={id}
                        name="email"
                        value={user.email}
                        disabled
                        onChange={() => {}}
                      />
                    )}
                  </Field>

                  {/* No HP / WhatsApp */}
                  <Field label="No. HP / WhatsApp" error={errors.nomor_kontak}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="nomor_kontak"
                        describedBy={describedBy}
                        type="tel"
                        value={data.nomor_kontak}
                        onChange={(val) => setData('nomor_kontak', val)}
                        placeholder="081234567890"
                        required
                        invalid={!!errors.nomor_kontak}
                      />
                    )}
                  </Field>

                  {/* Tempat Lahir */}
                  <Field label="Tempat Lahir" error={errors.tempat_lahir}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="tempat_lahir"
                        describedBy={describedBy}
                        value={data.tempat_lahir}
                        onChange={(val) => setData('tempat_lahir', val)}
                        placeholder="Contoh: Padang"
                        required
                        invalid={!!errors.tempat_lahir}
                      />
                    )}
                  </Field>

                  {/* Tanggal Lahir */}
                  <Field label="Tanggal Lahir" error={errors.tanggal_lahir}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="tanggal_lahir"
                        describedBy={describedBy}
                        type="date"
                        value={data.tanggal_lahir}
                        onChange={(val) => setData('tanggal_lahir', val)}
                        required
                        invalid={!!errors.tanggal_lahir}
                      />
                    )}
                  </Field>

                  {/* Jenis Kelamin */}
                  <Field label="Jenis Kelamin" error={errors.jenis_kelamin}>
                    {(id, describedBy) => (
                      <Select
                        id={id}
                        describedBy={describedBy}
                        options={JENIS_KELAMIN_OPTIONS}
                        value={data.jenis_kelamin}
                        onChange={(val) => setData('jenis_kelamin', val)}
                      />
                    )}
                  </Field>

                  {/* Status Pernikahan */}
                  <Field label="Status Pernikahan" error={errors.status_pernikahan}>
                    {(id, describedBy) => (
                      <Select
                        id={id}
                        describedBy={describedBy}
                        options={STATUS_PERNIKAHAN_OPTIONS}
                        value={data.status_pernikahan}
                        onChange={(val) => setData('status_pernikahan', val)}
                      />
                    )}
                  </Field>

                  {/* Agama */}
                  <Field label="Agama" error={errors.agama}>
                    {(id, describedBy) => (
                      <Select
                        id={id}
                        describedBy={describedBy}
                        options={AGAMA_OPTIONS}
                        value={data.agama}
                        onChange={(val) => setData('agama', val)}
                      />
                    )}
                  </Field>

                  {/* Domisili Saat Ini */}
                  <Field label="Kota Domisili Saat Ini" error={errors.domisili}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="domisili"
                        describedBy={describedBy}
                        value={data.domisili}
                        onChange={(val) => setData('domisili', val)}
                        placeholder="Contoh: Kota Padang, Sumatera Barat"
                        required
                        invalid={!!errors.domisili}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Alamat KTP */}
                <Field label="Alamat Lengkap Sesuai KTP" error={errors.alamat}>
                  {(id, describedBy) => (
                    <Input
                      id={id}
                      name="alamat"
                      describedBy={describedBy}
                      value={data.alamat}
                      onChange={(val) => setData('alamat', val)}
                      placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                      required
                      invalid={!!errors.alamat}
                    />
                  )}
                </Field>
              </Stack>
            </Card>

            {/* Section 2: Riwayat Pendidikan */}
            <Card>
              <Stack gap={4}>
                <Row gap={2} align="center">
                  <Blob icon="settings" tone="blue" size="sm" />
                  <Stack gap={1}>
                    <Heading level={3}>2. Pendidikan Terakhir</Heading>
                    <Text size="sm" muted>Kualifikasi akademik formal pelamar</Text>
                  </Stack>
                </Row>

                <Separator />

                <Grid cols={2} gap={4}>
                  {/* Tingkat Pendidikan */}
                  <Field label="Jenjang Pendidikan" error={errors.pendidikan_terakhir}>
                    {(id, describedBy) => (
                      <Select
                        id={id}
                        describedBy={describedBy}
                        options={PENDIDIKAN_OPTIONS}
                        value={data.pendidikan_terakhir}
                        onChange={(val) => setData('pendidikan_terakhir', val)}
                      />
                    )}
                  </Field>

                  {/* Nama Institusi */}
                  <Field label="Nama Sekolah / Universitas" error={errors.nama_institusi}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="nama_institusi"
                        describedBy={describedBy}
                        value={data.nama_institusi}
                        onChange={(val) => setData('nama_institusi', val)}
                        placeholder="Contoh: Universitas Jayanusa"
                        required
                        invalid={!!errors.nama_institusi}
                      />
                    )}
                  </Field>

                  {/* Jurusan */}
                  <Field label="Jurusan / Program Studi" error={errors.jurusan}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="jurusan"
                        describedBy={describedBy}
                        value={data.jurusan}
                        onChange={(val) => setData('jurusan', val)}
                        placeholder="Contoh: Sistem Informasi / Teknik Informatika"
                        required
                        invalid={!!errors.jurusan}
                      />
                    )}
                  </Field>

                  {/* Tahun Lulus */}
                  <Field label="Tahun Kelulusan" error={errors.tahun_lulus}>
                    {(id, describedBy) => (
                      <Input
                        id={id}
                        name="tahun_lulus"
                        describedBy={describedBy}
                        type="number"
                        min="1970"
                        max="2035"
                        value={data.tahun_lulus}
                        onChange={(val) => setData('tahun_lulus', val)}
                        placeholder="2024"
                        required
                        invalid={!!errors.tahun_lulus}
                      />
                    )}
                  </Field>
                </Grid>
              </Stack>
            </Card>

            {/* Section 3: Berkas & Dokumen Pendukung */}
            <Card>
              <Stack gap={5}>
                <Row gap={2} align="center">
                  <Blob icon="menu" tone="mint" size="sm" />
                  <Stack gap={1}>
                    <Heading level={3}>3. Unggah Berkas & Dokumen</Heading>
                    <Text size="sm" muted>Pas foto formal (wajib) dan CV/Resume (maks. 2 MB per file)</Text>
                  </Stack>
                </Row>

                <Separator />

                {/* Pas Foto Formal (Wajib) */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                    <label className="text-sm font-bold text-slate-800">
                      Pas Foto Formal (3x4 / 4x6) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-slate-500">Maks. 2 MB (JPG, JPEG, PNG, WEBP)</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {fotoPreviewUrl ? (
                        <div className="relative group shrink-0">
                          <img
                            src={fotoPreviewUrl}
                            alt="Pas Foto"
                            className="w-24 h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewModal({ open: true, title: 'Pratinjau Pas Foto', url: fotoPreviewUrl })}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-semibold"
                          >
                            <IconEye size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white shrink-0">
                          <IconPhoto size={28} />
                          <span className="text-[10px] mt-1 font-semibold">3x4 / 4x6</span>
                        </div>
                      )}

                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <input
                          type="file"
                          id="foto_file_input"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFotoChange(e.target.files[0])
                            }
                          }}
                        />
                        <p className="text-xs text-slate-600 mb-3 break-words">
                          {fotoFileName ? (
                            <span className="font-semibold text-emerald-700">{fotoFileName} ({fotoFileSize})</span>
                          ) : fotoPreviewUrl ? (
                            <span className="text-slate-600">Foto tersimpan. Klik tombol di bawah jika ingin mengganti.</span>
                          ) : (
                            'Gunakan foto formal berlatar belakang polos (merah/biru/putih).'
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <Button
                            type="button"
                            variant="solid"
                            onClick={() => document.getElementById('foto_file_input')?.click()}
                          >
                            <IconUpload size={16} />
                            {fotoPreviewUrl ? 'Ganti Foto' : 'Unggah Foto'}
                          </Button>
                          {data.foto_file && (
                            <Button
                              type="button"
                              variant="quiet"
                              onClick={() => handleFotoChange(null)}
                            >
                              <IconTrash size={16} className="text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {errors.foto_file && (
                    <p className="text-xs font-semibold text-red-600 mt-1.5">{errors.foto_file}</p>
                  )}
                </div>

                {/* CV / Resume PDF */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                    <label className="text-sm font-bold text-slate-800">
                      Curriculum Vitae (CV) / Resume
                    </label>
                    <span className="text-xs text-slate-500">Maks. 2 MB (PDF)</span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <IconFileTypePdf size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {cvFileName || (profile?.cv_url ? 'Dokumen CV Terunggah' : 'Belum ada file CV')}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {cvFileSize || (profile?.cv_url ? 'Format PDF tersimpan' : 'Disarankan format PDF lengkap')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <input
                          type="file"
                          id="cv_file_input"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCvChange(e.target.files[0])
                            }
                          }}
                        />
                        {cvPreviewUrl && (
                          <Button
                            type="button"
                            variant="solid"
                            onClick={() => setPreviewModal({ open: true, title: 'Pratinjau CV', url: cvPreviewUrl })}
                          >
                            <IconEye size={16} />
                            Lihat
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="solid"
                          onClick={() => document.getElementById('cv_file_input')?.click()}
                        >
                          <IconUpload size={16} />
                          {cvPreviewUrl ? 'Ganti CV' : 'Unggah CV'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {errors.cv_file && (
                    <p className="text-xs font-semibold text-red-600 mt-1.5">{errors.cv_file}</p>
                  )}
                </div>
              </Stack>
            </Card>

            {/* Submit Action */}
            <Card>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Text size="sm" muted>
                  Pastikan seluruh data yang Anda masukkan adalah benar dan valid.
                </Text>
                <Button tone="mint" type="submit" loading={processing} className="w-full sm:w-auto">
                  <IconCheck size={18} />
                  Simpan & Lengkapi Profil Biodata
                </Button>
              </div>
            </Card>
          </Stack>
        </form>
      </div>

      {/* File Alert Dialog */}
      <Dialog
        open={fileAlertDialog.open}
        onOpenChange={(open) => !open && setFileAlertDialog({ open: false, message: '' })}
        title="Peringatan Dokumen"
      >
        <Stack gap={4}>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <IconAlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p>{fileAlertDialog.message}</p>
          </div>
          <Row justify="end">
            <Button
              tone="mint"
              onClick={() => setFileAlertDialog({ open: false, message: '' })}
            >
              Saya Mengerti
            </Button>
          </Row>
        </Stack>
      </Dialog>

      {/* PDF/Image Preview Modal */}
      <Dialog
        open={previewModal.open}
        onOpenChange={(open) => !open && setPreviewModal({ open: false, title: '', url: null })}
        title={previewModal.title}
      >
        <Stack gap={4}>
          {previewModal.url && (
            <div className="w-full h-[60vh] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
              {previewModal.title.includes('Foto') ? (
                <img
                  src={previewModal.url}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <iframe
                  src={previewModal.url}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              )}
            </div>
          )}
          <Row justify="between" align="center">
            {previewModal.url && (
              <a
                href={previewModal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <IconExternalLink size={14} />
                Buka di Tab Baru
              </a>
            )}
            <Button
              variant="quiet"
              onClick={() => setPreviewModal({ open: false, title: '', url: null })}
            >
              Tutup
            </Button>
          </Row>
        </Stack>
      </Dialog>
    </AppLayout>
  )
}
