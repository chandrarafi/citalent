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

interface LowonganItem {
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
}

interface Props {
  lowongans: LowonganItem[]
  departements: DepartementItem[]
  jabatans: JabatanItem[]
}

const TIPE_PEKERJAAN_OPTIONS = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Contract', label: 'Kontrak (PKWT)' },
  { value: 'Internship', label: 'Magang' },
  { value: 'Part-time', label: 'Part-time' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'aktif', label: 'Aktif (Terbuka)' },
  { value: 'ditutup', label: 'Ditutup' },
  { value: 'draft', label: 'Draft' },
]

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
]

const STATUS_TONE: Record<string, Tone> = {
  aktif: 'mint',
  ditutup: 'pink',
  draft: 'yellow',
}

export default function Index({ lowongans, departements }: Props) {
  const { flash } = usePage<any>().props

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [tipeFilter, setTipeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pageSize, setPageSize] = useState('5')
  const [page, setPage] = useState(1)

  // Filtered lowongans
  const filteredLowongans = useMemo(() => {
    return lowongans.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        item.kode_lowongan.toLowerCase().includes(q) ||
        item.judul.toLowerCase().includes(q) ||
        (item.jabatan?.nama_jabatan && item.jabatan.nama_jabatan.toLowerCase().includes(q)) ||
        (item.departement?.deskripsi && item.departement.deskripsi.toLowerCase().includes(q))

      const matchDept = deptFilter === 'all' || String(item.kd_departement) === String(deptFilter)
      const matchTipe = tipeFilter === 'all' || item.tipe_pekerjaan === tipeFilter
      const matchStatus = statusFilter === 'all' || item.status === statusFilter

      return matchSearch && matchDept && matchTipe && matchStatus
    })
  }, [lowongans, search, deptFilter, tipeFilter, statusFilter])

  // Pagination calculations
  const limit = parseInt(pageSize, 10) || 5
  const totalPages = Math.max(1, Math.ceil(filteredLowongans.length / limit))

  const paginatedLowongans = useMemo(() => {
    const start = (page - 1) * limit
    return filteredLowongans.slice(start, start + limit)
  }, [filteredLowongans, page, limit])

  const startIndex = filteredLowongans.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredLowongans.length)

  // KPI calculations
  const stats = useMemo(() => {
    const total = lowongans.length
    const aktif = lowongans.filter((l) => l.status === 'aktif').length
    const draft = lowongans.filter((l) => l.status === 'draft').length
    const ditutup = lowongans.filter((l) => l.status === 'ditutup').length
    const totalPelamar = lowongans.reduce((sum, l) => sum + (l.pelamars_count || 0), 0)
    return { total, aktif, draft, ditutup, totalPelamar }
  }, [lowongans])

  const columns = [
    {
      key: 'kode',
      header: 'Kode Lowongan',
      mono: true,
      render: (item: LowonganItem) => (
        <Badge tone="purple">{item.kode_lowongan}</Badge>
      ),
      sort: (a: LowonganItem, b: LowonganItem) => a.kode_lowongan.localeCompare(b.kode_lowongan),
    },
    {
      key: 'lowongan_posisi',
      header: 'Lowongan & Posisi',
      minWidth: '220px',
      render: (item: LowonganItem) => (
        <Row gap={3} wrap={false} align="center" className="min-w-[190px]">
          <Blob icon="target" tone="purple" size="sm" className="shrink-0" />
          <Stack gap={1} className="min-w-0">
            <Text className="whitespace-nowrap">
              <strong>{item.judul}</strong>
            </Text>
            <Text size="sm" muted className="whitespace-nowrap">
              Posisi: {item.jabatan?.nama_jabatan ?? '—'} &bull; Permintaan: {item.permintaan_rekrutmen?.kode_permintaan ?? '—'}
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a: LowonganItem, b: LowonganItem) => a.judul.localeCompare(b.judul),
    },
    {
      key: 'departemen',
      header: 'Departemen',
      minWidth: '150px',
      render: (item: LowonganItem) => (
        <Text size="sm" className="whitespace-nowrap">
          <strong>{item.departement?.deskripsi ?? `Dept #${item.kd_departement}`}</strong>
        </Text>
      ),
      sort: (a: LowonganItem, b: LowonganItem) =>
        (a.departement?.deskripsi ?? '').localeCompare(b.departement?.deskripsi ?? ''),
    },
    {
      key: 'kebutuhan_pelamar',
      header: 'Pelamar / Kuota',
      align: 'right' as const,
      mono: true,
      minWidth: '150px',
      render: (item: LowonganItem) => (
        <Badge tone={item.pelamars_count > 0 ? 'mint' : 'blue'} className="whitespace-nowrap">
          {item.pelamars_count} Pelamar / {item.jumlah_dibutuhkan} Kuota
        </Badge>
      ),
      sort: (a: LowonganItem, b: LowonganItem) => a.pelamars_count - b.pelamars_count,
    },
    {
      key: 'tipe_lokasi',
      header: 'Tipe & Lokasi',
      minWidth: '130px',
      render: (item: LowonganItem) => (
        <Stack gap={1} className="whitespace-nowrap">
          <Text size="sm"><strong>{item.tipe_pekerjaan}</strong></Text>
          <Text size="sm" muted truncate>{item.lokasi_kerja}</Text>
        </Stack>
      ),
    },
    {
      key: 'jadwal',
      header: 'Periode Buka',
      minWidth: '140px',
      render: (item: LowonganItem) => (
        <Stack gap={1} className="whitespace-nowrap">
          <Text size="sm"><span className="text-muted">Buka:</span> {item.tgl_buka ?? '—'}</Text>
          <Text size="sm"><span className="text-muted">Tutup:</span> <strong>{item.tgl_tutup ?? 'Seterusnya'}</strong></Text>
        </Stack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right' as const,
      minWidth: '120px',
      render: (item: LowonganItem) => (
        <Row gap={2} justify="end" align="center" wrap={false} className="shrink-0 whitespace-nowrap">
          <Dot tone={STATUS_TONE[item.status] || 'yellow'} />
          <Badge tone={STATUS_TONE[item.status] || 'yellow'}>
            {item.status.toUpperCase()}
          </Badge>
        </Row>
      ),
      sort: (a: LowonganItem, b: LowonganItem) => a.status.localeCompare(b.status),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right' as const,
      minWidth: '180px',
      render: (item: LowonganItem) => (
        <Row gap={2} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
          <Button
            size="sm"
            variant="quiet"
            tone="purple"
            onClick={() => router.get(`/lowongan/${item.id}`)}
          >
            Detail ↗
          </Button>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => router.get(`/lowongan/${item.id}/edit`)}
          >
            Edit
          </Button>
        </Row>
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Manajemen Lowongan Pekerjaan" />
      <Stack gap={5}>
        {/* Header Title & Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1} className="flex-1 min-w-0">
            <Eyebrow>Modul Rekrutmen & Talenta</Eyebrow>
            <Heading level={1}>Manajemen Lowongan Pekerjaan</Heading>
            <Text size="sm" muted>
              Kelola publikasi lowongan kerja dari permintaan rekrutmen yang telah disetujui, draf lowongan, dan tautan pendaftaran kandidat
            </Text>
          </Stack>
          <Button onClick={() => router.get('/lowongan/create')} className="w-full sm:w-auto shrink-0">
            + Publikasikan Lowongan
          </Button>
        </div>

        {/* Top KPI Stats */}
        <Grid cols={4}>
          <Stat
            label="Total Lowongan"
            value={String(stats.total)}
            icon="target"
            tone="purple"
          />
          <Stat
            label="Lowongan Aktif"
            value={`${stats.aktif} Aktif`}
            icon="ok"
            tone="mint"
          />
          <Stat
            label="Draft Lowongan"
            value={`${stats.draft} Draft`}
            icon="clock"
            tone="yellow"
          />
          <Stat
            label="Total Pelamar Masuk"
            value={`${stats.totalPelamar} Kandidat`}
            icon="users"
            tone="blue"
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
              <div className="w-full lg:max-w-[320px]">
                <Input
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setPage(1)
                  }}
                  placeholder="Cari kode, judul, posisi, departemen..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                {/* Departement Filter */}
                <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[170px]">
                  <Select
                    value={deptFilter}
                    onChange={(v) => {
                      setDeptFilter(v)
                      setPage(1)
                    }}
                    options={[
                      { value: 'all', label: 'Semua Dept' },
                      ...departements.map((d) => ({
                        value: String(d.id),
                        label: d.deskripsi,
                      })),
                    ]}
                  />
                </div>

                {/* Tipe Filter */}
                <div className="flex-1 sm:flex-none min-w-[130px] sm:w-[150px]">
                  <Select
                    value={tipeFilter}
                    onChange={(v) => {
                      setTipeFilter(v)
                      setPage(1)
                    }}
                    options={TIPE_PEKERJAAN_OPTIONS}
                  />
                </div>

                {/* Status Filter */}
                <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[160px]">
                  <Select
                    value={statusFilter}
                    onChange={(v) => {
                      setStatusFilter(v)
                      setPage(1)
                    }}
                    options={STATUS_OPTIONS}
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
              rows={paginatedLowongans}
              columns={columns}
              getKey={(item) => String(item.id)}
            />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
              <Text size="sm" muted className="text-center sm:text-left">
                Menampilkan {startIndex}-{endIndex} dari {filteredLowongans.length} data (Halaman {page} dari {totalPages})
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
