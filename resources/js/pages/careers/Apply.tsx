import { useState } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import { Badge, Blob } from '@/components/pouf/media'
import { Select } from '@/components/pouf/controls'
import { Checkbox } from '@/components/pouf/checkbox'

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

  const [cvFileName, setCvFileName] = useState<string>('')
  const [suratFileName, setSuratFileName] = useState<string>('')

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
    cv_file: null,
    surat_lamaran_file: null,
    pernyataan_kebenaran: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(`/karir/${lowongan.slug}/apply`, {
      forceFormData: true,
      onSuccess: () => {
        reset()
        setCvFileName('')
        setSuratFileName('')
      },
    })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-4 sm:px-6 lg:px-8">
      <Head title={`Pendaftaran Lowongan - ${lowongan.judul}`} />

      <div className="max-w-4xl mx-auto">
        <Stack gap={6}>
          {/* Header & Brand */}
          <Row justify="between" align="center">
            <Row gap={3} align="center">
              <Blob icon="users" tone="purple" size="md" />
              <div>
                <Heading level={2}>Portal Karir & Rekrutmen</Heading>
                <Text size="sm" muted>
                  PT. Menara Agung
                </Text>
              </div>
            </Row>
            <Badge tone="purple">
              {lowongan.kode_lowongan}
            </Badge>
          </Row>

          {/* Job Vacancy Info Card */}
          <Card>
            <Stack gap={4}>
              <Row justify="between" align="top">
                <Stack gap={1}>
                  <Eyebrow>{lowongan.departement_nama}</Eyebrow>
                  <Heading level={1}>{lowongan.judul}</Heading>
                  <Text size="sm" muted>
                    Posisi: <strong>{lowongan.posisi_nama}</strong> &bull; Kuota: <strong>{lowongan.jumlah_dibutuhkan} Posisi</strong>
                  </Text>
                </Stack>
                <Badge tone={lowongan.is_closed ? 'pink' : 'mint'}>
                  {lowongan.is_closed ? 'LOWONGAN DITUTUP' : 'TERBUKA'}
                </Badge>
              </Row>

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
                  <div className="bg-[var(--color-surface)] p-3 rounded-[12px] text-[14px] text-[var(--color-ink)] whitespace-pre-line leading-relaxed">
                    {lowongan.deskripsi}
                  </div>
                </Stack>
              )}

              {lowongan.kualifikasi && (
                <Stack gap={1}>
                  <Text size="sm">
                    <strong>Kualifikasi & Persyaratan:</strong>
                  </Text>
                  <div className="bg-[var(--color-surface)] p-3 rounded-[12px] text-[14px] text-[var(--color-ink)] whitespace-pre-line leading-relaxed">
                    {lowongan.kualifikasi}
                  </div>
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Success State */}
          {applicationSuccess ? (
            <Card>
              <div className="text-center py-6 flex flex-col items-center">
                <Blob icon="ok" tone="mint" size="lg" />
                <div className="mt-3">
                  <Heading level={2}>Lamaran Anda Berhasil Dikirim!</Heading>
                  <Text size="sm" muted>
                    Terima kasih telah mendaftar. Data lamaran Anda telah kami terima dalam sistem.
                  </Text>
                </div>

                <div className="w-full max-w-md my-4 p-4 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-line)] text-left">
                  <Stack gap={2}>
                    <Row justify="between" align="center">
                      <Text size="sm" muted>Nomor Pendaftaran:</Text>
                      <Badge tone="purple">{applicationSuccess.no_pendaftaran}</Badge>
                    </Row>
                    <Row justify="between" align="center">
                      <Text size="sm" muted>Nama Lengkap:</Text>
                      <Text size="sm"><strong>{applicationSuccess.nama_lengkap}</strong></Text>
                    </Row>
                    <Row justify="between" align="center">
                      <Text size="sm" muted>Posisi Dilamar:</Text>
                      <Text size="sm"><strong>{applicationSuccess.posisi_dilamar}</strong></Text>
                    </Row>
                    <Row justify="between" align="center">
                      <Text size="sm" muted>Waktu Pengiriman:</Text>
                      <Text size="sm" mono muted>{applicationSuccess.submitted_at}</Text>
                    </Row>
                  </Stack>
                </div>

                <Text size="sm" muted>
                  Simpan nomor pendaftaran di atas. Tim rekrutmen kami akan melakukan seleksi berkas dan menghubungi Anda melalui WhatsApp atau Email jika lolos ke tahap selanjutnya.
                </Text>

                <div className="mt-4">
                  <Button onClick={() => window.location.reload()} variant="quiet">
                    Kirim Lamaran Lainnya
                  </Button>
                </div>
              </div>
            </Card>
          ) : lowongan.is_closed ? (
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
                      <Stack gap={2}>
                        <Text size="sm">
                          <strong>Upload CV (Curriculum Vitae) *</strong>
                        </Text>
                        <Text size="sm" muted>
                          Wajib format PDF (.pdf), ukuran maksimal 5 MB
                        </Text>
                        <div className="relative border-2 border-dashed border-[var(--color-line)] rounded-[14px] p-4 text-center hover:border-[var(--color-purple)] transition-colors bg-[var(--color-surface)]">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setData('cv_file', file)
                              setCvFileName(file ? file.name : '')
                            }}
                          />
                          <div className="flex flex-col items-center gap-1">
                            <Blob icon="add" tone="purple" size="sm" />
                            <Text size="sm">
                              {cvFileName ? <strong>{cvFileName}</strong> : 'Klik atau seret file CV PDF ke sini'}
                            </Text>
                          </div>
                        </div>
                        {errors.cv_file && (
                          <p className="text-sm text-red-500 font-medium">{errors.cv_file}</p>
                        )}
                      </Stack>

                      <Stack gap={2}>
                        <Text size="sm">
                          <strong>Upload Surat Lamaran (Cover Letter)</strong>
                        </Text>
                        <Text size="sm" muted>
                          Opsional &bull; Format PDF (.pdf), maksimal 5 MB
                        </Text>
                        <div className="relative border-2 border-dashed border-[var(--color-line)] rounded-[14px] p-4 text-center hover:border-[var(--color-purple)] transition-colors bg-[var(--color-surface)]">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setData('surat_lamaran_file', file)
                              setSuratFileName(file ? file.name : '')
                            }}
                          />
                          <div className="flex flex-col items-center gap-1">
                            <Blob icon="add" tone="mint" size="sm" />
                            <Text size="sm">
                              {suratFileName ? <strong>{suratFileName}</strong> : 'Klik atau seret Surat Lamaran PDF'}
                            </Text>
                          </div>
                        </div>
                        {errors.surat_lamaran_file && (
                          <p className="text-sm text-red-500 font-medium">{errors.surat_lamaran_file}</p>
                        )}
                      </Stack>
                    </Grid>

                    {/* Checkbox Pernyataan */}
                    <div className="mt-4 pt-4 border-t border-[var(--color-line)]">
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
    </div>
  )
}
