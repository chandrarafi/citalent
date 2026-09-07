import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import { Badge, Blob } from '@/components/pouf/media'
import { Select } from '@/components/pouf/controls'
import { RichTextEditor } from '@/components/pouf/RichTextEditor'

interface DepartementItem {
  id: number
  kd_departement: string
  deskripsi: string
}

interface JabatanItem {
  id: number
  kd_departement: string
  kd_jabatan: string
  nama_jabatan: string
}

interface LowonganEditData {
  id: number
  kode_lowongan: string
  slug: string
  judul: string
  kd_departement: number
  posisi_id: number
  jumlah_dibutuhkan: number
  lokasi_kerja: string
  tipe_pekerjaan: string
  deskripsi?: string | null
  kualifikasi?: string | null
  tgl_buka?: string | null
  tgl_tutup?: string | null
  status: 'draft' | 'aktif' | 'ditutup'
  permintaan_rekrutmen?: {
    id: number
    kode_permintaan: string
    posisi_nama?: string
    departement_nama?: string
    requester_name?: string
  } | null
}

interface Props {
  lowongan: LowonganEditData
  departements: DepartementItem[]
  jabatans: JabatanItem[]
}

const TIPE_PEKERJAAN_OPTIONS = [
  { value: 'Full-time', label: 'Full-time (Penuh Waktu)' },
  { value: 'Contract', label: 'Kontrak (PKWT)' },
  { value: 'Internship', label: 'Magang (Internship)' },
  { value: 'Part-time', label: 'Part-time' },
]

export default function Edit({ lowongan, departements = [], jabatans = [] }: Props) {
  const { errors: pageErrors } = usePage<any>().props

  const [form, setForm] = useState({
    judul: lowongan.judul || '',
    kd_departement: String(lowongan.kd_departement || ''),
    posisi_id: String(lowongan.posisi_id || ''),
    jumlah_dibutuhkan: String(lowongan.jumlah_dibutuhkan || 1),
    tipe_pekerjaan: lowongan.tipe_pekerjaan || 'Full-time',
    lokasi_kerja: lowongan.lokasi_kerja || '',
    tgl_buka: lowongan.tgl_buka || '',
    tgl_tutup: lowongan.tgl_tutup || '',
    deskripsi: lowongan.deskripsi || '',
    kualifikasi: lowongan.kualifikasi || '',
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Filter positions by selected department
  const filteredJabatans = useMemo(() => {
    if (!form.kd_departement) return jabatans
    const dept = departements.find((d) => String(d.id) === String(form.kd_departement))
    if (!dept) return jabatans
    return jabatans.filter((j) => j.kd_departement === dept.kd_departement)
  }, [form.kd_departement, departements, jabatans])

  function handleDepartementChange(deptId: string) {
    const selectedDept = departements.find((d) => String(d.id) === String(deptId))
    const firstJabatan = selectedDept
      ? jabatans.find((j) => j.kd_departement === selectedDept.kd_departement)
      : undefined

    setForm((f) => ({
      ...f,
      kd_departement: deptId,
      posisi_id: firstJabatan ? String(firstJabatan.id) : (jabatans[0] ? String(jabatans[0].id) : ''),
    }))
  }

  function handleSubmit(status: 'draft' | 'aktif' | 'ditutup') {
    setLoading(true)
    setErrors({})

    const payload = {
      judul: form.judul,
      kd_departement: parseInt(form.kd_departement, 10),
      posisi_id: parseInt(form.posisi_id, 10),
      jumlah_dibutuhkan: parseInt(form.jumlah_dibutuhkan, 10) || 1,
      tipe_pekerjaan: form.tipe_pekerjaan,
      lokasi_kerja: form.lokasi_kerja,
      tgl_buka: form.tgl_buka,
      tgl_tutup: form.tgl_tutup || null,
      deskripsi: form.deskripsi,
      kualifikasi: form.kualifikasi,
      status: status,
    }

    router.put(`/lowongan/${lowongan.id}`, payload, {
      onSuccess: () => setLoading(false),
      onError: (errs) => {
        setLoading(false)
        setErrors(errs)
      },
    })
  }

  return (
    <AppLayout>
      <Head title={`Edit Lowongan: ${lowongan.kode_lowongan}`} />

      <Stack gap={5} className="max-w-5xl mx-auto pb-12">
        {/* Header Title & Back */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1}>
            <Eyebrow>Modul Lowongan & Karir</Eyebrow>
            <Heading level={1}>Edit Lowongan: {lowongan.kode_lowongan}</Heading>
            <Text size="sm" muted>
              Perbarui rincian, status publikasi, dan kualifikasi lowongan pekerjaan
            </Text>
          </Stack>
          <Button
            variant="quiet"
            onClick={() => window.history.back()}
            className="shrink-0"
          >
            ← Kembali
          </Button>
        </div>

        {/* Linked Permintaan Rekrutmen Box if any */}
        {lowongan.permintaan_rekrutmen && (
          <Card>
            <Stack gap={2}>
              <Row justify="between" align="center">
                <Row gap={2} align="center">
                  <Blob icon="database" tone="purple" size="sm" />
                  <Heading level={2} className="text-[15px]">Terkait Permintaan Rekrutmen</Heading>
                </Row>
                <Badge tone="purple">{lowongan.permintaan_rekrutmen.kode_permintaan}</Badge>
              </Row>
              <Grid cols={3}>
                <Stack gap={1}>
                  <Text size="sm" muted>Posisi Diajukan:</Text>
                  <Text><strong>{lowongan.permintaan_rekrutmen.posisi_nama}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Departemen:</Text>
                  <Text><strong>{lowongan.permintaan_rekrutmen.departement_nama}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Requester:</Text>
                  <Text>{lowongan.permintaan_rekrutmen.requester_name ?? '—'}</Text>
                </Stack>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* Main Form Card */}
        <Card>
          <Stack gap={5}>
            <Row justify="between" align="center">
              <Heading level={2} className="text-[18px]">Rincian Informasi Lowongan</Heading>
              <Badge tone={lowongan.status === 'aktif' ? 'mint' : lowongan.status === 'draft' ? 'yellow' : 'pink'}>
                STATUS SAAT INI: {lowongan.status.toUpperCase()}
              </Badge>
            </Row>

            <Field label="Judul Lowongan Pekerjaan *" error={errors.judul || pageErrors?.judul}>
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={form.judul}
                  onChange={(v) => setForm((f) => ({ ...f, judul: v }))}
                />
              )}
            </Field>

            <Grid cols={3}>
              <Field label="Departemen *" error={errors.kd_departement || pageErrors?.kd_departement}>
                {() => (
                  <Select
                    value={form.kd_departement}
                    onChange={handleDepartementChange}
                    options={departements.map((d) => ({
                      value: String(d.id),
                      label: d.deskripsi,
                    }))}
                  />
                )}
              </Field>

              <Field label="Posisi / Jabatan *" error={errors.posisi_id || pageErrors?.posisi_id}>
                {() => (
                  <Select
                    value={form.posisi_id}
                    onChange={(v) => setForm((f) => ({ ...f, posisi_id: v }))}
                    options={filteredJabatans.map((j) => ({
                      value: String(j.id),
                      label: j.nama_jabatan,
                    }))}
                  />
                )}
              </Field>

              <Field label="Jumlah Kebutuhan (Orang) *" error={errors.jumlah_dibutuhkan || pageErrors?.jumlah_dibutuhkan}>
                {(id, describedBy) => (
                  <Input
                    id={id}
                    describedBy={describedBy}
                    type="number"
                    min="1"
                    value={form.jumlah_dibutuhkan}
                    onChange={(v) => setForm((f) => ({ ...f, jumlah_dibutuhkan: v }))}
                    mono
                  />
                )}
              </Field>
            </Grid>

            <Grid cols={2}>
              <Field label="Tipe Pekerjaan *" error={errors.tipe_pekerjaan || pageErrors?.tipe_pekerjaan}>
                {() => (
                  <Select
                    value={form.tipe_pekerjaan}
                    onChange={(v) => setForm((f) => ({ ...f, tipe_pekerjaan: v }))}
                    options={TIPE_PEKERJAAN_OPTIONS}
                  />
                )}
              </Field>

              <Field label="Lokasi Kerja *" error={errors.lokasi_kerja || pageErrors?.lokasi_kerja}>
                {(id, describedBy) => (
                  <Input
                    id={id}
                    describedBy={describedBy}
                    value={form.lokasi_kerja}
                    onChange={(v) => setForm((f) => ({ ...f, lokasi_kerja: v }))}
                  />
                )}
              </Field>
            </Grid>

            <Grid cols={2}>
              <Field label="Tanggal Dibuka *" error={errors.tgl_buka || pageErrors?.tgl_buka}>
                {(id, describedBy) => (
                  <Input
                    id={id}
                    describedBy={describedBy}
                    type="date"
                    value={form.tgl_buka}
                    onChange={(v) => setForm((f) => ({ ...f, tgl_buka: v }))}
                  />
                )}
              </Field>

              <Field label="Batas Akhir Pendaftaran (Tanggal Tutup)" error={errors.tgl_tutup || pageErrors?.tgl_tutup}>
                {(id, describedBy) => (
                  <Input
                    id={id}
                    describedBy={describedBy}
                    type="date"
                    value={form.tgl_tutup}
                    onChange={(v) => setForm((f) => ({ ...f, tgl_tutup: v }))}
                  />
                )}
              </Field>
            </Grid>

            <Field label="Deskripsi & Tanggung Jawab Pekerjaan" error={errors.deskripsi || pageErrors?.deskripsi}>
              {() => (
                <RichTextEditor
                  value={form.deskripsi}
                  onChange={(html) => setForm((f) => ({ ...f, deskripsi: html }))}
                  placeholder="Rincian tanggung jawab dan tugas pekerjaan..."
                  minHeight="140px"
                />
              )}
            </Field>

            <Field label="Kualifikasi & Persyaratan" error={errors.kualifikasi || pageErrors?.kualifikasi}>
              {() => (
                <RichTextEditor
                  value={form.kualifikasi}
                  onChange={(html) => setForm((f) => ({ ...f, kualifikasi: html }))}
                  placeholder="Persyaratan pendidikan, pengalaman, dan keahlian yang dibutuhkan..."
                  minHeight="140px"
                />
              )}
            </Field>

            {/* Bottom Action Buttons */}
            <div className="pt-4 border-t border-[var(--color-line)] flex flex-col sm:flex-row justify-between items-center gap-3">
              <Button
                variant="quiet"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                Batalkan
              </Button>

              <Row gap={3} className="w-full sm:w-auto justify-end">
                {/* Save as Draft */}
                <Button
                  tone="yellow"
                  loading={loading}
                  onClick={() => handleSubmit('draft')}
                  className="w-full sm:w-auto"
                >
                  💾 Simpan sebagai Draft
                </Button>

                {/* Publish / Keep Active */}
                <Button
                  tone="purple"
                  loading={loading}
                  onClick={() => handleSubmit('aktif')}
                  className="w-full sm:w-auto"
                >
                  🚀 {lowongan.status === 'aktif' ? 'Simpan Perubahan' : 'Publikasikan Lowongan'}
                </Button>
              </Row>
            </div>
          </Stack>
        </Card>
      </Stack>
    </AppLayout>
  )
}
