import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import { Table } from '@/components/pouf/table'
import { Badge, Blob, Dot } from '@/components/pouf/media'
import { Confirm, Select } from '@/components/pouf/controls'
import { RichTextEditor } from '@/components/pouf/RichTextEditor'
import type { Tone } from '@/components/pouf/tone'

interface PelamarSummary {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  foto_url?: string | null
  email: string
  nomor_kontak: string
  pendidikan_terakhir: string
  nama_institusi: string
  jurusan: string
  status: string
  created_at?: string | null
}

interface LowonganDetail {
  id: number
  kode_lowongan: string
  slug: string
  judul: string
  kd_departement: number
  departement?: {
    id: number
    kd_departement: string
    deskripsi: string
  } | null
  posisi_id: number
  jabatan?: {
    id: number
    nama_jabatan: string
  } | null
  permintaan_rekrutmen?: {
    id: number
    kode_permintaan: string
    requester_name?: string
    target_join?: string
    prioritas?: string
  } | null
  jumlah_dibutuhkan: number
  pelamars_count: number
  lokasi_kerja: string
  tipe_pekerjaan: string
  deskripsi?: string | null
  kualifikasi?: string | null
  tgl_buka?: string | null
  tgl_tutup?: string | null
  status: 'aktif' | 'ditutup' | 'draft'
  share_url: string
  created_at?: string
  pelamars: PelamarSummary[]
}

interface Props {
  lowongan: LowonganDetail
}

const STATUS_TONE: Record<string, Tone> = {
  aktif: 'mint',
  ditutup: 'pink',
  draft: 'yellow',
}

const PELAMAR_STATUS_TONE: Record<string, Tone> = {
  submitted: 'yellow',
  review: 'blue',
  interview: 'purple',
  accepted: 'mint',
  rejected: 'pink',
}

const PELAMAR_STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  review: 'Review Berkas',
  interview: 'Interview',
  accepted: 'Diterima',
  rejected: 'Ditolak',
}

export default function Show({ lowongan }: Props) {
  const { flash, errors: pageErrors } = usePage<any>().props

  const [form, setForm] = useState({
    judul: lowongan.judul,
    lokasi_kerja: lowongan.lokasi_kerja,
    tipe_pekerjaan: lowongan.tipe_pekerjaan,
    deskripsi: lowongan.deskripsi || '',
    kualifikasi: lowongan.kualifikasi || '',
    tgl_buka: lowongan.tgl_buka || '',
    tgl_tutup: lowongan.tgl_tutup || '',
    status: lowongan.status,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  function submitEdit() {
    setLoading(true)
    setErrors({})

    router.put(`/lowongan/${lowongan.id}`, form, {
      onSuccess: () => setLoading(false),
      onError: (errs) => {
        setLoading(false)
        setErrors(errs)
      },
    })
  }

  function toggleStatus() {
    router.post(`/lowongan/${lowongan.id}/toggle-status`)
  }

  function destroy() {
    router.delete(`/lowongan/${lowongan.id}`)
  }

  function copyShareUrl() {
    navigator.clipboard.writeText(lowongan.share_url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  const pelamarColumns = [
    {
      key: 'no_pendaftaran',
      header: 'No. Pendaftaran',
      mono: true,
      render: (p: PelamarSummary) => (
        <Badge tone="purple">{p.no_pendaftaran}</Badge>
      ),
    },
    {
      key: 'nama',
      header: 'Nama Kandidat & Kontak',
      render: (p: PelamarSummary) => (
        <Row gap={2} wrap={false} align="center">
          {p.foto_url ? (
            <div className="w-8 h-10 rounded-[6px] overflow-hidden border border-[var(--color-line)] shrink-0 bg-black/5 shadow-xs">
              <img src={p.foto_url} alt={p.nama_lengkap} className="w-full h-full object-cover" />
            </div>
          ) : (
            <Blob icon="user" tone="blue" size="sm" />
          )}
          <Stack gap={1}>
            <Text><strong>{p.nama_lengkap}</strong></Text>
            <Text size="sm" muted mono>{p.email} &bull; {p.nomor_kontak}</Text>
          </Stack>
        </Row>
      ),
    },
    {
      key: 'pendidikan',
      header: 'Pendidikan',
      render: (p: PelamarSummary) => (
        <Text size="sm">
          <strong>{p.pendidikan_terakhir}</strong> {p.jurusan} ({p.nama_institusi})
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status Seleksi',
      render: (p: PelamarSummary) => (
        <Row gap={2} align="center" wrap={false}>
          <Dot tone={PELAMAR_STATUS_TONE[p.status] || 'yellow'} />
          <Badge tone={PELAMAR_STATUS_TONE[p.status] || 'yellow'}>
            {PELAMAR_STATUS_LABEL[p.status] || p.status}
          </Badge>
        </Row>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right' as const,
      render: (p: PelamarSummary) => (
        <Button
          size="sm"
          variant="quiet"
          tone="purple"
          onClick={() => router.get(`/pelamar/${p.id}`)}
        >
          Lihat Pelamar ↗
        </Button>
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title={`Detail Lowongan - ${lowongan.judul}`} />
      <Stack gap={5}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 w-full">

          <Row gap={2} align="center" className="shrink-0 w-full md:w-auto justify-start md:justify-end">
            <Button
              tone="blue"
              onClick={() => router.get('/lowongan')}
              className="w-full sm:w-auto"
            >
              ← Kembali
            </Button>
          </Row>
        </div>

        {/* Flash Notifications */}
        {(flash as any)?.success && (
          <Card variant="tight">
            <Row gap={2} align="center">
              <Blob icon="ok" tone="mint" size="sm" />
              <Text>{(flash as any).success}</Text>
            </Row>
          </Card>
        )}

        {/* 1. Public Shareable Link Card */}
        <Card variant="tight">
          <Stack gap={3}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
              <Row gap={2} align="center">
                <Blob icon="target" tone="purple" size="sm" />
                <Heading level={2}>Tautan Pendaftaran Lowongan (Publik)</Heading>
              </Row>

            </div>

            <Text size="sm" muted>
              Bagikan link formulir ini kepada calon pelamar atau publik untuk mengumpulkan data pendaftaran secara otomatis.
            </Text>

            <div className="bg-[var(--color-surface)] p-3 rounded-[12px] ">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="flex-1 min-w-0">
                  <Input
                    value={lowongan.share_url}
                    onChange={() => {}}
                    readOnly
                    mono
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={copyShareUrl}
                    className="flex-1 sm:flex-none"
                  >
                    {copiedLink ? '✓ Tersalin!' : 'Salin URL'}
                  </Button>
                  <Button
                    size="sm"
                    tone="mint"
                    onClick={() => window.open(lowongan.share_url, '_blank')}
                    className="flex-1 sm:flex-none"
                  >
                    Buka Form Publik ↗
                  </Button>
                </div>
              </div>
            </div>
          </Stack>
        </Card>

        {/* 2. Informasi Permintaan Rekrutmen Asal */}
        {lowongan.permintaan_rekrutmen && (
          <Card variant="tight">
            <Stack gap={3}>
              <Row gap={2} align="center">
                <Blob icon="database" tone="blue" size="sm" />
                <Heading level={2}>Sumber Permintaan Rekrutmen</Heading>
              </Row>
              <Grid cols={3}>
                <Stack gap={1}>
                  <Text size="sm" muted>Kode Permintaan:</Text>
                  <Text><strong>{lowongan.permintaan_rekrutmen.kode_permintaan}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Requester (Pembuat):</Text>
                  <Text><strong>{lowongan.permintaan_rekrutmen.requester_name ?? '—'}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Target Masuk (Join):</Text>
                  <Text mono><strong>{lowongan.permintaan_rekrutmen.target_join ?? '—'}</strong></Text>
                </Stack>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* 3. Form Edit Informasi Lowongan */}
        <Card>
          <Stack gap={4}>
            <Row gap={2} align="center">
              <Blob icon="settings" tone="mint" size="sm" />
              <Heading level={2}>Pengaturan & Informasi Lowongan</Heading>
            </Row>

            <Field label="Judul Lowongan Pekerjaan *" error={errors.judul || pageErrors?.judul}>
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={form.judul}
                  onChange={(v) => setForm((f) => ({ ...f, judul: v }))}
                  placeholder="contoh: Senior Backend Developer"
                />
              )}
            </Field>

            <Grid cols={3}>
              <Field label="Tipe Pekerjaan *" error={errors.tipe_pekerjaan || pageErrors?.tipe_pekerjaan}>
                {() => (
                  <Select
                    value={form.tipe_pekerjaan}
                    onChange={(v) => setForm((f) => ({ ...f, tipe_pekerjaan: v }))}
                    options={[
                      { value: 'Full-time', label: 'Full-time' },
                      { value: 'Contract', label: 'Kontrak' },
                      { value: 'Internship', label: 'Magang' },
                      { value: 'Part-time', label: 'Part-time' },
                    ]}
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
                    placeholder="contoh: Jakarta Selatan / Hybrid"
                  />
                )}
              </Field>

              <Field label="Status Lowongan *" error={errors.status || pageErrors?.status}>
                {() => (
                  <Select
                    value={form.status}
                    onChange={(v) => setForm((f) => ({ ...f, status: v as any }))}
                    options={[
                      { value: 'aktif', label: 'Aktif (Terbuka)' },
                      { value: 'ditutup', label: 'Ditutup' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                  />
                )}
              </Field>
            </Grid>

            <Grid cols={2}>
              <Field label="Tanggal Buka *" error={errors.tgl_buka || pageErrors?.tgl_buka}>
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

              <Field label="Batas Akhir Pendaftaran (Tgl Tutup)" error={errors.tgl_tutup || pageErrors?.tgl_tutup}>
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

            <Field label="Deskripsi Pekerjaan" error={errors.deskripsi || pageErrors?.deskripsi}>
              {() => (
                <RichTextEditor
                  value={form.deskripsi}
                  onChange={(html) => setForm((f) => ({ ...f, deskripsi: html }))}
                  placeholder="Rincian tanggung jawab dan tugas posisi ini..."
                  minHeight="140px"
                />
              )}
            </Field>

            <Field label="Kualifikasi & Persyaratan" error={errors.kualifikasi || pageErrors?.kualifikasi}>
              {() => (
                <RichTextEditor
                  value={form.kualifikasi}
                  onChange={(html) => setForm((f) => ({ ...f, kualifikasi: html }))}
                  placeholder="Syarat pendidikan, pengalaman, dan keahlian yang dibutuhkan..."
                  minHeight="140px"
                />
              )}
            </Field>

            <Row justify="end" gap={2}>
              <Button loading={loading} onClick={submitEdit}>
                Simpan Perubahan Lowongan
              </Button>
            </Row>
          </Stack>
        </Card>

        {/* 4. Daftar Pelamar yang Masuk */}
        <Card>
          <Stack gap={4}>
            <Row justify="between" align="center">
              <Row gap={2} align="center">
                <Blob icon="users" tone="purple" size="sm" />
                <Heading level={2}>Daftar Pelamar Terdaftar ({lowongan.pelamars.length})</Heading>
              </Row>
              <Button
                size="sm"
                tone="purple"
                onClick={() => router.get('/pelamar', { lowongan_id: lowongan.id })}
              >
                Buka Manajemen Pelamar Lengkap ↗
              </Button>
            </Row>

            {lowongan.pelamars.length > 0 ? (
              <Table
                rows={lowongan.pelamars}
                columns={pelamarColumns}
                getKey={(p) => String(p.id)}
              />
            ) : (
              <div className="text-center py-6 text-[var(--color-ink-muted)]">
                <Text size="sm" muted>Belum ada kandidat yang melamar pada lowongan ini.</Text>
              </div>
            )}
          </Stack>
        </Card>

        {/* Bottom Actions: Toggle Status & Delete */}
        <Card variant="tight">
          <Row justify="between" align="center">
            <Button
              tone={lowongan.status === 'aktif' ? 'pink' : 'mint'}
              onClick={toggleStatus}
            >
              {lowongan.status === 'aktif' ? '✕ Tutup Lowongan' : '✓ Buka Lowongan'}
            </Button>

            <Confirm
              title={`Hapus Lowongan "${lowongan.judul}"?`}
              body="Lowongan dan seluruh berkas data pelamar terkait akan dihapus secara permanen."
              confirmLabel="Hapus Lowongan"
              cancelLabel="Batalkan"
              tone="orange"
              onConfirm={destroy}
            >
              <Button tone="pink">
                Hapus Lowongan
              </Button>
            </Confirm>
          </Row>
        </Card>
      </Stack>
    </AppLayout>
  )
}
