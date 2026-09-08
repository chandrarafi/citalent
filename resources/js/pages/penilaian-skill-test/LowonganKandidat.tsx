import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Input } from '@/components/pouf/Input'
import { Table, type TableColumn } from '@/components/pouf/table'
import { Badge, Blob } from '@/components/pouf/media'
import { Select, Dialog, Confirm } from '@/components/pouf/controls'
import { Pagination } from '@/components/pouf/pagination'
import { toast } from '@/components/pouf/toaster'
import type { Tone } from '@/components/pouf/tone'
import {
  IconSearch,
  IconX,
  IconAward,
  IconAlertTriangle,
  IconEye,
  IconEdit,
  IconTrash,
  IconUsers,
  IconAdjustments,
  IconArrowLeft,
  IconPlus,
  IconTrophy,
  IconChartBar,
  IconCheck,
  IconTrendingUp,
  IconListCheck,
  IconTable,
  IconUserCheck,
} from '@tabler/icons-react'

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

interface ExaminerAssessmentItem {
  id: number
  tanggal_test?: string | null
  total_skor: number
  nilai_akhir: number
  rekomendasi: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
  status: 'draft' | 'final'
  nama_penguji: string
  penguji_id?: number
  is_mine: boolean
}

interface CandidateParameterScore {
  parameter_id: number
  parameter_name: string
  bobot: number
  avg_skor: number | null
  nilai_100: number | null
}

interface PelamarCandidateItem {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  email: string
  nomor_kontak: string
  posisi_dilamar: string
  status_tahap: string
  jenis_tahap?: string
  is_current_stage?: boolean
  has_assessment: boolean
  assessments_count: number
  avg_nilai_akhir?: number | null
  avg_total_skor?: number | null
  dominant_rekomendasi?: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan' | null
  parameter_scores?: CandidateParameterScore[]
  my_assessment?: {
    id: number
    status: 'draft' | 'final'
    nilai_akhir: number
    total_skor: number
    rekomendasi: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
    tanggal_test?: string | null
  } | null
  assessments: ExaminerAssessmentItem[]
}

interface ParameterSummaryItem {
  parameter_id: number
  parameter_name: string
  bobot: number
  avg_skor: number
  avg_nilai_100: number
  evaluasi_count: number
}

interface VacancySummary {
  total_kandidat: number
  total_dinilai: number
  avg_all_candidates: number | null
  highest_score: number | null
  lowest_score: number | null
  recommendations: {
    disarankan: number
    dipertimbangkan: number
    tidak_disarankan: number
  }
  parameters_summary: ParameterSummaryItem[]
  top_performers: PelamarCandidateItem[]
}

interface LowonganDetail {
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
    parameters?: Array<{
      id: number
      parameter: string
      bobot: number
      items_count: number
    }>
  }
  stats: {
    total_stage: number
    selesai: number
    draft: number
    belum_dinilai: number
  }
}

interface Props {
  lowongan: LowonganDetail
  summary: VacancySummary
  kandidats: PelamarCandidateItem[]
  currentUser: {
    id: number
    name: string
    role?: string
    can_manage_recruitment?: boolean
  }
  tahapConfig?: TahapConfig
}

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
  { value: '50', label: '50 per hal' },
]

const REKOMENDASI_LABEL: Record<string, { label: string; tone: Tone }> = {
  disarankan: { label: 'Disarankan Lolos', tone: 'mint' },
  dipertimbangkan: { label: 'Dipertimbangkan', tone: 'yellow' },
  tidak_disarankan: { label: 'Tidak Disarankan', tone: 'pink' },
}

const DEFAULT_TAHAP_CONFIG: TahapConfig = {
  tahap: 'skill_test',
  tahap_key: 'skill_test',
  title: 'Penilaian Skill Test',
  subtitle: 'Penilaian uji kompetensi teknis, tes keahlian, dan simulasi kerja kandidat per lowongan.',
  route_prefix: 'penilaian-skill-test',
  param_route_prefix: 'parameter-skill-test',
  badge_label: 'SKILL TEST',
  badge_tone: 'purple',
  next_stage_default: 'interview_hr',
  next_stage_label: 'Interview HR',
}

// Stage ordering to detect if candidate has passed the current stage
const STAGE_ORDER: Record<string, number> = {
  submitted: 1,
  screening_cv: 2,
  lengkapi_formulir: 3,
  skill_test: 4,
  interview_hr: 5,
  interview_user: 6,
  interview_gm: 7,
  final_discussion: 8,
  accepted: 9,
}

export default function LowonganKandidatPage({
  lowongan,
  summary,
  kandidats = [],
  currentUser,
  tahapConfig = DEFAULT_TAHAP_CONFIG,
}: Props) {
  const { auth } = usePage<any>().props
  const userRole = currentUser.role || auth?.user?.role?.name || ''
  const isHrOrSuperadmin =
    ['super-admin', 'hr', 'hr-manager', 'admin'].includes(userRole) ||
    Boolean(currentUser.can_manage_recruitment)

  const currentTahap = tahapConfig.tahap || 'skill_test'
  const routePrefix = tahapConfig.route_prefix || 'penilaian-skill-test'
  const paramRoutePrefix = tahapConfig.param_route_prefix || 'parameter-skill-test'

  const kdJabatan = lowongan.jabatan?.kd_jabatan || ''
  const isGmEligible = kdJabatan === 'JBT-5' || kdJabatan === 'JBT-6' || kdJabatan === 'JBT-37'

  // Determine next stage
  const nextStage = useMemo(() => {
    if (currentTahap === 'interview_user') {
      return isGmEligible ? 'interview_gm' : 'final_discussion'
    }
    return tahapConfig.next_stage_default || 'interview_hr'
  }, [currentTahap, isGmEligible, tahapConfig])

  const nextStageLabel = useMemo(() => {
    if (currentTahap === 'interview_user') {
      return isGmEligible ? 'Interview GM' : 'Final Discussion'
    }
    return tahapConfig.next_stage_label || 'Interview HR'
  }, [currentTahap, isGmEligible, tahapConfig])

  // Active Tab: 'candidates' | 'matrix'
  const [activeTab, setActiveTab] = useState<'candidates' | 'matrix'>('candidates')

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)

  // Multi-examiner detail dialog state
  const [selectedCandidateExaminers, setSelectedCandidateExaminers] = useState<PelamarCandidateItem | null>(null)
  const [examinerDialogOpen, setExaminerDialogOpen] = useState(false)

  // Delete Assessment
  function handleDeleteAssessment(id: number, candidateName: string) {
    router.delete(`/${routePrefix}/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Penilaian untuk ${candidateName} berhasil dihapus.`)
      },
      onError: () => {
        toast.error('Gagal menghapus penilaian.')
      },
    })
  }

  // Selection state for Bulk Actions in Matriks tab
  const [selectedMatrixIds, setSelectedMatrixIds] = useState<number[]>([])

  // Toggle selection for candidate in Matriks
  function handleToggleSelectCandidate(id: number) {
    setSelectedMatrixIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Select all eligible candidates in Matriks
  function handleSelectAllMatrix(checked: boolean) {
    if (checked) {
      const eligibleIds = kandidats
        .filter((k) => k.status_tahap === currentTahap)
        .map((k) => k.id)
      setSelectedMatrixIds(eligibleIds.length > 0 ? eligibleIds : kandidats.map((k) => k.id))
    } else {
      setSelectedMatrixIds([])
    }
  }

  // Bulk Advance to Next Stage
  function handleBulkLoloskan() {
    if (selectedMatrixIds.length === 0) return
    router.post(
      '/pelamar/bulk-status',
      {
        pelamar_ids: selectedMatrixIds,
        status: nextStage,
        catatan: `Lolos massal tahap ${tahapConfig.title}`,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Sebanyak ${selectedMatrixIds.length} kandidat berhasil diloloskan ke tahap ${nextStageLabel}.`)
          setSelectedMatrixIds([])
        },
        onError: () => {
          toast.error('Gagal memperbarui status kandidat terpilih.')
        },
      }
    )
  }

  // Bulk Reject / Fail candidates
  function handleBulkGagalkan() {
    if (selectedMatrixIds.length === 0) return
    router.post(
      '/pelamar/bulk-status',
      {
        pelamar_ids: selectedMatrixIds,
        status: 'rejected',
        catatan: `Tidak lolos tahap ${tahapConfig.title}`,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Sebanyak ${selectedMatrixIds.length} kandidat telah ditetapkan Gagal/Ditolak.`)
          setSelectedMatrixIds([])
        },
        onError: () => {
          toast.error('Gagal memperbarui status kandidat terpilih.')
        },
      }
    )
  }

  // Advance / Pass single candidate to next stage
  function handleLoloskanKandidat(candidateId: number, candidateName: string) {
    router.put(
      `/pelamar/${candidateId}/status`,
      {
        status: nextStage,
        catatan: `Lolos tahap ${tahapConfig.title}`,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Kandidat ${candidateName} berhasil diloloskan ke tahap ${nextStageLabel}.`)
        },
        onError: () => {
          toast.error('Gagal memperbarui status kelulusan kandidat.')
        },
      }
    )
  }

  // Helper to render candidate stage badge
  function renderCandidateStageBadge(item: PelamarCandidateItem) {
    if (item.status_tahap === 'rejected') {
      return (
        <Badge tone="pink" className="font-bold text-xs">
          <IconX size={13} className="mr-1 inline" />
          Gagal / Ditolak
        </Badge>
      )
    }

    const currentOrder = STAGE_ORDER[currentTahap] ?? 4
    const candOrder = STAGE_ORDER[item.status_tahap] ?? 0

    if (candOrder > currentOrder) {
      return (
        <Badge tone="mint" className="font-bold text-xs">
          <IconUserCheck size={13} className="mr-1 inline" />
          Lolos ({item.status_tahap.replace('_', ' ').toUpperCase()})
        </Badge>
      )
    }

    return (
      <Badge tone={tahapConfig.badge_tone || 'purple'} className="font-semibold tracking-wide uppercase text-[11px]">
        {tahapConfig.badge_label}
      </Badge>
    )
  }

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return kandidats.filter((k) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        k.nama_lengkap.toLowerCase().includes(q) ||
        k.no_pendaftaran.toLowerCase().includes(q) ||
        k.email.toLowerCase().includes(q) ||
        k.nomor_kontak.toLowerCase().includes(q)

      let matchStatus = true
      if (filterStatus === 'belum_dinilai_saya') {
        matchStatus = !k.my_assessment
      } else if (filterStatus === 'sudah_dinilai_saya') {
        matchStatus = !!k.my_assessment
      } else if (filterStatus === 'selesai') {
        matchStatus = k.assessments.some((a) => a.status === 'final')
      } else if (filterStatus === 'draft') {
        matchStatus = k.assessments.some((a) => a.status === 'draft') && !k.assessments.some((a) => a.status === 'final')
      } else if (filterStatus === 'belum_semua') {
        matchStatus = k.assessments.length === 0
      }

      return matchSearch && matchStatus
    })
  }, [kandidats, search, filterStatus])

  // Pagination
  const limit = parseInt(pageSize, 10) || 10
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / limit))

  const paginatedCandidates = useMemo(() => {
    const start = (page - 1) * limit
    return filteredCandidates.slice(start, start + limit)
  }, [filteredCandidates, page, limit])

  const startIndex = filteredCandidates.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredCandidates.length)

  // Table Columns
  const columns: TableColumn<PelamarCandidateItem>[] = [
    {
      key: 'no_pendaftaran',
      header: 'No. Pendaftaran',
      mono: true,
      minWidth: '140px',
      render: (item) => (
        <Badge tone="purple" className="font-mono">
          {item.no_pendaftaran}
        </Badge>
      ),
      sort: (a, b) => a.no_pendaftaran.localeCompare(b.no_pendaftaran),
    },
    {
      key: 'nama_lengkap',
      header: 'Kandidat',
      minWidth: '240px',
      render: (item) => (
        <Row gap={3} wrap={false} align="center">
          <Blob icon="users" tone="purple" size="sm" className="shrink-0" />
          <Stack gap={1} className="min-w-0">
            <Text className="font-bold text-slate-900 leading-tight">
              {item.nama_lengkap}
            </Text>
            <Text size="sm" muted className="leading-tight truncate">
              {item.email}
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap),
    },
    {
      key: 'status_tahap',
      header: 'Status Tahap',
      align: 'center',
      minWidth: '150px',
      render: (item) => renderCandidateStageBadge(item),
    },
    {
      key: 'hasil_penilaian',
      header: 'Hasil & Multi-Penguji',
      minWidth: '220px',
      render: (item) => {
        if (!item.has_assessment || item.assessments.length === 0) {
          return (
            <Badge tone="idle">
              Belum Ada Penilaian
            </Badge>
          )
        }

        const avgScore = item.avg_nilai_akhir
        const count = item.assessments_count

        return (
          <Stack gap={1}>
            <Row gap={2} align="center">
              {avgScore !== null && avgScore !== undefined ? (
                <Badge
                  tone={
                    avgScore >= 80 ? 'mint' : avgScore >= 65 ? 'yellow' : 'pink'
                  }
                  className="font-bold text-xs"
                >
                  <IconAward size={13} className="mr-1 inline" />
                  Rata-rata: {avgScore} / 100
                </Badge>
              ) : (
                <Badge tone="yellow">Draft Penilaian</Badge>
              )}
            </Row>

            <Row gap={1} align="center">
              <button
                type="button"
                onClick={() => {
                  setSelectedCandidateExaminers(item)
                  setExaminerDialogOpen(true)
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 hover:underline"
              >
                <IconUsers size={12} />
                {count} Penguji Menilai (Rincian ↗)
              </button>
            </Row>
          </Stack>
        )
      },
      sort: (a, b) => (a.avg_nilai_akhir ?? -1) - (b.avg_nilai_akhir ?? -1),
    },
    {
      key: 'my_assessment',
      header: 'Status Penilaian Saya',
      minWidth: '180px',
      render: (item) => {
        const myAss = item.my_assessment
        if (!myAss) {
          return (
            <Badge tone="idle" className="text-slate-600">
              Belum Saya Nilai
            </Badge>
          )
        }

        const rec = REKOMENDASI_LABEL[myAss.rekomendasi] || { label: myAss.rekomendasi, tone: 'yellow' as Tone }

        return (
          <Stack gap={1}>
            <Row gap={2} align="center">
              <Badge tone={myAss.status === 'final' ? 'mint' : 'yellow'}>
                {myAss.status === 'final' ? '✓ Nilai Anda: ' : 'Draft: '}
                <strong>{myAss.nilai_akhir}</strong>
              </Badge>
            </Row>
            <Badge tone={rec.tone} className="text-[11px] w-fit">
              {rec.label}
            </Badge>
          </Stack>
        )
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      minWidth: '220px',
      render: (item) => {
        const myAss = item.my_assessment

        if (!myAss) {
          return (
            <Row gap={2} justify="end" wrap={false} className="shrink-0">
              <Button
                size="sm"
                tone="purple"
                onClick={() => router.visit(`/pelamar/${item.id}/${routePrefix}`)}
              >
                <IconPlus size={15} /> Input Nilai
              </Button>
            </Row>
          )
        }

        return (
          <Row gap={2} justify="end" wrap={false} className="shrink-0">
            <Button
              size="sm"
              tone="mint"
              onClick={() => router.visit(`/${routePrefix}/${myAss.id}`)}
              title="Lihat Hasil Penilaian"
            >
              <IconEye size={15} /> Lihat
            </Button>
            <Button
              size="sm"
              tone="blue"
              onClick={() => router.visit(`/${routePrefix}/${myAss.id}/edit`)}
              title="Edit Penilaian Saya"
            >
              <IconEdit size={15} /> Edit
            </Button>
            <Confirm
              title={`Hapus Penilaian ${tahapConfig.badge_label}?`}
              body={`Apakah Anda yakin ingin menghapus penilaian Anda untuk kandidat ${item.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`}
              confirmLabel="Hapus Penilaian"
              cancelLabel="Batal"
              tone="pink"
              onConfirm={() => handleDeleteAssessment(myAss.id, item.nama_lengkap)}
            >
              <Button
                size="sm"
                tone="pink"
                title="Hapus Penilaian Saya"
              >
                <IconTrash size={15} />
              </Button>
            </Confirm>
          </Row>
        )
      },
    },
  ]

  return (
    <AppLayout>
      <Head title={`Summary ${tahapConfig.badge_label} - ${lowongan.judul}`} />

      <Stack gap={6} className="p-6 max-w-[1400px] mx-auto">
        {/* Navigation & Header */}
        <Stack gap={3}>
          <Row justify="between" align="center">
            <Button
              size="sm"
              variant="quiet"
              tone="purple"
              onClick={() => router.visit(`/${routePrefix}`)}
            >
              <IconArrowLeft size={16} /> Kembali ke Daftar Lowongan
            </Button>

            <Row gap={2} align="center">
              <Badge tone="purple" className="font-mono text-xs">
                {lowongan.kode_lowongan}
              </Badge>
              <Badge tone={lowongan.status === 'aktif' ? 'mint' : 'yellow'}>
                {lowongan.status.toUpperCase()}
              </Badge>
            </Row>
          </Row>

          <Row justify="between" align="center" wrap={false} className="gap-4">
            <Stack gap={1}>
              <Eyebrow>Rekapitulasi & {tahapConfig.title}</Eyebrow>
              <Heading level={1} className="text-slate-900 font-bold">
                {lowongan.judul}
              </Heading>
            </Stack>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {lowongan.parameter_config.is_ready ? (
                <Badge tone="mint" className="text-xs">
                  <IconAdjustments size={13} className="mr-1 inline" />
                  {lowongan.parameter_config.count} Parameter ({lowongan.parameter_config.total_bobot}% Bobot) Terpasang
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge tone="yellow" className="text-xs">
                    <IconAlertTriangle size={13} className="mr-1 inline" />
                    Parameter Belum Dikonfigurasi
                  </Badge>
                  <Button
                    size="sm"
                    tone="purple"
                    onClick={() => router.visit(`/${paramRoutePrefix}`)}
                  >
                    Atur Parameter ↗
                  </Button>
                </div>
              )}
            </div>
          </Row>
        </Stack>

        {/* Executive Summary Card */}
        <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
          <Stack gap={5}>
            <Row justify="between" align="center">
              <Row gap={2} align="center">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <IconChartBar size={18} />
                </div>
                <div>
                  <Heading level={2} className="text-slate-900 font-bold text-lg">
                    Executive Summary Hasil {tahapConfig.badge_label}
                  </Heading>
                  <Text size="sm" muted className="text-xs">
                    Statistik pencapaian skor dan ringkasan evaluasi seluruh kandidat
                  </Text>
                </div>
              </Row>

              <Row gap={2} align="center">
                <Badge tone="purple" className="text-xs font-semibold">
                  {summary.total_dinilai} dari {summary.total_kandidat} Kandidat Telah Dinilai
                </Badge>
              </Row>
            </Row>

            {/* Metric Cards */}
            <Grid cols={4} gap={4}>
              {/* Rata-rata Skor Keseluruhan */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Stack gap={1}>
                  <Text size="sm" muted className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rata-rata Nilai Lowongan
                  </Text>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {summary.avg_all_candidates !== null ? summary.avg_all_candidates : '-'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                  <Text size="sm" muted className="text-xs mt-1">
                    Dari seluruh penguji & kandidat
                  </Text>
                </Stack>
              </div>

              {/* Distribusi Rekomendasi */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Stack gap={1}>
                  <Text size="sm" muted className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Distribusi Rekomendasi
                  </Text>
                  <Row gap={2} align="center" className="flex-wrap pt-0.5">
                    <Badge tone="mint" className="text-[11px] font-bold">
                      {summary.recommendations.disarankan} Disarankan
                    </Badge>
                    <Badge tone="yellow" className="text-[11px] font-bold">
                      {summary.recommendations.dipertimbangkan} Dipertimbangkan
                    </Badge>
                    <Badge tone="pink" className="text-[11px] font-bold">
                      {summary.recommendations.tidak_disarankan} Ditolak
                    </Badge>
                  </Row>
                  <Text size="sm" muted className="text-xs">
                    Berdasarkan kesepakatan penguji
                  </Text>
                </Stack>
              </div>

              {/* Skor Tertinggi & Terendah */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Stack gap={1}>
                  <Text size="sm" muted className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rentang Skor Kandidat
                  </Text>
                  <Row justify="between" align="center" className="mt-1">
                    <div>
                      <Text size="sm" muted className="text-xs">Tertinggi</Text>
                      <div className="text-base font-bold text-emerald-600">
                        {summary.highest_score !== null ? `${summary.highest_score}` : '-'}
                      </div>
                    </div>
                    <div className="h-7 w-px bg-slate-200" />
                    <div>
                      <Text size="sm" muted className="text-xs">Terendah</Text>
                      <div className="text-base font-bold text-amber-600">
                        {summary.lowest_score !== null ? `${summary.lowest_score}` : '-'}
                      </div>
                    </div>
                  </Row>
                  <Text size="sm" muted className="text-xs mt-0.5">Skala 0 - 100</Text>
                </Stack>
              </div>

              {/* Status Evaluasi Saya */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80">
                <Stack gap={1}>
                  <Text size="sm" className="text-xs font-semibold uppercase tracking-wider text-purple-800">
                    Evaluasi Akun Anda
                  </Text>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-purple-900">
                      {kandidats.filter((k) => !!k.my_assessment).length}
                    </span>
                    <span className="text-xs font-semibold text-purple-600">
                      / {summary.total_kandidat} Kandidat
                    </span>
                  </div>
                  <Text size="sm" className="text-xs text-purple-700 mt-1">
                    {kandidats.filter((k) => !k.my_assessment).length} kandidat belum Anda nilai
                  </Text>
                </Stack>
              </div>
            </Grid>

            {/* Parameter Performance Breakdown & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
              {/* Left 2 Cols: Parameter Average Breakdown */}
              <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <Stack gap={3}>
                  <Row justify="between" align="center">
                    <Row gap={2} align="center">
                      <IconAdjustments size={16} className="text-slate-600" />
                      <Text className="font-bold text-slate-800 text-sm">
                        Pencapaian Rata-rata per Parameter {tahapConfig.badge_label}
                      </Text>
                    </Row>
                    <Text size="sm" muted className="text-xs">Rata-rata seluruh kandidat</Text>
                  </Row>

                  {summary.parameters_summary.length === 0 ? (
                    <Text size="sm" muted className="italic py-2">
                      Belum ada parameter {tahapConfig.badge_label} yang aktif untuk jabatan ini.
                    </Text>
                  ) : (
                    <div className="space-y-3">
                      {summary.parameters_summary.map((param) => {
                        const score100 = param.avg_nilai_100
                        const toneColor =
                          score100 >= 80 ? 'bg-emerald-500' : score100 >= 65 ? 'bg-amber-500' : 'bg-rose-500'

                        return (
                          <div key={param.parameter_id} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-800">
                                {param.parameter_name} <span className="text-slate-500 font-normal">({param.bobot}% Bobot)</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {param.avg_skor > 0 ? `${param.avg_skor} / 5.0` : 'Belum Ada Skor'}
                                </span>
                                {param.avg_skor > 0 && (
                                  <Badge
                                    tone={score100 >= 80 ? 'mint' : score100 >= 65 ? 'yellow' : 'pink'}
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {score100}%
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${toneColor} transition-all duration-500 rounded-full`}
                                style={{ width: `${Math.min(100, Math.max(0, score100))}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Stack>
              </div>

              {/* Right 1 Col: Top 3 Performers */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <Stack gap={3}>
                  <Row gap={2} align="center">
                    <IconTrophy size={16} className="text-amber-500" />
                    <Text className="font-bold text-slate-800 text-sm">
                      Top 3 Nilai Tertinggi
                    </Text>
                  </Row>

                  {summary.top_performers.length === 0 ? (
                    <Text size="sm" muted className="italic py-2">
                      Belum ada kandidat yang selesai dinilai.
                    </Text>
                  ) : (
                    <div className="space-y-2.5">
                      {summary.top_performers.map((perf, idx) => {
                        const rankColors = [
                          'bg-amber-100 text-amber-800 border-amber-300',
                          'bg-slate-200 text-slate-700 border-slate-300',
                          'bg-orange-100 text-orange-800 border-orange-300',
                        ]

                        return (
                          <div
                            key={perf.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border shrink-0 ${
                                  rankColors[idx] || 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-xs truncate">
                                  {perf.nama_lengkap}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {perf.no_pendaftaran}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-black text-slate-900 text-sm leading-tight">
                                {perf.avg_nilai_akhir}
                              </div>
                              <Badge
                                tone={
                                  perf.dominant_rekomendasi
                                    ? REKOMENDASI_LABEL[perf.dominant_rekomendasi]?.tone || 'mint'
                                    : 'mint'
                                }
                                className="text-[10px] px-1 py-0 capitalize"
                              >
                                {perf.dominant_rekomendasi ? perf.dominant_rekomendasi.replace('_', ' ') : 'Lolos'}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Stack>
              </div>
            </div>
          </Stack>
        </div>

        {/* CANDIDATES TABLE & SCORE MATRIX TABS */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm">
          <Stack gap={4}>
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('candidates')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    activeTab === 'candidates'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <IconListCheck size={16} /> Daftar & Penilaian Kandidat ({kandidats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('matrix')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    activeTab === 'matrix'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <IconTable size={16} /> Matriks Nilai Per Parameter
                </button>
              </div>

              <Text size="sm" muted className="text-xs">
                Menampilkan data {kandidats.length} kandidat tahap {tahapConfig.title}
              </Text>
            </div>

            {/* TAB 1: CANDIDATES LIST & ACTIONS */}
            {activeTab === 'candidates' && (
              <Stack gap={4}>
                {/* Filter & Search Controls */}
                <Row justify="between" align="center" wrap className="gap-3">
                  <Row gap={3} align="center" className="flex-1 max-w-xl">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Cari nama kandidat, nomor pendaftaran, email..."
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <IconX size={15} />
                        </button>
                      )}
                    </div>

                    <div className="w-56">
                      <Select
                        value={filterStatus}
                        onChange={(val) => {
                          setFilterStatus(val)
                          setPage(1)
                        }}
                        options={[
                          { value: 'all', label: 'Semua Status Penilaian' },
                          { value: 'belum_dinilai_saya', label: 'Belum Dinilai Saya' },
                          { value: 'sudah_dinilai_saya', label: 'Sudah Dinilai Saya' },
                          { value: 'selesai', label: 'Sudah Final (Ada Penguji)' },
                          { value: 'draft', label: 'Draft Penilaian' },
                          { value: 'belum_semua', label: 'Belum Ada Penilaian Sama Sekali' },
                        ]}
                      />
                    </div>
                  </Row>

                  <Row gap={2} align="center">
                    <Text size="sm" muted>Tampilkan:</Text>
                    <div className="w-32">
                      <Select
                        value={pageSize}
                        onChange={(val) => {
                          setPageSize(val)
                          setPage(1)
                        }}
                        options={PAGE_SIZE_OPTIONS}
                      />
                    </div>
                  </Row>
                </Row>

                {/* Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Table<PelamarCandidateItem>
                    rows={paginatedCandidates}
                    columns={columns}
                  />
                </div>

                {/* Pagination Controls */}
                {filteredCandidates.length > 0 && (
                  <Row justify="between" align="center" className="pt-2">
                    <Text size="sm" muted>
                      Menampilkan <strong>{startIndex}</strong> - <strong>{endIndex}</strong> dari <strong>{filteredCandidates.length}</strong> kandidat
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
            )}

            {/* TAB 2: SCORE MATRIX COMPARISON */}
            {activeTab === 'matrix' && (
              <Stack gap={4}>
                {/* Bulk Actions Toolbar (Only for HR / Super Admin) */}
                {isHrOrSuperadmin && selectedMatrixIds.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-purple-50/90 border border-purple-200 rounded-xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <Badge tone="purple" className="font-bold text-xs px-2.5 py-0.5">
                        {selectedMatrixIds.length} Kandidat Dipilih
                      </Badge>
                      <span className="text-xs font-medium text-purple-900">
                        Pilih aksi massal untuk kandidat yang ditandai:
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Bulk Loloskan Button */}
                      <Confirm
                        title={`Loloskan Kandidat Terpilih ke ${nextStageLabel}?`}
                        body={`Apakah Anda yakin ingin meloloskan ${selectedMatrixIds.length} kandidat yang dipilih secara massal dari tahap ${tahapConfig.title} menuju tahap ${nextStageLabel}?`}
                        confirmLabel={`Loloskan (${selectedMatrixIds.length})`}
                        cancelLabel="Batal"
                        tone="mint"
                        onConfirm={handleBulkLoloskan}
                      >
                        <Button size="sm" tone="mint">
                          <IconUserCheck size={14} /> Loloskan ke {nextStageLabel} ({selectedMatrixIds.length})
                        </Button>
                      </Confirm>

                      {/* Bulk Gagalkan / Tolak Button */}
                      <Confirm
                        title={`Gagalkan / Tolak Kandidat Terpilih?`}
                        body={`Apakah Anda yakin ingin menetapkan ${selectedMatrixIds.length} kandidat yang dipilih sebagai GAGAL / Ditolak pada tahap ${tahapConfig.title}?`}
                        confirmLabel={`Gagalkan (${selectedMatrixIds.length})`}
                        cancelLabel="Batal"
                        tone="pink"
                        onConfirm={handleBulkGagalkan}
                      >
                        <Button size="sm" tone="pink">
                          <IconX size={14} /> Gagalkan / Tolak ({selectedMatrixIds.length})
                        </Button>
                      </Confirm>

                      <Button
                        size="sm"
                        variant="quiet"
                        onClick={() => setSelectedMatrixIds([])}
                      >
                        Batal Pilih
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                      <tr>
                        {/* Checkbox Select All (Khusus HR & Super Admin) */}
                        {isHrOrSuperadmin && (
                          <th className="px-3 py-4 w-12 text-center whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                              checked={
                                kandidats.length > 0 &&
                                kandidats.filter((k) => k.status_tahap === currentTahap).every((k) => selectedMatrixIds.includes(k.id)) &&
                                selectedMatrixIds.length > 0
                              }
                              onChange={(e) => handleSelectAllMatrix(e.target.checked)}
                              title={`Pilih Semua Kandidat ${tahapConfig.badge_label}`}
                            />
                          </th>
                        )}
                        <th className="px-5 py-4 min-w-[240px] whitespace-nowrap">Kandidat</th>
                        {lowongan.parameter_config.parameters?.map((p) => (
                          <th key={p.id} className="px-4 py-4 text-center min-w-[170px] whitespace-nowrap">
                            <div className="font-bold text-slate-800">{p.parameter}</div>
                            <span className="text-[10px] text-slate-500 font-semibold lowercase">
                              (bobot {p.bobot}%)
                            </span>
                          </th>
                        ))}
                        <th className="px-4 py-4 text-center min-w-[160px] whitespace-nowrap">Nilai Akhir Rata-rata</th>
                        <th className="px-4 py-4 text-center min-w-[150px] whitespace-nowrap">Rekomendasi</th>
                        <th className="px-4 py-4 text-center min-w-[130px] whitespace-nowrap">Total Penguji</th>
                        <th className="px-4 py-4 text-center min-w-[150px] whitespace-nowrap">Status Kandidat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {kandidats.map((cand, idx) => {
                        const rec = cand.dominant_rekomendasi
                          ? REKOMENDASI_LABEL[cand.dominant_rekomendasi] || { label: cand.dominant_rekomendasi, tone: 'yellow' as Tone }
                          : null

                        const isSelected = selectedMatrixIds.includes(cand.id)

                        return (
                          <tr
                            key={cand.id}
                            className={
                              isSelected
                                ? 'bg-purple-50/70 hover:bg-purple-50'
                                : idx % 2 === 0
                                ? 'hover:bg-slate-50'
                                : 'bg-slate-50/40 hover:bg-slate-50'
                            }
                          >
                            {/* Checkbox (Khusus HR & Super Admin) */}
                            {isHrOrSuperadmin && (
                              <td className="px-3 py-4 text-center whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectCandidate(cand.id)}
                                  disabled={cand.status_tahap !== currentTahap}
                                  title={cand.status_tahap !== currentTahap ? 'Sudah diproses' : 'Pilih kandidat'}
                                />
                              </td>
                            )}

                            <td className="px-5 py-4 min-w-[240px] whitespace-nowrap">
                              <div className="font-bold text-slate-900 text-[14px] leading-snug whitespace-nowrap">
                                {cand.nama_lengkap}
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5 whitespace-nowrap">
                                {cand.no_pendaftaran}
                              </div>
                            </td>

                            {/* Parameter Scores */}
                            {lowongan.parameter_config.parameters?.map((p) => {
                              const pScore = cand.parameter_scores?.find((ps) => ps.parameter_id === p.id)
                              return (
                                <td key={p.id} className="px-4 py-4 text-center min-w-[170px] whitespace-nowrap">
                                  {pScore && pScore.avg_skor !== null ? (
                                    <div className="inline-block">
                                      <span className="font-bold text-slate-900 text-sm">
                                        {pScore.avg_skor}
                                      </span>
                                      <span className="text-xs text-slate-400"> / 5</span>
                                      <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                                        ({pScore.nilai_100}%)
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">-</span>
                                  )}
                                </td>
                              )
                            })}

                            {/* Nilai Akhir */}
                            <td className="px-4 py-4 text-center min-w-[160px] whitespace-nowrap">
                              {cand.avg_nilai_akhir !== null && cand.avg_nilai_akhir !== undefined ? (
                                <Badge
                                  tone={cand.avg_nilai_akhir >= 80 ? 'mint' : cand.avg_nilai_akhir >= 65 ? 'yellow' : 'pink'}
                                  className="font-bold text-xs px-2.5 py-1"
                                >
                                  {cand.avg_nilai_akhir} / 100
                                </Badge>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Belum dinilai</span>
                              )}
                            </td>

                            {/* Rekomendasi */}
                            <td className="px-4 py-4 text-center min-w-[150px] whitespace-nowrap">
                              {rec ? (
                                <Badge tone={rec.tone} className="text-xs font-semibold px-2.5 py-1">
                                  {rec.label}
                                </Badge>
                              ) : (
                                <span className="text-xs text-slate-400 italic">-</span>
                              )}
                            </td>

                            {/* Penguji Count */}
                            <td className="px-4 py-4 text-center min-w-[130px] whitespace-nowrap">
                              <Badge tone="purple" className="text-xs font-semibold px-2 py-0.5">
                                {cand.assessments_count} Penguji
                              </Badge>
                            </td>

                            {/* Status Kandidat */}
                            <td className="px-4 py-4 text-center min-w-[150px] whitespace-nowrap">
                              {renderCandidateStageBadge(cand)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Multi-Examiner Details Modal Dialog */}
        <Dialog
          open={examinerDialogOpen}
          onOpenChange={setExaminerDialogOpen}
          title={`Rincian Penilaian Penguji: ${selectedCandidateExaminers?.nama_lengkap ?? ''}`}
          description={`Daftar skor dan penilaian dari seluruh penguji untuk kandidat No. Pendaftaran ${selectedCandidateExaminers?.no_pendaftaran ?? ''}`}
          size="lg"
        >
          {selectedCandidateExaminers && (
            <Stack gap={4} className="py-2">
              <Card className="p-3 bg-slate-50 border border-slate-200">
                <Row justify="between" align="center">
                  <Stack gap={1}>
                    <Text size="sm" muted>Rata-rata Skor Keseluruhan</Text>
                    <Heading level={3} className="font-bold text-slate-900">
                      {selectedCandidateExaminers.avg_nilai_akhir ?? '-'} / 100
                    </Heading>
                  </Stack>
                  <Badge tone="purple" className="text-xs">
                    {selectedCandidateExaminers.assessments.length} Penguji Telah Menilai
                  </Badge>
                </Row>
              </Card>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Nama Penguji</th>
                      <th className="px-4 py-3">Tanggal Test</th>
                      <th className="px-4 py-3 text-center">Nilai Akhir</th>
                      <th className="px-4 py-3">Rekomendasi</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {selectedCandidateExaminers.assessments.map((ass) => {
                      const rec = REKOMENDASI_LABEL[ass.rekomendasi] || { label: ass.rekomendasi, tone: 'yellow' as Tone }
                      return (
                        <tr key={ass.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {ass.nama_penguji}
                            {ass.is_mine && (
                              <Badge tone="purple" className="ml-2 text-[10px]">
                                Saya
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {ass.tanggal_test || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-slate-900">
                              {ass.nilai_akhir}
                            </span>
                            <span className="text-xs text-slate-500"> / 100</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={rec.tone} className="text-xs">
                              {rec.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge tone={ass.status === 'final' ? 'mint' : 'yellow'} className="text-xs">
                              {ass.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              tone="purple"
                              variant="quiet"
                              onClick={() => {
                                setExaminerDialogOpen(false)
                                router.visit(`/${routePrefix}/${ass.id}`)
                              }}
                            >
                              <IconEye size={14} /> Detail
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Stack>
          )}
        </Dialog>
      </Stack>
    </AppLayout>
  )
}
