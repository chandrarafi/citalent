import { useState, useEffect, useRef } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AdminLayout } from '@/layouts/AdminLayout'
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
  nomor_kontak: string
  email: string
  pendidikan_terakhir: string
  nama_institusi: string
  jurusan: string
  tahun_lulus: string
  posisi_dilamar: string
  foto_url?: string | null
  status: string
  ats_screening?: {
    id: number
    total_skor: number
    rekomendasi: 'sangat_disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
    rekomendasi_label: string
    rekomendasi_tone: Tone
    status_konfirmasi: 'menunggu_konfirmasi' | 'disetujui' | 'ditolak'
    status_konfirmasi_label: string
    status_konfirmasi_tone: Tone
  } | null
  lowongan?: {
    id: number
    kode_lowongan: string
    judul: string
    departemen_nama?: string
    posisi_nama?: string
  } | null
  created_at?: string | null
}

interface PaginatedPelamars {
  data: PelamarItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface PelamarStats {
  total: number
  submitted: number
  review: number
  interview: number
  accepted: number
  rejected: number
}

interface Props {
  pelamars: PaginatedPelamars
  stats: PelamarStats
  lowongans: LowonganOption[]
  filters?: {
    search?: string | null
    lowongan_id?: string | null
    status?: string | null
    per_page?: number | null
  }
}

const STATUS_SELEKSI_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'submitted', label: '1. Submit Lamaran' },
  { value: 'screening_cv', label: '2. Screening CV' },
  { value: 'lengkapi_formulir', label: '3. Lengkapi Formulir Lamaran Kerja' },
  { value: 'skill_test', label: '4. Skill Test' },
  { value: 'interview_hr', label: '5. Interview HR' },
  { value: 'interview_user', label: '6. Interview User' },
  { value: 'final_discussion', label: '7. Final Discussion' },
  { value: 'accepted', label: 'Diterima (Accepted)' },
  { value: 'rejected', label: 'Ditolak (Rejected)' },
]

const STATUS_TONE: Record<string, Tone> = {
  submitted: 'yellow',
  screening_cv: 'blue',
  lengkapi_formulir: 'purple',
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
  lengkapi_formulir: 'Lengkapi Formulir Lamaran Kerja',
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

export default function Index({ pelamars, stats, lowongans, filters }: Props) {
  const { flash } = usePage<any>().props

  const [search, setSearch] = useState(filters?.search ?? '')
  const [lowonganFilter, setLowonganFilter] = useState<string>(
    filters?.lowongan_id ? String(filters.lowongan_id) : 'all'
  )
  const [statusFilter, setStatusFilter] = useState<string>(
    filters?.status ? String(filters.status) : 'all'
  )
  const [pageSize, setPageSize] = useState<string>(
    String(filters?.per_page ?? pelamars.per_page ?? 5)
  )
  const isFirstRender = useRef(true)

  const navigateWithFilters = (overrides: {
    search?: string
    lowongan_id?: string
    status?: string
    per_page?: string
    page?: number
  }) => {
    const nextSearch = overrides.search ?? search
    const nextLowongan = overrides.lowongan_id ?? lowonganFilter
    const nextStatus = overrides.status ?? statusFilter
    const nextPerPage = overrides.per_page ?? pageSize
    const nextPage = overrides.page ?? 1

    router.get(
      '/pelamar',
      {
        search: nextSearch.trim() || undefined,
        lowongan_id: nextLowongan !== 'all' ? nextLowongan : undefined,
        status: nextStatus !== 'all' ? nextStatus : undefined,
        per_page: nextPerPage !== '5' ? nextPerPage : undefined,
        page: nextPage > 1 ? nextPage : undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    )
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      navigateWithFilters({ search, page: 1 })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const totalPages = Math.max(1, pelamars.last_page)
  const currentPage = pelamars.current_page

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
      header: 'Nama Kandidat',
      minWidth: '220px',
      render: (p: PelamarItem) => (
        <Row gap={2} wrap={false} align="center" className="min-w-[190px]">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--color-line)] shrink-0 bg-black/5 shadow-xs">
            <img
              src={p.foto_url || '/assets/images/user.png'}
              alt={p.nama_lengkap}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/images/user.png'
              }}
            />
          </div>
          <Stack gap={1} className="min-w-0">
            <Text className="whitespace-nowrap">
              <strong>{p.nama_lengkap}</strong>
            </Text>
            <Text size="sm" muted mono className="whitespace-nowrap">
              {p.email}
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
      key: 'ats_screening',
      header: 'Skor ATS',
      minWidth: '150px',
      render: (p: PelamarItem) => {
        if (!p.ats_screening) {
          return <Text size="sm" muted className="text-xs italic">Belum di-screening</Text>
        }
        return (
          <Stack gap={1} className="whitespace-nowrap">
            <Row gap={1} align="center">
              <span className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
                p.ats_screening.rekomendasi === 'sangat_disarankan'
                  ? 'bg-emerald-100 text-emerald-800'
                  : p.ats_screening.rekomendasi === 'dipertimbangkan'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {p.ats_screening.total_skor.toFixed(0)}/100
              </span>
              <Badge tone={p.ats_screening.rekomendasi_tone} className="text-[10px] px-1 py-0">
                {p.ats_screening.rekomendasi === 'sangat_disarankan' ? '★ Top' : p.ats_screening.rekomendasi === 'dipertimbangkan' ? 'Dipertimbangkan' : 'Kurang'}
              </Badge>
            </Row>
            <Badge tone={p.ats_screening.status_konfirmasi_tone} className="text-[10px] px-1 py-0">
              {p.ats_screening.status_konfirmasi_label}
            </Badge>
          </Stack>
        )
      },
      sort: (a: PelamarItem, b: PelamarItem) =>
        (b.ats_screening?.total_skor ?? 0) - (a.ats_screening?.total_skor ?? 0),
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
    <AdminLayout>
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

          <Button
            tone="purple"
            size="sm"
            onClick={() => router.get('/screening-cv')}
          >
            Buka ATS Screening (Konfirmasi HR) ↗
          </Button>
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
                  onChange={(v) => setSearch(v)}
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
                      navigateWithFilters({ lowongan_id: v, page: 1 })
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
                      navigateWithFilters({ status: v, page: 1 })
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
                      navigateWithFilters({ per_page: v, page: 1 })
                    }}
                    options={PAGE_SIZE_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* Pouf Table */}
            <Table
              rows={pelamars.data}
              columns={columns}
              getKey={(p) => String(p.id)}
            />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
              <Text size="sm" muted className="text-center sm:text-left">
                Menampilkan {pelamars.from}-{pelamars.to} dari {pelamars.total} data (Halaman {currentPage} dari {totalPages})
              </Text>
              <Pagination
                page={currentPage}
                total={totalPages}
                onChange={(p) => navigateWithFilters({ page: p })}
              />
            </div>
          </Stack>
        </Card>
      </Stack>
    </AdminLayout>
  )
}
