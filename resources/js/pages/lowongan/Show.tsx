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
import type { Tone } from '@/components/pouf/tone'

interface PelamarSummary {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
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
          <Blob icon="user" tone="blue" size="sm" />
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
        {/* Navigation back and header */}
        <Row justify="between" align="center">
          <Stack gap={1}>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => router.get('/lowongan')}
            >
              ← Kembali ke Daftar Lowongan
            </Button>
            <Heading level={1}>Detail Lowongan: {lowongan.judul}</Heading>
            <Text size="sm" muted>
              Kode: <strong>{lowongan.kode_lowongan}</strong> &bull; Departemen: <strong>{lowongan.departement?.deskripsi ?? '—'}</strong>
            </Text>
          </Stack>

          <Row gap={2} align="center">
            <Badge tone={STATUS_TONE[lowongan.status] || 'yellow'}>
              STATUS: {lowongan.status.toUpperCase()}
            </Badge>
          </Row>
        </Row>

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
            <Row justify="between" align="center">
              <Row gap={2} align="center">
                <Blob icon="target" tone="purple" size="sm" />
                <Heading level={2}>Tautan Pendaftaran Lowongan (Publik)</Heading>
              </Row>
              <Badge tone="blue">
                {lowongan.pelamars_count} Pelamar Terdaftar / Kuota: {lowongan.jumlah_dibutuhkan} Posisi
              </Badge>
            </Row>

            <Text size="sm" muted>
              Bagikan link formulir ini kepada calon pelamar atau publik untuk mengumpulkan data pendaftaran secara otomatis.
            </Text>

            <div className="bg-[var(--color-surface)] p-3 rounded-[12px] border border-[var(--color-line)]">
              <Row gap={2} align="center">
                <Input
                  value={lowongan.share_url}
                  onChange={() => {}}
                  readOnly
                  mono
                />
                <Button
                  size="sm"
                  variant="quiet"
                  onClick={copyShareUrl}
                >
                  {copiedLink ? '✓ Tersalin!' : 'Salin URL'}
                </Button>
                <Button
                  size="sm"
                  tone="purple"
                  onClick={() => window.open(lowongan.share_url, '_blank')}
                >
                  Buka Form Publik ↗
                </Button>
              </Row>
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
                <textarea
                  className="w-full min-h-[90px] p-3 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] text-[14px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
                  value={form.deskripsi}
                  onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
                  placeholder="Rincian tanggung jawab dan tugas posisi ini..."
                />
              )}
            </Field>

            <Field label="Kualifikasi & Persyaratan" error={errors.kualifikasi || pageErrors?.kualifikasi}>
              {() => (
                <textarea
                  className="w-full min-h-[90px] p-3 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] text-[14px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
                  value={form.kualifikasi}
                  onChange={(e) => setForm((f) => ({ ...f, kualifikasi: e.target.value }))}
                  placeholder="Syarat pendidikan, pengalaman, dan keahlian yang dibutuhkan..."
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
                variant="quiet"
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
              variant="quiet"
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
              <Button variant="quiet" tone="pink">
                Hapus Lowongan
              </Button>
            </Confirm>
          </Row>
        </Card>
      </Stack>
    </AppLayout>
  )
}
