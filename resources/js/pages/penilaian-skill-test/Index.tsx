import { useState, useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Input } from '@/components/pouf/Input'
import { Table, type TableColumn } from '@/components/pouf/table'
import { Badge, Blob, Dot } from '@/components/pouf/media'
import { Select } from '@/components/pouf/controls'
import { Pagination } from '@/components/pouf/pagination'
import type { Tone } from '@/components/pouf/tone'
import {
  IconX,
  IconAdjustments,
  IconAlertTriangle,
  IconArrowRight,
} from '@tabler/icons-react'

interface ExaminerAssessmentItem {
  id: number
  tanggal_test?: string | null
  total_skor: number
  nilai_akhir: number
  rekomendasi: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
  status: 'draft' | 'final'
  nama_penguji: string
  is_mine: boolean
}

interface PelamarCandidateItem {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  email: string
  nomor_kontak: string
  posisi_dilamar: string
  status_tahap: string
  is_skill_test: boolean
  has_assessment: boolean
  assessments_count: number
  avg_nilai_akhir?: number | null
  avg_total_skor?: number | null
  my_assessment?: {
    id: number
    status: 'draft' | 'final'
    nilai_akhir: number
    total_skor: number
    rekomendasi: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
  } | null
  assessments: ExaminerAssessmentItem[]
}

interface LowonganItem {
  id: number
  kode_lowongan: string
  judul: string
  status: 'aktif' | 'ditutup' | 'draft'
  tgl_buka?: string | null
  tgl_tutup?: string | null
  tipe_pekerjaan: string
  lokasi_kerja: string
  jumlah_dibutuhkan: number
  departement: {
    id?: number
    kd_departement: string
    deskripsi: string
  }
  jabatan: {
    id?: number
    kd_jabatan: string
    nama_jabatan: string
  }
  parameter_config: {
    count: number
    total_bobot: number
    total_items_dinilai: number
    is_ready: boolean
  }
  stats: {
    total_stage?: number
    total_skill_test?: number
    selesai: number
    draft: number
    belum_dinilai: number
  }
  kandidats: PelamarCandidateItem[]
}

interface DepartementItem {
  id: number
  kd_departement: string
  deskripsi: string
}

interface TahapConfig {
  tahap: string
  tahap_key: string
  title: string
  subtitle: string
  route_prefix: string
  param_route_prefix: string
  badge_label: string
  badge_tone: Tone
  allowed_jabatans?: string[] | null
  next_stage_default: string
  next_stage_label: string
}

interface Props {
  lowongans: LowonganItem[]
  departements: DepartementItem[]
  filters: {
    search: string
    status: string
    kd_departement: string
  }
  tahapConfig?: TahapConfig
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'aktif', label: 'Aktif (Berlangsung)' },
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

export default function PenilaianSkillTestIndex({
  lowongans = [],
  departements = [],
  filters,
  tahapConfig,
}: Props) {
  const prefix = tahapConfig?.route_prefix || 'penilaian-skill-test'
  const paramPrefix = tahapConfig?.param_route_prefix || 'parameter-skill-test'
  const pageTitle = tahapConfig?.title || 'Penilaian Skill Test'
  const pageSubtitle = tahapConfig?.subtitle || 'Penilaian uji kompetensi teknis, tes keahlian, dan simulasi kerja kandidat per lowongan.'
  const stageBadgeLabel = tahapConfig?.badge_label || 'Skill Test'

  const [search, setSearch] = useState(filters.search || '')
  const [statusFilter, setStatusFilter] = useState(filters.status || 'aktif')
  const [deptFilter, setDeptFilter] = useState(filters.kd_departement || 'all')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)

  const filteredLowongans = useMemo(() => {
    return lowongans.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        item.kode_lowongan.toLowerCase().includes(q) ||
        item.judul.toLowerCase().includes(q) ||
        item.jabatan.nama_jabatan.toLowerCase().includes(q) ||
        item.departement.deskripsi.toLowerCase().includes(q)

      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      const matchDept =
        deptFilter === 'all' || String(item.departement.id) === String(deptFilter) || item.departement.kd_departement === deptFilter

      return matchSearch && matchStatus && matchDept
    })
  }, [lowongans, search, statusFilter, deptFilter])

  const limit = parseInt(pageSize, 10) || 10
  const totalPages = Math.max(1, Math.ceil(filteredLowongans.length / limit))

  const paginatedLowongans = useMemo(() => {
    const start = (page - 1) * limit
    return filteredLowongans.slice(start, start + limit)
  }, [filteredLowongans, page, limit])

  const startIndex = filteredLowongans.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredLowongans.length)

  // Top KPI Stats
  const kpiStats = useMemo(() => {
    const totalLowonganAktif = lowongans.filter((l) => l.status === 'aktif').length
    const totalKandidatSkillTest = lowongans.reduce((sum, l) => sum + (l.stats.total_stage ?? l.stats.total_skill_test ?? 0), 0)
    const totalSelesai = lowongans.reduce((sum, l) => sum + (l.stats.selesai ?? 0), 0)
    const totalBelum = lowongans.reduce((sum, l) => sum + (l.stats.belum_dinilai ?? 0), 0)

    return {
      totalLowonganAktif,
      totalKandidatSkillTest,
      totalSelesai,
      totalBelum,
    }
  }, [lowongans])

  // TanStack Table Column Definitions for Ongoing Vacancies
  const columns: TableColumn<LowonganItem>[] = [
    {
      key: 'kode_lowongan',
      header: 'Kode Lowongan',
      mono: true,
      minWidth: '130px',
      render: (item) => (
        <Badge tone="purple">{item.kode_lowongan}</Badge>
      ),
      sort: (a, b) => a.kode_lowongan.localeCompare(b.kode_lowongan),
    },
    {
      key: 'judul',
      header: 'Lowongan & Posisi Jabatan',
      minWidth: '230px',
      render: (item) => (
        <Row gap={3} wrap={false} align="center">
          <Blob icon="target" tone="purple" size="sm" className="shrink-0" />
          <Stack gap={1} className="min-w-0">
            <Text className="whitespace-nowrap font-bold text-slate-900">
              {item.judul}
            </Text>
            <Text size="sm" muted className="whitespace-nowrap">
              Posisi: <strong className="text-slate-700">{item.jabatan.nama_jabatan}</strong> ({item.jabatan.kd_jabatan})
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a, b) => a.judul.localeCompare(b.judul),
    },
    {
      key: 'departemen',
      header: 'Departemen',
      minWidth: '140px',
      render: (item) => (
        <Text size="sm" className="whitespace-nowrap font-semibold text-slate-800">
          {item.departement.deskripsi}
        </Text>
      ),
      sort: (a, b) => a.departement.deskripsi.localeCompare(b.departement.deskripsi),
    },
    {
      key: 'parameter_skill_test',
      header: `Parameter ${stageBadgeLabel}`,
      minWidth: '180px',
      render: (item) => {
        const config = item.parameter_config
        if (!config.is_ready) {
          return (
            <Badge tone="yellow" className="whitespace-nowrap font-semibold">
              <IconAlertTriangle size={13} className="mr-1 inline" /> Belum Dikonfigurasi
            </Badge>
          )
        }
        return (
          <Stack gap={1} className="whitespace-nowrap">
            <Badge tone={config.total_bobot === 100 ? 'mint' : 'yellow'}>
              {config.count} Parameter ({config.total_bobot}% Bobot)
            </Badge>
            <Text size="sm" muted>
              {config.total_items_dinilai} Poin Pengujian
            </Text>
          </Stack>
        )
      },
    },
    {
      key: 'kandidat_skill_test',
      header: `Kandidat ${stageBadgeLabel}`,
      align: 'center',
      minWidth: '170px',
      render: (item) => {
        const total = item.stats.total_stage ?? item.stats.total_skill_test
        const selesai = item.stats.selesai
        const belum = item.stats.belum_dinilai

        if (total === 0) {
          return (
            <Badge tone="idle" className="whitespace-nowrap">
              0 Kandidat
            </Badge>
          )
        }

        return (
          <Stack gap={1} className="items-center whitespace-nowrap">
            <Badge tone={selesai > 0 ? 'mint' : 'blue'}>
              {total} Kandidat ({selesai} Dinilai)
            </Badge>
            {belum > 0 && (
              <Text size="sm" muted className="text-[11px] text-amber-700 font-semibold">
                {belum} Belum Dinilai
              </Text>
            )}
          </Stack>
        )
      },
      sort: (a, b) => (a.stats.total_stage ?? a.stats.total_skill_test ?? 0) - (b.stats.total_stage ?? b.stats.total_skill_test ?? 0),
    },
    {
      key: 'periode_status',
      header: 'Periode & Status',
      minWidth: '140px',
      render: (item) => (
        <Stack gap={1} className="whitespace-nowrap">
          <Row gap={2} align="center">
            <Dot tone={STATUS_TONE[item.status] || 'yellow'} />
            <Badge tone={STATUS_TONE[item.status] || 'yellow'}>
              {item.status.toUpperCase()}
            </Badge>
          </Row>
          <Text size="sm" muted>
            {item.tgl_buka ? `Buka: ${item.tgl_buka}` : 'Tanpa Batas'}
          </Text>
        </Stack>
      ),
      sort: (a, b) => a.status.localeCompare(b.status),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      minWidth: '180px',
      render: (item) => (
        <Row gap={2} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
          <Button
            size="sm"
            tone="purple"
            onClick={() => router.visit(`/${prefix}/lowongan/${item.id}`)}
          >
            <IconArrowRight size={15} /> Kelola Penilaian ({item.stats.total_stage ?? item.stats.total_skill_test ?? 0})
          </Button>
        </Row>
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title={`${pageTitle} - Rekrutmen & Talenta`} />

      <Stack gap={5}>
        {/* Header Title & Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1} className="flex-1 min-w-0">
            <Eyebrow>Modul Rekrutmen & Seleksi</Eyebrow>
            <Heading level={1}>{pageTitle}</Heading>
            <Text size="sm" muted>
              {pageSubtitle}
            </Text>
          </Stack>

          <Button
            variant="quiet"
            tone="purple"
            onClick={() => router.visit(`/${paramPrefix}`)}
            className="w-full sm:w-auto shrink-0"
          >
            <IconAdjustments size={16} /> Kelola Parameter {stageBadgeLabel}
          </Button>
        </div>

        {/* Top KPI Stats */}
        <Grid cols={4} gap={4}>
          <Card>
            <Row gap={3} align="center">
              <Blob icon="target" tone="purple" size="sm" />
              <div>
                <Text size="sm" muted>Lowongan Aktif</Text>
                <Heading level={2}>{kpiStats.totalLowonganAktif}</Heading>
              </div>
            </Row>
          </Card>

          <Card>
            <Row gap={3} align="center">
              <Blob icon="users" tone="blue" size="sm" />
              <div>
                <Text size="sm" muted>Kandidat Tahap {stageBadgeLabel}</Text>
                <Heading level={2}>{kpiStats.totalKandidatSkillTest}</Heading>
              </div>
            </Row>
          </Card>

          <Card>
            <Row gap={3} align="center">
              <Blob icon="overview" tone="mint" size="sm" />
              <div>
                <Text size="sm" muted>Penilaian Selesai (Final)</Text>
                <Heading level={2}>{kpiStats.totalSelesai}</Heading>
              </div>
            </Row>
          </Card>

          <Card>
            <Row gap={3} align="center">
              <Blob icon="chart" tone="pink" size="sm" />
              <div>
                <Text size="sm" muted>Belum Dinilai</Text>
                <Heading level={2}>{kpiStats.totalBelum}</Heading>
              </div>
            </Row>
          </Card>
        </Grid>

        {/* Main Table Card */}
        <Card>
          <Stack gap={4}>
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Input
                    placeholder="Cari lowongan, kode, jabatan, atau departemen..."
                    value={search}
                    onChange={(val) => {
                      setSearch(val)
                      setPage(1)
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <IconX size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-48">
                  <Select
                    value={statusFilter}
                    onChange={(val) => {
                      setStatusFilter(val)
                      setPage(1)
                    }}
                    options={STATUS_OPTIONS}
                  />
                </div>

                {/* Departement Filter */}
                {departements.length > 0 && (
                  <div className="w-full sm:w-52">
                    <Select
                      value={deptFilter}
                      onChange={(val) => {
                        setDeptFilter(val)
                        setPage(1)
                      }}
                      options={[
                        { value: 'all', label: 'Semua Departemen' },
                        ...departements.map((d) => ({
                          value: String(d.id),
                          label: d.deskripsi,
                        })),
                      ]}
                    />
                  </div>
                )}
              </div>

              {/* Page Size */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <Text size="sm" muted>Tampilkan:</Text>
                <div className="w-28">
                  <Select
                    value={pageSize}
                    onChange={(val) => {
                      setPageSize(val)
                      setPage(1)
                    }}
                    options={PAGE_SIZE_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* TanStack Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table<LowonganItem>
                rows={paginatedLowongans}
                columns={columns}
              />
            </div>

            {/* Pagination Controls */}
            {filteredLowongans.length > 0 && (
              <Row justify="between" align="center" className="pt-2">
                <Text size="sm" muted>
                  Menampilkan <strong>{startIndex}</strong> - <strong>{endIndex}</strong> dari <strong>{filteredLowongans.length}</strong> lowongan
                </Text>

                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    total={totalPages}
                    onChange={setPage}
                  />
                )}
              </Row>
            )}
          </Stack>
        </Card>
      </Stack>
    </AppLayout>
  )
}
