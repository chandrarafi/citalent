import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Input } from '@/components/pouf/Input'
import { Table } from '@/components/pouf/table'
import { Stat } from '@/components/pouf/readout'
import { Badge, Blob, Dot } from '@/components/pouf/media'
import { Select } from '@/components/pouf/controls'
import { Pagination } from '@/components/pouf/pagination'
import type { Tone } from '@/components/pouf/tone'

interface LowonganOption {
  id: number
  kode_lowongan: string
  judul: string
}

interface PelamarItem {
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
  foto_url?: string | null
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
  pelamars: PelamarItem[]
  lowongans: LowonganOption[]
  selectedLowonganId?: string | number | null
}

const STATUS_SELEKSI_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'submitted', label: '1. Submit Lamaran' },
  { value: 'screening_cv', label: '2. Screening CV' },
  { value: 'interview_hr', label: '3. Interview HR' },
  { value: 'skill_test', label: '4. Skill Test' },
  { value: 'interview_user', label: '5. Interview User' },
  { value: 'final_discussion', label: '6. Final Discussion' },
  { value: 'accepted', label: 'Diterima (Accepted)' },
  { value: 'rejected', label: 'Ditolak (Rejected)' },
]

const STATUS_TONE: Record<string, Tone> = {
  submitted: 'yellow',
  screening_cv: 'blue',
  interview_hr: 'purple',
  skill_test: 'orange',
  interview_user: 'blue',
  final_discussion: 'mint',
  accepted: 'mint',
  rejected: 'pink',
  review: 'blue',
  interview: 'purple',
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submit Lamaran',
  screening_cv: 'Screening CV',
  interview_hr: 'Interview HR',
  skill_test: 'Skill Test',
  interview_user: 'Interview User',
  final_discussion: 'Final Discussion',
  accepted: 'Diterima',
  rejected: 'Ditolak',
  review: 'Screening CV',
  interview: 'Interview HR',
}

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
]

export default function Index({ pelamars, lowongans, selectedLowonganId }: Props) {
  const { flash } = usePage<any>().props

  const [search, setSearch] = useState('')
  const [lowonganFilter, setLowonganFilter] = useState<string>(
    selectedLowonganId ? String(selectedLowonganId) : 'all'
  )
  const [statusFilter, setStatusFilter] = useState('all')
  const [pageSize, setPageSize] = useState('5')
  const [page, setPage] = useState(1)

  // Filtered Pelamars
  const filteredPelamars = useMemo(() => {
    return pelamars.filter((p) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        p.no_pendaftaran.toLowerCase().includes(q) ||
        p.nama_lengkap.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.nomor_kontak.toLowerCase().includes(q) ||
        p.posisi_dilamar.toLowerCase().includes(q) ||
        p.nama_institusi.toLowerCase().includes(q) ||
        p.jurusan.toLowerCase().includes(q)

      const matchLowongan =
        lowonganFilter === 'all' ||
        String(p.lowongan?.id) === String(lowonganFilter)

      const matchStatus =
        statusFilter === 'all' || p.status === statusFilter

      return matchSearch && matchLowongan && matchStatus
    })
  }, [pelamars, search, lowonganFilter, statusFilter])

  // Pagination calculations
  const limit = parseInt(pageSize, 10) || 5
  const totalPages = Math.max(1, Math.ceil(filteredPelamars.length / limit))

  const paginatedPelamars = useMemo(() => {
    const start = (page - 1) * limit
    return filteredPelamars.slice(start, start + limit)
  }, [filteredPelamars, page, limit])

  const startIndex = filteredPelamars.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredPelamars.length)

  // KPI calculations
  const stats = useMemo(() => {
    const total = pelamars.length
    const submitted = pelamars.filter((p) => p.status === 'submitted').length
    const review = pelamars.filter((p) => p.status === 'review').length
    const interview = pelamars.filter((p) => p.status === 'interview').length
    const accepted = pelamars.filter((p) => p.status === 'accepted').length
    const rejected = pelamars.filter((p) => p.status === 'rejected').length
    return { total, submitted, review, interview, accepted, rejected }
  }, [pelamars])

  const columns = [
    {
      key: 'no_pendaftaran',
      header: 'No. Pendaftaran',
      mono: true,
      minWidth: '150px',
      render: (p: PelamarItem) => (
        <Badge tone="purple">{p.no_pendaftaran}</Badge>
      ),
      sort: (a: PelamarItem, b: PelamarItem) => a.no_pendaftaran.localeCompare(b.no_pendaftaran),
    },
    {
      key: 'kandidat',
      header: 'Nama Kandidat & Kontak',
      minWidth: '220px',
      render: (p: PelamarItem) => (
        <Row gap={2} wrap={false} align="center" className="min-w-[190px]">
          {p.foto_url ? (
            <div className="w-8 h-10 rounded-[6px] overflow-hidden border border-[var(--color-line)] shrink-0 bg-black/5 shadow-xs">
              <img src={p.foto_url} alt={p.nama_lengkap} className="w-full h-full object-cover" />
            </div>
          ) : (
            <Blob icon="user" tone="blue" size="sm" className="shrink-0" />
          )}
          <Stack gap={1} className="min-w-0">
            <Text className="whitespace-nowrap">
              <strong>{p.nama_lengkap}</strong>
            </Text>
            <Text size="sm" muted mono className="whitespace-nowrap">
              {p.email} &bull; {p.nomor_kontak}
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a: PelamarItem, b: PelamarItem) => a.nama_lengkap.localeCompare(b.nama_lengkap),
    },
    {
      key: 'posisi_lowongan',
      header: 'Posisi yang Dilamar',
      minWidth: '180px',
      render: (p: PelamarItem) => (
        <Stack gap={1} className="whitespace-nowrap">
          <Text size="sm"><strong>{p.posisi_dilamar}</strong></Text>
          <Text size="sm" muted>
            {p.lowongan?.judul ?? '—'} ({p.lowongan?.kode_lowongan ?? '—'})
          </Text>
        </Stack>
      ),
      sort: (a: PelamarItem, b: PelamarItem) => a.posisi_dilamar.localeCompare(b.posisi_dilamar),
    },
    {
      key: 'pendidikan',
      header: 'Pendidikan Terakhir',
      minWidth: '170px',
      render: (p: PelamarItem) => (
        <Stack gap={1} className="whitespace-nowrap">
          <Text size="sm">
            <Badge tone="blue">{p.pendidikan_terakhir}</Badge> {p.jurusan}
          </Text>
          <Text size="sm" muted>
            {p.nama_institusi} ({p.tahun_lulus})
          </Text>
        </Stack>
      ),
    },
    {
      key: 'tgl_daftar',
      header: 'Tgl Melamar',
      mono: true,
      minWidth: '120px',
      render: (p: PelamarItem) => (
        <Text size="sm" muted mono className="whitespace-nowrap">
          {p.created_at ?? '—'}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status Seleksi',
      align: 'right' as const,
      minWidth: '140px',
      render: (p: PelamarItem) => (
        <Row gap={2} justify="end" align="center" wrap={false} className="shrink-0 whitespace-nowrap">
          <Dot tone={STATUS_TONE[p.status] || 'yellow'} />
          <Badge tone={STATUS_TONE[p.status] || 'yellow'}>
            {STATUS_LABEL[p.status] || p.status.toUpperCase()}
          </Badge>
        </Row>
      ),
      sort: (a: PelamarItem, b: PelamarItem) => a.status.localeCompare(b.status),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right' as const,
      minWidth: '150px',
      render: (p: PelamarItem) => (
        <Row gap={2} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
          <Button
            size="sm"
            variant="quiet"
            tone="purple"
            onClick={() => router.get(`/pelamar/${p.id}`)}
          >
            Detail Pelamar ↗
          </Button>
        </Row>
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Manajemen Data Pelamar" />
      <Stack gap={5}>
        {/* Header Title */}
        <Row justify="between" align="center">
          <Stack gap={1}>
            <Eyebrow>Modul Rekrutmen & Talenta</Eyebrow>
            <Heading level={1}>Manajemen Data Pelamar / Kandidat</Heading>
            <Text size="sm" muted>
              Pantau seluruh berkas pelamar masuk, tinjau CV & surat lamaran, dan perbarui tahapan seleksi kandidat
            </Text>
          </Stack>
        </Row>

        {/* Top KPI Stats */}
        <Grid cols={4}>
          <Stat
            label="Total Pelamar"
            value={String(stats.total)}
            icon="users"
            tone="purple"
          />
          <Stat
            label="Proses Seleksi"
            value={`${stats.submitted + stats.review + stats.interview} Kandidat`}
            icon="clock"
            tone="yellow"
          />
          <Stat
            label="Diterima (Hired)"
            value={`${stats.accepted} Orang`}
            icon="ok"
            tone="mint"
          />
          <Stat
            label="Ditolak"
            value={`${stats.rejected} Orang`}
            icon="fail"
            tone="pink"
          />
        </Grid>

        {/* Flash Notifications */}
        {(flash as any)?.success && (
          <Card variant="tight">
            <Row gap={2} align="center">
              <Blob icon="ok" tone="mint" size="sm" />
              <Text>{(flash as any).success}</Text>
            </Row>
          </Card>
        )}

        {/* DataTable Card */}
        <Card>
          <Stack gap={4}>
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 w-full">
              <div className="w-full lg:max-w-[340px]">
                <Input
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setPage(1)
                  }}
                  placeholder="Cari no. daftar, nama, email, kampus..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                {/* Lowongan Filter */}
                <div className="flex-1 sm:flex-none min-w-[150px] sm:w-[200px]">
                  <Select
                    value={lowonganFilter}
                    onChange={(v) => {
                      setLowonganFilter(v)
                      setPage(1)
                    }}
                    options={[
                      { value: 'all', label: 'Semua Lowongan' },
                      ...lowongans.map((l) => ({
                        value: String(l.id),
                        label: `${l.kode_lowongan} - ${l.judul}`,
                      })),
                    ]}
                  />
                </div>

                {/* Status Seleksi Filter */}
                <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[170px]">
                  <Select
                    value={statusFilter}
                    onChange={(v) => {
                      setStatusFilter(v)
                      setPage(1)
                    }}
                    options={STATUS_SELEKSI_OPTIONS}
                  />
                </div>

                {/* Page Size */}
                <div className="w-[110px]">
                  <Select
                    value={pageSize}
                    onChange={(v) => {
                      setPageSize(v)
                      setPage(1)
                    }}
                    options={PAGE_SIZE_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* Pouf Table */}
            <Table
              rows={paginatedPelamars}
              columns={columns}
              getKey={(p) => String(p.id)}
            />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
              <Text size="sm" muted className="text-center sm:text-left">
                Menampilkan {startIndex}-{endIndex} dari {filteredPelamars.length} data (Halaman {page} dari {totalPages})
              </Text>
              <Pagination
                page={page}
                total={totalPages}
                onChange={(p) => setPage(p)}
              />
            </div>
          </Stack>
        </Card>
      </Stack>
    </AppLayout>
  )
}
