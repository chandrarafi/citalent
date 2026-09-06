import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge, Blob } from '@/components/pouf/media'
import { Confirm } from '@/components/pouf/controls'
import type { Tone } from '@/components/pouf/tone'

interface PelamarDetail {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir?: string | null
  jenis_kelamin: 'Laki-laki' | 'Perempuan'
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
  cv_url?: string | null
  surat_lamaran_url?: string | null
  status: 'submitted' | 'review' | 'interview' | 'accepted' | 'rejected'
  catatan?: string | null
  lowongan?: {
    id: number
    kode_lowongan: string
    judul: string
    departemen_nama?: string
    posisi_nama?: string
  } | null
  created_at?: string | null
}

interface Props {
  pelamar: PelamarDetail
}

const STATUS_TONE: Record<string, Tone> = {
  submitted: 'yellow',
  review: 'blue',
  interview: 'purple',
  accepted: 'mint',
  rejected: 'pink',
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted (Terkirim)',
  review: 'Lolos Review Berkas',
  interview: 'Tahap Interview / Tes',
  accepted: 'Diterima Bekerja (Accepted)',
  rejected: 'Ditolak (Rejected)',
}

export default function Show({ pelamar }: Props) {
  const { flash } = usePage<any>().props

  function destroy() {
    router.delete(`/pelamar/${pelamar.id}`)
  }

  return (
    <AppLayout>
      <Head title={`Detail Pelamar - ${pelamar.nama_lengkap}`} />
      <Stack gap={5}>
        {/* Navigation & Header */}
        <Row justify="between" align="center">
          <Stack gap={1}>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => router.get('/pelamar')}
            >
              ← Kembali ke Data Pelamar
            </Button>
            <Heading level={1}>Rincian Pelamar: {pelamar.nama_lengkap}</Heading>
            <Text size="sm" muted>
              No. Pendaftaran: <strong className="font-mono">{pelamar.no_pendaftaran}</strong> &bull; Melamar Pada: <strong>{pelamar.created_at ?? '—'}</strong>
            </Text>
          </Stack>

          <Badge tone={STATUS_TONE[pelamar.status] || 'yellow'}>
            STATUS: {STATUS_LABEL[pelamar.status] || pelamar.status.toUpperCase()}
          </Badge>
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

        {/* 1. Lowongan yang Dilamar Banner */}
        <Card variant="tight">
          <Row justify="between" align="center">
            <Stack gap={1}>
              <Eyebrow>{pelamar.lowongan?.departemen_nama ?? 'Departemen'}</Eyebrow>
              <Heading level={2}>Posisi Dilamar: {pelamar.posisi_dilamar}</Heading>
              <Text size="sm" muted>
                Lowongan: <strong>{pelamar.lowongan?.judul ?? '—'}</strong> ({pelamar.lowongan?.kode_lowongan ?? '—'})
              </Text>
            </Stack>
            {pelamar.lowongan && (
              <Button
                variant="quiet"
                size="sm"
                tone="purple"
                onClick={() => router.get(`/lowongan/${pelamar.lowongan!.id}`)}
              >
                Lihat Detail Lowongan ↗
              </Button>
            )}
          </Row>
        </Card>

        {/* 2. Data Pribadi Kandidat */}
        <Card>
          <Stack gap={4}>
            <Row gap={2} align="center">
              <Blob icon="user" tone="purple" size="sm" />
              <Heading level={2}>1. Data Pribadi Kandidat</Heading>
            </Row>

            <Grid cols={2}>
              <Stack gap={1}>
                <Text size="sm" muted>Nama Lengkap (Sesuai KTP):</Text>
                <Text><strong>{pelamar.nama_lengkap}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Tempat, Tanggal Lahir:</Text>
                <Text>{pelamar.tempat_lahir}, {pelamar.tanggal_lahir ?? '—'}</Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Jenis Kelamin:</Text>
                <Text>{pelamar.jenis_kelamin}</Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Status Pernikahan & Agama:</Text>
                <Text>{pelamar.status_pernikahan} &bull; {pelamar.agama}</Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Nomor WhatsApp / HP Aktif:</Text>
                <Text mono><strong>{pelamar.nomor_kontak}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Email Aktif:</Text>
                <Text mono><strong>{pelamar.email}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Kota Domisili Saat Ini:</Text>
                <Text>{pelamar.domisili}</Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Alamat Lengkap KTP:</Text>
                <Text>{pelamar.alamat}</Text>
              </Stack>
            </Grid>
          </Stack>
        </Card>

        {/* 3. Riwayat Pendidikan */}
        <Card>
          <Stack gap={4}>
            <Row gap={2} align="center">
              <Blob icon="target" tone="blue" size="sm" />
              <Heading level={2}>2. Riwayat Pendidikan Terakhir</Heading>
            </Row>

            <Grid cols={2}>
              <Stack gap={1}>
                <Text size="sm" muted>Jenjang Pendidikan:</Text>
                <Text><strong>{pelamar.pendidikan_terakhir}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Nama Institusi / Universitas / Sekolah:</Text>
                <Text><strong>{pelamar.nama_institusi}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Jurusan:</Text>
                <Text>{pelamar.jurusan}</Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Tahun Kelulusan:</Text>
                <Text mono>{pelamar.tahun_lulus}</Text>
              </Stack>
            </Grid>
          </Stack>
        </Card>

        {/* 4. Dokumen & Berkas Lamaran */}
        <Card>
          <Stack gap={4}>
            <Row gap={2} align="center">
              <Blob icon="database" tone="mint" size="sm" />
              <Heading level={2}>3. Dokumen & Berkas Lamaran</Heading>
            </Row>

            <Row gap={3} wrap={true}>
              {pelamar.cv_url ? (
                <Button
                  tone="purple"
                  onClick={() => window.open(pelamar.cv_url!, '_blank')}
                >
                  📄 Buka & Unduh CV Pelamar (PDF) ↗
                </Button>
              ) : (
                <Badge tone="pink">Berkas CV Tidak Ditemukan</Badge>
              )}

              {pelamar.surat_lamaran_url && (
                <Button
                  variant="quiet"
                  onClick={() => window.open(pelamar.surat_lamaran_url!, '_blank')}
                >
                  📝 Buka Surat Lamaran (PDF) ↗
                </Button>
              )}
            </Row>
          </Stack>
        </Card>

        {/* Bottom Actions: Delete Candidate */}
        <Card variant="tight">
          <Row justify="between" align="center">
            <Confirm
              title={`Hapus Data Pelamar "${pelamar.nama_lengkap}"?`}
              body="Seluruh data lamaran dan berkas PDF CV/Surat lamaran akan dihapus secara permanen dari server."
              confirmLabel="Hapus Data Pelamar"
              cancelLabel="Batalkan"
              tone="orange"
              onConfirm={destroy}
            >
              <Button variant="quiet" tone="pink">
                Hapus Data Pelamar
              </Button>
            </Confirm>

            <Button variant="quiet" onClick={() => router.get('/pelamar')}>
              Kembali ke Daftar
            </Button>
          </Row>
        </Card>
      </Stack>
    </AppLayout>
  )
}
