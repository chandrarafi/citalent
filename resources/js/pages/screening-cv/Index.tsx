import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Input, Field } from '@/components/pouf/Input'
import { Table } from '@/components/pouf/table'
import { Stat } from '@/components/pouf/readout'
import { Badge, Blob, Dot } from '@/components/pouf/media'
import { Select, Dialog } from '@/components/pouf/controls'
import { Checkbox } from '@/components/pouf/checkbox'
import { Pagination } from '@/components/pouf/pagination'
import type { Tone } from '@/components/pouf/tone'
import {
  IconCheck,
  IconX,
  IconSparkles,
  IconFileText,
  IconAlertCircle,
  IconClock,
  IconAward,
  IconExternalLink,
  IconRefresh,
  IconShieldCheck,
  IconSettings,
  IconPlus,
  IconTrash,
  IconEdit,
  IconTool,
  IconHeadset,
  IconSpeakerphone,
  IconDeviceLaptop,
  IconUsers,
  IconCalculator,
  IconPackage,
} from '@tabler/icons-react'

interface KriteriaItem {
  kriteria: string
  kebutuhan: string
  data_kandidat: string
  nilai: number
  bobot_max: number
  status_cocok: boolean
}

interface CvParsedData {
  nama_kandidat?: string
  pendidikan?: string
  institusi?: string
  tahun_lulus?: string
  pengalaman_tahun?: number
  pengalaman_label?: string
  skills?: string[]
  bahasa?: string[]
  sertifikasi?: string
}

interface PelamarData {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  email: string
  nomor_kontak: string
  pendidikan_terakhir: string
  nama_institusi: string
  jurusan: string
  tahun_lulus: string
  posisi_dilamar: string
  status: string
  foto_url?: string | null
  cv_url?: string | null
  created_at?: string | null
  lowongan?: {
    id: number
    kode_lowongan: string
    judul: string
    departemen_nama?: string
    posisi_nama?: string
    kd_jabatan?: string
  } | null
}

interface ScreeningItem {
  id: number
  pelamar_id: number
  lowongan_id: number
  divisi: string
  total_skor: number
  rekomendasi: 'sangat_disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
  rekomendasi_label: string
  rekomendasi_tone: Tone
  status_konfirmasi: 'menunggu_konfirmasi' | 'disetujui' | 'ditolak'
  status_konfirmasi_label: string
  status_konfirmasi_tone: Tone
  kriteria_penilaian: KriteriaItem[]
  cv_parsed_data: CvParsedData
  catatan_ats?: string | null
  catatan_hr?: string | null
  confirmed_by_name?: string | null
  confirmed_at?: string | null
  pelamar?: PelamarData | null
}

export interface KriteriaAtsItem {
  id: number
  divisi: string
  lowongan_id?: number | null
  kategori: string
  nama_kriteria: string
  kebutuhan: string
  tipe_penilaian: 'pendidikan' | 'pengalaman' | 'keyword' | 'sertifikasi'
  keywords?: string[] | null
  bobot: number
  is_wajib: boolean
  urutan: number
  active: boolean
}

interface LowonganOption {
  id: number
  kode_lowongan: string
  judul: string
}

interface StatsData {
  total_screened: number
  pending_confirmation: number
  top_candidates: number
  approved: number
  rejected: number
  unscreened: number
}

interface Props {
  screenings: ScreeningItem[]
  lowongans: LowonganOption[]
  stats: StatsData
  selectedLowonganId?: string | number | null
  kriteriaTemplates?: KriteriaAtsItem[]
  kriteriaLowongans?: KriteriaAtsItem[]
}

const DIVISI_OPTIONS = [
  { value: 'all', label: 'Semua Divisi' },
  { value: 'H1', label: 'H1 - Marketing & Sales' },
  { value: 'HC3', label: 'HC3 - Pelayanan Customer' },
  { value: 'H2', label: 'H2 - Service Motor (Teknisi)' },
  { value: 'IT', label: 'IT - Teknologi Informasi' },
  { value: 'HRD', label: 'HRD - Personalia' },
  { value: 'Finance', label: 'Finance & Accounting' },
  { value: 'H3', label: 'H3 - Part Motor (Sparepart)' },
]

const DIVISI_INFO: Record<string, { title: string; subtitle: string; icon: any; tone: Tone; bg: string }> = {
  H1: {
    title: 'H1',
    subtitle: 'Marketing & Sales',
    icon: IconSpeakerphone,
    tone: 'pink',
    bg: 'bg-rose-50/70 border-rose-200 text-rose-800',
  },
  HC3: {
    title: 'HC3',
    subtitle: 'Pelayanan Customer (Customer Care)',
    icon: IconHeadset,
    tone: 'blue',
    bg: 'bg-sky-50/70 border-sky-200 text-sky-800',
  },
  H2: {
    title: 'H2',
    subtitle: 'Service Motor (Teknisi & Bengkel)',
    icon: IconTool,
    tone: 'mint',
    bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-800',
  },
  IT: {
    title: 'IT',
    subtitle: 'Teknologi Informasi & Sistem',
    icon: IconDeviceLaptop,
    tone: 'purple',
    bg: 'bg-purple-50/70 border-purple-200 text-purple-800',
  },
  HRD: {
    title: 'HRD',
    subtitle: 'Human Resources & GA',
    icon: IconUsers,
    tone: 'orange',
    bg: 'bg-amber-50/70 border-amber-200 text-amber-800',
  },
  Finance: {
    title: 'Finance',
    subtitle: 'Keuangan & Akuntansi',
    icon: IconCalculator,
    tone: 'mint',
    bg: 'bg-teal-50/70 border-teal-200 text-teal-800',
  },
  H3: {
    title: 'H3',
    subtitle: 'Part Motor (Sparepart & Logistik)',
    icon: IconPackage,
    tone: 'orange',
    bg: 'bg-orange-50/70 border-orange-200 text-orange-800',
  },
}

const STATUS_KONFIRMASI_OPTIONS = [
  { value: 'all', label: 'Semua Status Konfirmasi' },
  { value: 'menunggu_konfirmasi', label: '⏳ Menunggu Konfirmasi HR' },
  { value: 'disetujui', label: '✓ Dikonfirmasi Lolos' },
  { value: 'ditolak', label: '✗ Dikonfirmasi Ditolak' },
]

const REKOMENDASI_OPTIONS = [
  { value: 'all', label: 'Semua Rekomendasi' },
  { value: 'sangat_disarankan', label: '🌟 Top Candidate (≥ 75)' },
  { value: 'dipertimbangkan', label: '⚖️ Dipertimbangkan (50 - 74)' },
  { value: 'tidak_disarankan', label: '⚠️ Kurang Sesuai (< 50)' },
]

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
  { value: '50', label: '50 per hal' },
]

export default function Index({
  screenings,
  lowongans,
  stats,
  selectedLowonganId,
  kriteriaTemplates = [],
  kriteriaLowongans = [],
}: Props) {
  const { flash } = usePage<any>().props

  // Filter States
  const [search, setSearch] = useState('')
  const [lowonganFilter, setLowonganFilter] = useState<string>(
    selectedLowonganId ? String(selectedLowonganId) : 'all'
  )
  const [divisiFilter, setDivisiFilter] = useState('all')
  const [statusKonfirmasiFilter, setStatusKonfirmasiFilter] = useState('all')
  const [rekomendasiFilter, setRekomendasiFilter] = useState('all')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)

  // Selection for bulk confirmation
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Modal Review & Confirmation
  const [selectedScreening, setSelectedScreening] = useState<ScreeningItem | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve')
  const [nextStageChoice, setNextStageChoice] = useState('lengkapi_formulir')
  const [catatanHr, setCatatanHr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bulk Confirmation Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkDecision, setBulkDecision] = useState<'approve' | 'reject'>('approve')
  const [bulkNextStage, setBulkNextStage] = useState('lengkapi_formulir')
  const [bulkCatatan, setBulkCatatan] = useState('')

  // Batch Auto Screening Modal
  const [autoScreenModalOpen, setAutoScreenModalOpen] = useState(false)
  const [autoScreenLowongan, setAutoScreenLowongan] = useState('all')
  const [forceRescreen, setForceRescreen] = useState(false)

  // Kriteria Settings Modal State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedScope, setSelectedScope] = useState<'template' | 'lowongan'>('template')
  const [activeDivisiTab, setActiveDivisiTab] = useState<string>('H1')
  const [activeLowonganTab, setActiveLowonganTab] = useState<string>(
    lowongans.length > 0 ? String(lowongans[0].id) : ''
  )
  const [editingCriteria, setEditingCriteria] = useState<Partial<KriteriaAtsItem> | null>(null)
  const [formCriteriaModalOpen, setFormCriteriaModalOpen] = useState(false)
  const [criteriaKeywordsInput, setCriteriaKeywordsInput] = useState('')

  // Filtered List
  const filteredScreenings = useMemo(() => {
    return screenings.filter((s) => {
      const q = search.trim().toLowerCase()
      const p = s.pelamar
      const matchSearch =
        !q ||
        (p?.nama_lengkap && p.nama_lengkap.toLowerCase().includes(q)) ||
        (p?.no_pendaftaran && p.no_pendaftaran.toLowerCase().includes(q)) ||
        (p?.email && p.email.toLowerCase().includes(q)) ||
        (p?.posisi_dilamar && p.posisi_dilamar.toLowerCase().includes(q)) ||
        (p?.nama_institusi && p.nama_institusi.toLowerCase().includes(q)) ||
        (p?.jurusan && p.jurusan.toLowerCase().includes(q))

      const matchLowongan =
        lowonganFilter === 'all' || String(s.lowongan_id) === String(lowonganFilter)

      const matchDivisi = divisiFilter === 'all' || s.divisi === divisiFilter

      const matchStatus =
        statusKonfirmasiFilter === 'all' || s.status_konfirmasi === statusKonfirmasiFilter

      const matchRekomendasi =
        rekomendasiFilter === 'all' || s.rekomendasi === rekomendasiFilter

      return matchSearch && matchLowongan && matchDivisi && matchStatus && matchRekomendasi
    })
  }, [screenings, search, lowonganFilter, divisiFilter, statusKonfirmasiFilter, rekomendasiFilter])

  // Pagination
  const limit = parseInt(pageSize, 10) || 10
  const totalPages = Math.max(1, Math.ceil(filteredScreenings.length / limit))
  const paginatedScreenings = useMemo(() => {
    const start = (page - 1) * limit
    return filteredScreenings.slice(start, start + limit)
  }, [filteredScreenings, page, limit])

  const startIndex = filteredScreenings.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredScreenings.length)

  // Select all handler
  const allCurrentPageSelected =
    paginatedScreenings.length > 0 &&
    paginatedScreenings.every((s) => selectedIds.includes(s.pelamar_id))

  function toggleSelectAll() {
    if (allCurrentPageSelected) {
      const currentIds = paginatedScreenings.map((s) => s.pelamar_id)
      setSelectedIds(selectedIds.filter((id) => !currentIds.includes(id)))
    } else {
      const currentIds = paginatedScreenings.map((s) => s.pelamar_id)
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])))
    }
  }

  function toggleSelectOne(pelamarId: number) {
    if (selectedIds.includes(pelamarId)) {
      setSelectedIds(selectedIds.filter((id) => id !== pelamarId))
    } else {
      setSelectedIds([...selectedIds, pelamarId])
    }
  }

  // Open review modal
  function openReview(screening: ScreeningItem) {
    setSelectedScreening(screening)
    setDecision(screening.rekomendasi === 'tidak_disarankan' ? 'reject' : 'approve')
    setCatatanHr(screening.catatan_hr || '')

    // Default next stage based on position
    const kdJabatan = screening.pelamar?.lowongan?.kd_jabatan ?? ''
    const skillTestJabatanCodes = ['JBT-5', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31', 'JBT-26']
    if (skillTestJabatanCodes.includes(kdJabatan)) {
      setNextStageChoice('skill_test')
    } else {
      setNextStageChoice('lengkapi_formulir')
    }

    setReviewModalOpen(true)
  }

  // Submit single confirmation
  function submitConfirmation() {
    if (!selectedScreening || !selectedScreening.pelamar) return

    setIsSubmitting(true)
    router.post(
      `/screening-cv/${selectedScreening.pelamar.id}/confirm`,
      {
        keputusan: decision,
        catatan_hr: catatanHr,
        tahap_berikutnya: decision === 'approve' ? nextStageChoice : undefined,
      },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmitting(false)
          setReviewModalOpen(false)
        },
      }
    )
  }

  // Submit bulk confirmation
  function submitBulkConfirmation() {
    if (selectedIds.length === 0) return

    setIsSubmitting(true)
    router.post(
      '/screening-cv/bulk-confirm',
      {
        pelamar_ids: selectedIds,
        keputusan: bulkDecision,
        catatan_hr: bulkCatatan,
        tahap_berikutnya: bulkDecision === 'approve' ? bulkNextStage : undefined,
      },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmitting(false)
          setBulkModalOpen(false)
          setSelectedIds([])
        },
      }
    )
  }

  // Run batch auto screening
  function submitRunAutoScreening() {
    setIsSubmitting(true)
    router.post(
      '/screening-cv/run-batch',
      {
        lowongan_id: autoScreenLowongan,
        force_rescreen: forceRescreen,
      },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmitting(false)
          setAutoScreenModalOpen(false)
        },
      }
    )
  }

  // Run single re-screen
  function handleReScreen(pelamarId: number) {
    router.post(
      `/screening-cv/${pelamarId}/run`,
      {},
      {
        preserveScroll: true,
      }
    )
  }

  // Active criteria to display in settings modal
  const displayedCriteria = useMemo(() => {
    if (selectedScope === 'template') {
      return kriteriaTemplates.filter((k) => k.divisi === activeDivisiTab)
    } else {
      const matchLowongan = kriteriaLowongans.filter(
        (k) => String(k.lowongan_id) === String(activeLowonganTab)
      )
      if (matchLowongan.length > 0) {
        return matchLowongan
      }
      // If no custom criteria for this lowongan, show the division template
      const currLowongan = lowongans.find((l) => String(l.id) === String(activeLowonganTab))
      return kriteriaTemplates.filter((k) => k.divisi === 'IT')
    }
  }, [selectedScope, activeDivisiTab, activeLowonganTab, kriteriaTemplates, kriteriaLowongans, lowongans])

  // Save criteria handler
  function handleSaveCriteria() {
    if (!editingCriteria) return
    setIsSubmitting(true)

    const payload = {
      ...editingCriteria,
      keywords: criteriaKeywordsInput.split(',').map((s) => s.trim()).filter(Boolean),
    }

    router.post('/screening-cv/kriteria', payload, {
      preserveScroll: true,
      onFinish: () => {
        setIsSubmitting(false)
        setFormCriteriaModalOpen(false)
        setEditingCriteria(null)
      },
    })
  }

  // Delete criteria handler
  function handleDeleteCriteria(id: number) {
    if (!confirm('Hapus kriteria penilaian ini?')) return
    router.delete(`/screening-cv/kriteria/${id}`, {
      preserveScroll: true,
    })
  }

  // Reset criteria for lowongan handler
  function handleResetCriteria() {
    if (!confirm('Kembalikan kriteria lowongan ini ke template bawaan divisi?')) return
    setIsSubmitting(true)
    router.post(
      '/screening-cv/kriteria/reset',
      { lowongan_id: activeLowonganTab },
      {
        preserveScroll: true,
        onFinish: () => setIsSubmitting(false),
      }
    )
  }

  // Table Columns
  const columns = [
    {
      key: 'select',
      header: '✓',
      width: '38px',
      minWidth: '38px',
      render: (s: ScreeningItem) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedIds.includes(s.pelamar_id)}
            onChange={() => toggleSelectOne(s.pelamar_id)}
            label={`Pilih ${s.pelamar?.nama_lengkap}`}
            hideLabel
          />
        </div>
      ),
    },
    {
      key: 'ats_score',
      header: 'Skor & Ranking ATS',
      minWidth: '150px',
      render: (s: ScreeningItem) => {
        const isTop = s.rekomendasi === 'sangat_disarankan'
        const isConsidered = s.rekomendasi === 'dipertimbangkan'

        return (
          <div className="flex flex-col gap-1.5 py-0.5">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center px-2 py-0.5 rounded-lg font-mono text-xs font-bold shadow-xs ${
                  isTop
                    ? 'bg-emerald-600 text-white'
                    : isConsidered
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {s.total_skor.toFixed(0)} / 100
              </div>
              <Badge tone={s.rekomendasi_tone}>
                {isTop ? '★ Top Candidate' : isConsidered ? 'Dipertimbangkan' : 'Kurang Sesuai'}
              </Badge>
            </div>

            {/* Progress bar visual */}
            <div className="w-full bg-black/5 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isTop ? 'bg-emerald-500' : isConsidered ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, s.total_skor))}%` }}
              />
            </div>
          </div>
        )
      },
      sort: (a: ScreeningItem, b: ScreeningItem) => b.total_skor - a.total_skor,
    },
    {
      key: 'kandidat',
      header: 'Nama Kandidat & Berkas',
      minWidth: '185px',
      render: (s: ScreeningItem) => {
        const p = s.pelamar
        if (!p) return <span>-</span>
        return (
          <Row gap={2} wrap={false} align="center">
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
              <div className="flex items-center gap-1">
                <Text className="font-semibold whitespace-nowrap">
                  <strong>{p.nama_lengkap}</strong>
                </Text>
              </div>
              <Row gap={1} align="center">
                <Badge tone="purple" className="text-[10px] px-1 py-0 font-mono">
                  {p.no_pendaftaran}
                </Badge>
                {p.cv_url && (
                  <a
                    href={p.cv_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-purple-600 hover:underline flex items-center gap-0.5"
                  >
                    CV <IconExternalLink size={10} />
                  </a>
                )}
              </Row>
            </Stack>
          </Row>
        )
      },
      sort: (a: ScreeningItem, b: ScreeningItem) =>
        (a.pelamar?.nama_lengkap ?? '').localeCompare(b.pelamar?.nama_lengkap ?? ''),
    },
    {
      key: 'divisi_posisi',
      header: 'Divisi & Posisi Dilamar',
      minWidth: '155px',
      render: (s: ScreeningItem) => (
        <Stack gap={1} className="whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <Badge tone="purple" className="text-[11px] font-bold">
              Divisi: {s.divisi}
            </Badge>
          </div>
          <Text size="sm" className="font-medium">
            {s.pelamar?.posisi_dilamar ?? '—'}
          </Text>
          <Text size="sm" muted className="text-[11px]">
            {s.pelamar?.lowongan?.judul ?? '—'}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'kualifikasi',
      header: 'Kesesuaian Kriteria',
      minWidth: '175px',
      render: (s: ScreeningItem) => {
        const passedCount = s.kriteria_penilaian.filter((k) => k.status_cocok).length
        const totalCount = s.kriteria_penilaian.length
        const skills = s.cv_parsed_data?.skills || []

        return (
          <Stack gap={1} className="max-w-[240px]">
            <div className="flex items-center gap-1 text-xs">
              <span className="font-semibold text-slate-800">
                {passedCount} dari {totalCount} Kriteria
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500 font-mono text-[11px]">
                Exp: {s.cv_parsed_data?.pengalaman_label || '1 Thn'}
              </span>
            </div>

            {/* Detected skills pills */}
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((sk, idx) => (
                <span
                  key={idx}
                  className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono"
                >
                  {sk}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-[10px] text-slate-400">+{skills.length - 3}</span>
              )}
            </div>
          </Stack>
        )
      },
    },
    {
      key: 'status_konfirmasi',
      header: 'Status Konfirmasi HR',
      minWidth: '155px',
      render: (s: ScreeningItem) => (
        <Stack gap={1} className="whitespace-nowrap">
          <Row gap={1} align="center">
            <Dot tone={s.status_konfirmasi_tone} />
            <Badge tone={s.status_konfirmasi_tone}>
              {s.status_konfirmasi_label}
            </Badge>
          </Row>
          {s.confirmed_at && (
            <Text size="sm" muted className="text-[11px]">
              Oleh: {s.confirmed_by_name || 'HR'} ({s.confirmed_at})
            </Text>
          )}
        </Stack>
      ),
      sort: (a: ScreeningItem, b: ScreeningItem) =>
        a.status_konfirmasi.localeCompare(b.status_konfirmasi),
    },
    {
      key: 'actions',
      header: 'Aksi & Konfirmasi',
      align: 'right' as const,
      minWidth: '155px',
      render: (s: ScreeningItem) => (
        <Row gap={1} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
          <Button
            size="sm"
            tone="purple"
            onClick={() => openReview(s)}
            className="text-xs font-semibold"
          >
            <IconFileText size={13} className="mr-1" />
            Tinjau ATS ↗
          </Button>

          {s.status_konfirmasi === 'menunggu_konfirmasi' && (
            <>
              <button
                type="button"
                title="Konfirmasi Lolos Cepat"
                onClick={() => {
                  setSelectedScreening(s)
                  setDecision('approve')
                  setNextStageChoice('lengkapi_formulir')
                  setCatatanHr('Lolos screening otomatis ATS.')
                  setReviewModalOpen(true)
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all cursor-pointer"
              >
                <IconCheck size={14} stroke={2.5} />
              </button>
              <button
                type="button"
                title="Konfirmasi Tolak Cepat"
                onClick={() => {
                  setSelectedScreening(s)
                  setDecision('reject')
                  setCatatanHr('Kualifikasi belum sesuai kriteria posisi.')
                  setReviewModalOpen(true)
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all cursor-pointer"
              >
                <IconX size={14} stroke={2.5} />
              </button>
            </>
          )}
        </Row>
      ),
    },
  ]

  return (
    <AppLayout wide>
      <Head title="Screening CV Otomatis (ATS) & Konfirmasi HR" />

      <Stack gap={5}>
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Stack gap={1}>
            <Row gap={2} align="center">
              <Eyebrow>Applicant Tracking System (ATS)</Eyebrow>
              <Badge tone="purple" className="flex items-center gap-1">
                <IconSparkles size={12} /> Auto-Screening Engine
              </Badge>
            </Row>
            <Heading level={1}>Screening CV Otomatis & Konfirmasi HR</Heading>
            <Text size="sm" muted>
              Menyaring dan menilai kesesuaian berkas kandidat otomatis berdasarkan tabel kriteria kebutuhan divisi (H1, HC3, H2, IT, HRD, Finance, H3) yang disesuaikan per lowongan.
            </Text>
          </Stack>

          <Row gap={2} wrap={true} align="center" className="w-full md:w-auto">
            <Button
              tone="purple"
              size="sm"
              onClick={() => setSettingsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <IconSettings size={14} className="mr-1" />
              Kelola Kriteria ATS per Lowongan
            </Button>
            <Button
              tone="blue"
              size="sm"
              onClick={() => setAutoScreenModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <IconRefresh size={14} className="mr-1" />
              Jalankan Auto-Screening ATS
            </Button>
          </Row>
        </div>

        {/* 7 Division Showcase Bar matching infographic */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(DIVISI_INFO).map(([key, info]) => {
            const IconComp = info.icon
            const isSelected = divisiFilter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setDivisiFilter(divisiFilter === key ? 'all' : key)
                  setPage(1)
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-purple-500 bg-purple-50/80 border-purple-300'
                    : info.bg
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold font-mono text-sm tracking-tight">{info.title}</span>
                  <IconComp size={16} />
                </div>
                <div className="text-[11px] font-medium line-clamp-2 leading-snug opacity-90">
                  {info.subtitle}
                </div>
              </button>
            )
          })}
        </div>

        {/* Top KPI Readouts */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat
            label="Total Discreening ATS"
            value={String(stats.total_screened)}
            icon="database"
            tone="blue"
          />
          <Stat
            label="Menunggu Konfirmasi HR"
            value={`${stats.pending_confirmation} Kandidat`}
            icon="clock"
            tone="orange"
          />
          <Stat
            label="Top Candidates (≥ 75)"
            value={`${stats.top_candidates} Orang`}
            icon="target"
            tone="mint"
          />
          <Stat
            label="Dikonfirmasi Lolos"
            value={`${stats.approved} Orang`}
            icon="ok"
            tone="mint"
          />
          <Stat
            label="Dikonfirmasi Ditolak"
            value={`${stats.rejected} Orang`}
            icon="fail"
            tone="pink"
          />
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

        {/* Unscreened Alert Banner if any */}
        {stats.unscreened > 0 && (
          <Card variant="tight" className="border-l-4 border-l-amber-500 bg-amber-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <Row gap={2} align="center">
                <IconAlertCircle size={20} className="text-amber-600 shrink-0" />
                <Text size="sm">
                  Terdapat <strong>{stats.unscreened} berkas pelamar baru</strong> yang belum diproses oleh ATS Screening otomatis.
                </Text>
              </Row>
              <Button
                tone="purple"
                size="sm"
                onClick={() => {
                  setForceRescreen(false)
                  submitRunAutoScreening()
                }}
                disabled={isSubmitting}
              >
                Proses {stats.unscreened} Berkas Sekarang ➔
              </Button>
            </div>
          </Card>
        )}

        {/* Main Card with Table and Filters */}
        <Card variant="flush" className="w-full p-4 sm:p-5 lg:p-6 shadow-sm">
          <Stack gap={4}>
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 w-full">
              <div className="w-full xl:max-w-[280px]">
                <Input
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setPage(1)
                  }}
                  placeholder="Cari kandidat, no daftar, kampus..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full xl:w-auto">
                {/* Lowongan Filter */}
                <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[170px]">
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

                {/* Divisi Filter */}
                <div className="flex-1 sm:flex-none min-w-[130px] sm:w-[150px]">
                  <Select
                    value={divisiFilter}
                    onChange={(v) => {
                      setDivisiFilter(v)
                      setPage(1)
                    }}
                    options={DIVISI_OPTIONS}
                  />
                </div>

                {/* Status Konfirmasi Filter */}
                <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[165px]">
                  <Select
                    value={statusKonfirmasiFilter}
                    onChange={(v) => {
                      setStatusKonfirmasiFilter(v)
                      setPage(1)
                    }}
                    options={STATUS_KONFIRMASI_OPTIONS}
                  />
                </div>

                {/* Rekomendasi Filter */}
                <div className="flex-1 sm:flex-none min-w-[130px] sm:w-[155px]">
                  <Select
                    value={rekomendasiFilter}
                    onChange={(v) => {
                      setRekomendasiFilter(v)
                      setPage(1)
                    }}
                    options={REKOMENDASI_OPTIONS}
                  />
                </div>

                {/* Page Size */}
                <div className="w-[90px]">
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

            {/* Bulk Selection Bar */}
            {selectedIds.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone="purple">{selectedIds.length} Kandidat Terpilih</Badge>
                  <Text size="sm">Pilih aksi konfirmasi massal untuk kandidat yang dipilih:</Text>
                </div>
                <Row gap={2} align="center">
                  <Button
                    tone="mint"
                    size="sm"
                    onClick={() => {
                      setBulkDecision('approve')
                      setBulkModalOpen(true)
                    }}
                  >
                    <IconCheck size={14} className="mr-1" />
                    Loloskan Terpilih ({selectedIds.length})
                  </Button>
                  <Button
                    tone="pink"
                    size="sm"
                    onClick={() => {
                      setBulkDecision('reject')
                      setBulkModalOpen(true)
                    }}
                  >
                    <IconX size={14} className="mr-1" />
                    Tolak Terpilih ({selectedIds.length})
                  </Button>
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Batal Pilih
                  </Button>
                </Row>
              </div>
            )}

            {/* Pouf Table with full scroll and rounded container */}
            <div className="overflow-x-auto w-full rounded-2xl border border-slate-200/80 bg-white shadow-2xs [scrollbar-width:thin] [scrollbar-color:var(--color-purple)_transparent]">
              <Table
                rows={paginatedScreenings}
                columns={columns}
                getKey={(s) => String(s.id)}
                minWidth="100%"
              />
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
              <Text size="sm" muted className="text-center sm:text-left">
                Menampilkan {startIndex}-{endIndex} dari {filteredScreenings.length} hasil screening (Halaman {page} dari {totalPages})
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

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 1: Detail Penilaian ATS & Formulir Konfirmasi HR
          (Reflecting exact structure from infographic: Kriteria | Kebutuhan | Data Kandidat | Nilai)
      ──────────────────────────────────────────────────────────────────────── */}
      {reviewModalOpen && selectedScreening && selectedScreening.pelamar && (
        <Dialog
          open={reviewModalOpen}
          onOpenChange={(open) => setReviewModalOpen(open)}
          title="Hasil Screening Otomatis ATS & Konfirmasi HR"
          description={`Tinjau rincian pencocokan kriteria posisi dan berikan konfirmasi keputusan untuk ${selectedScreening.pelamar.nama_lengkap}.`}
          size="2xl"
        >
          <Stack gap={4} className="max-h-[85vh] overflow-y-auto pr-1">
            {/* Candidate Header Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500 shrink-0 bg-white shadow-2xs">
                  <img
                    src={selectedScreening.pelamar.foto_url || '/assets/images/user.png'}
                    alt={selectedScreening.pelamar.nama_lengkap}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/user.png'
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-lg">
                      {selectedScreening.pelamar.nama_lengkap}
                    </span>
                    <Badge tone="purple" className="font-mono text-xs">
                      {selectedScreening.pelamar.no_pendaftaran}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      • {selectedScreening.pelamar.email}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    <strong className="text-slate-800">{selectedScreening.pelamar.pendidikan_terakhir}</strong> {selectedScreening.pelamar.jurusan} &bull; {selectedScreening.pelamar.nama_institusi} ({selectedScreening.pelamar.tahun_lulus || '-'})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {selectedScreening.pelamar.cv_url && (
                  <Button
                    size="sm"
                    variant="quiet"
                    tone="purple"
                    onClick={() => window.open(selectedScreening.pelamar!.cv_url!, '_blank')}
                  >
                    Buka File CV (PDF) ↗
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="quiet"
                  tone="blue"
                  onClick={() => handleReScreen(selectedScreening.pelamar!.id)}
                  title="Screening Ulang"
                >
                  <IconRefresh size={13} className="mr-1" />
                  Screening Ulang
                </Button>
              </div>
            </div>

            {/* ATS Score & Recommendation Hero */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              selectedScreening.rekomendasi === 'sangat_disarankan'
                ? 'bg-emerald-50/80 border-emerald-200'
                : selectedScreening.rekomendasi === 'dipertimbangkan'
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-rose-50/80 border-rose-200'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Divisi {selectedScreening.divisi}
                  </span>
                  <Badge tone={selectedScreening.rekomendasi_tone}>
                    {selectedScreening.rekomendasi_label}
                  </Badge>
                  <Badge tone={selectedScreening.status_konfirmasi_tone}>
                    {selectedScreening.status_konfirmasi_label}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-slate-800 leading-relaxed">
                  {selectedScreening.catatan_ats}
                </div>
              </div>

              <div className="shrink-0 text-center sm:text-right bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Skor ATS</div>
                <div className="text-3xl font-black font-mono text-purple-700">
                  {selectedScreening.total_skor.toFixed(0)} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
            </div>

            {/* 2-Column Wide Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Criteria Table & Detected Skills (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Rincian Penilaian Kriteria Kebutuhan (Divisi {selectedScreening.divisi})
                    </span>
                    <span className="text-xs text-slate-500">
                      Bobot Terpenuhi: <strong className="text-slate-800">{selectedScreening.kriteria_penilaian.filter((k) => k.status_cocok).length}</strong> dari {selectedScreening.kriteria_penilaian.length} kriteria
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Kriteria</th>
                          <th className="py-2.5 px-3">Kebutuhan Posisi</th>
                          <th className="py-2.5 px-3">Data Kandidat</th>
                          <th className="py-2.5 px-3 text-right">Nilai / Bobot</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedScreening.kriteria_penilaian.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {item.status_cocok ? (
                                  <IconCheck size={14} className="text-emerald-600 shrink-0" stroke={3} />
                                ) : (
                                  <IconX size={14} className="text-rose-500 shrink-0" stroke={3} />
                                )}
                                <span>{item.kriteria}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{item.kebutuhan}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{item.data_kandidat}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                              <span className={item.status_cocok ? 'text-emerald-700' : 'text-slate-500'}>
                                {item.nilai}
                              </span>{' '}
                              / {item.bobot_max}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td colSpan={3} className="py-2.5 px-3 text-right text-slate-700">
                            Total Skor Keseluruhan:
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sm text-purple-700">
                            {selectedScreening.total_skor.toFixed(0)} / 100
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detected Skills & Summary Tags */}
                {selectedScreening.cv_parsed_data?.skills && selectedScreening.cv_parsed_data.skills.length > 0 && (
                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Keahlian & Kata Kunci Terdeteksi dari CV / Berkas
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedScreening.cv_parsed_data.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-xs shadow-2xs"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: HR Decision & Action Form (5 Cols) */}
              <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <IconShieldCheck size={18} className="text-purple-600" />
                  <span className="text-sm font-bold text-slate-900">
                    Konfirmasi Keputusan HR (Human Review)
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Pilih Keputusan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDecision('approve')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        decision === 'approve'
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300 text-emerald-900 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-800">
                        <IconCheck size={16} stroke={3} /> Loloskan
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Kandidat lanjut ke tahapan seleksi berikutnya.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('reject')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        decision === 'reject'
                          ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-300 text-rose-900 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sm text-rose-800">
                        <IconX size={16} stroke={3} /> Tolak Lamaran
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Kualifikasi belum memenuhi standar posisi.
                      </div>
                    </button>
                  </div>
                </div>

                {decision === 'approve' && (
                  <Field label="Pilih Tahapan Seleksi Berikutnya">
                    {() => (
                      <Select
                        value={nextStageChoice}
                        onChange={(v) => setNextStageChoice(v)}
                        options={[
                          { value: 'lengkapi_formulir', label: '1. Lengkapi Formulir Lamaran Kerja (Recommended)' },
                          { value: 'skill_test', label: '2. Skill Test / Uji Kompetensi' },
                          { value: 'interview_hr', label: '3. Interview HR' },
                          { value: 'interview_user', label: '4. Interview User' },
                        ]}
                      />
                    )}
                  </Field>
                )}

                <Field label="Catatan / Feedback Tambahan HR (Opsional)">
                  {(id, describedBy) => (
                    <Input
                      id={id}
                      describedBy={describedBy}
                      value={catatanHr}
                      onChange={(v) => setCatatanHr(v)}
                      placeholder="contoh: Sesuai kualifikasi Top Candidate..."
                    />
                  )}
                </Field>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => setReviewModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    tone={decision === 'approve' ? 'mint' : 'pink'}
                    disabled={isSubmitting}
                    onClick={submitConfirmation}
                  >
                    {isSubmitting
                      ? 'Menyimpan...'
                      : decision === 'approve'
                      ? 'Konfirmasi Loloskan ✓'
                      : 'Konfirmasi Tolak ✗'}
                  </Button>
                </div>
              </div>
            </div>
          </Stack>
        </Dialog>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 2: Bulk Confirmation Dialog
      ──────────────────────────────────────────────────────────────────────── */}
      {bulkModalOpen && (
        <Dialog
          open={bulkModalOpen}
          onOpenChange={(open) => setBulkModalOpen(open)}
          title={`Konfirmasi Massal (${selectedIds.length} Kandidat Terpilih)`}
          description="Terapkan keputusan HR serentak untuk seluruh kandidat yang telah Anda centang."
          size="md"
        >
          <Stack gap={4}>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Text size="sm">
                Keputusan:{' '}
                <strong>
                  {bulkDecision === 'approve'
                    ? 'LOLOSKAN KE TAHAP BERIKUTNYA'
                    : 'TOLAK (REJECTED)'}
                </strong>{' '}
                untuk <strong>{selectedIds.length} orang kandidat</strong>.
              </Text>
            </div>

            {bulkDecision === 'approve' && (
              <Field label="Tahapan Seleksi Lanjutan">
                {() => (
                  <Select
                    value={bulkNextStage}
                    onChange={(v) => setBulkNextStage(v)}
                    options={[
                      { value: 'lengkapi_formulir', label: 'Lengkapi Formulir Lamaran Kerja' },
                      { value: 'skill_test', label: 'Skill Test' },
                      { value: 'interview_hr', label: 'Interview HR' },
                    ]}
                  />
                )}
              </Field>
            )}

            <Field label="Catatan Massal (Opsional)">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={bulkCatatan}
                  onChange={(v) => setBulkCatatan(v)}
                  placeholder="Catatan untuk riwayat seleksi kandidat terpilih..."
                />
              )}
            </Field>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setBulkModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                tone={bulkDecision === 'approve' ? 'mint' : 'pink'}
                disabled={isSubmitting}
                onClick={submitBulkConfirmation}
              >
                {isSubmitting ? 'Memproses...' : 'Terapkan Konfirmasi Massal'}
              </Button>
            </div>
          </Stack>
        </Dialog>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 3: Jalankan Auto Screening ATS
      ──────────────────────────────────────────────────────────────────────── */}
      {autoScreenModalOpen && (
        <Dialog
          open={autoScreenModalOpen}
          onOpenChange={(open) => setAutoScreenModalOpen(open)}
          title="Jalankan Auto-Screening ATS"
          description="Sistem ATS akan mengekstrak data berkas pelamar, mencocokkan kriteria kebutuhan divisi (H1, HC3, H2, IT, HRD, Finance, H3), dan menghitung bobot nilai secara otomatis."
          size="md"
        >
          <Stack gap={4}>
            <Field label="Pilih Lowongan Pekerjaan">
              {() => (
                <Select
                  value={autoScreenLowongan}
                  onChange={(v) => setAutoScreenLowongan(v)}
                  options={[
                    { value: 'all', label: 'Seluruh Lowongan Aktif' },
                    ...lowongans.map((l) => ({
                      value: String(l.id),
                      label: `${l.kode_lowongan} - ${l.judul}`,
                    })),
                  ]}
                />
              )}
            </Field>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Checkbox
                checked={forceRescreen}
                onChange={(checked) => setForceRescreen(Boolean(checked))}
                label="Screening ulang seluruh kandidat yang sudah pernah dinilai"
              />
            </div>

            <Text size="sm" muted>
              Setelah proses selesai, seluruh hasil evaluasi akan berstatus <strong>Menunggu Konfirmasi HR</strong> sehingga Anda dapat meninjau Top Candidates sebelum memajukan tahapan seleksi.
            </Text>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setAutoScreenModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                tone="purple"
                disabled={isSubmitting}
                onClick={submitRunAutoScreening}
              >
                {isSubmitting ? 'Sedang Memproses ATS...' : 'Mulai Auto-Screening ➔'}
              </Button>
            </div>
          </Stack>
        </Dialog>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 4: Kelola Kriteria ATS per Lowongan & Divisi (Data Tabel ATS)
      ──────────────────────────────────────────────────────────────────────── */}
      {settingsModalOpen && (
        <Dialog
          open={settingsModalOpen}
          onOpenChange={(open) => setSettingsModalOpen(open)}
          title="Tabel Kriteria Penilaian ATS per Lowongan & Divisi"
          description="Kriteria penilaian disimpan di dalam tabel database dan dapat disesuaikan secara dinamis untuk masing-masing lowongan kerja."
          size="2xl"
        >
          <Stack gap={4} className="max-h-[82vh] overflow-y-auto pr-1">
            {/* Scope Switcher: Template Divisi vs Khusus Lowongan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5 rounded-xl bg-slate-100/90 border border-slate-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-slate-700">Tampilkan Kriteria:</span>
                <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedScope('template')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedScope === 'template'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Template Divisi (H1, HC3, H2, IT, HRD, Finance, H3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedScope('lowongan')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedScope === 'lowongan'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kustom per Lowongan Spesifik
                  </button>
                </div>
              </div>

              {selectedScope === 'lowongan' && (
                <Button
                  size="sm"
                  variant="quiet"
                  tone="purple"
                  onClick={handleResetCriteria}
                  disabled={isSubmitting}
                >
                  <IconRefresh size={13} className="mr-1" />
                  Reset ke Template Divisi
                </Button>
              )}
            </div>

            {/* Sub-selector */}
            {selectedScope === 'template' ? (
              /* Divisi Tabs (H1, HC3, H2, IT, HRD, Finance, H3) */
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 border-b border-slate-200 pb-3">
                {Object.entries(DIVISI_INFO).map(([code, info]) => {
                  const IconComp = info.icon
                  const isActive = activeDivisiTab === code
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setActiveDivisiTab(code)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'ring-2 ring-purple-500 bg-purple-50/90 border-purple-300 text-purple-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold font-mono text-xs">{code}</span>
                        <IconComp size={15} />
                      </div>
                      <div className="text-[11px] font-medium line-clamp-1 opacity-90">
                        {info.title}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Lowongan Selector */
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <Field label="Pilih Lowongan yang Ingin Disesuaikan Kriterianya">
                  {() => (
                    <Select
                      value={activeLowonganTab}
                      onChange={(v) => setActiveLowonganTab(v)}
                      options={lowongans.map((l) => ({
                        value: String(l.id),
                        label: `${l.kode_lowongan} - ${l.judul}`,
                      }))}
                    />
                  )}
                </Field>
              </div>
            )}

            {/* Criteria Table List */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Kriteria Penilaian ({displayedCriteria.length} Kriteria Terdaftar)
                  </span>
                  <Badge tone="purple" className="font-mono text-[11px]">
                    Total Bobot: {displayedCriteria.reduce((sum, k) => sum + (k.bobot || 0), 0)} Pts
                  </Badge>
                </div>
                <Button
                  size="sm"
                  tone="purple"
                  onClick={() => {
                    setEditingCriteria({
                      divisi: selectedScope === 'template' ? activeDivisiTab : 'IT',
                      lowongan_id: selectedScope === 'lowongan' ? Number(activeLowonganTab) : null,
                      kategori: 'Keahlian / Skill',
                      nama_kriteria: '',
                      kebutuhan: '',
                      tipe_penilaian: 'keyword',
                      bobot: 20,
                      is_wajib: true,
                      active: true,
                    })
                    setCriteriaKeywordsInput('')
                    setFormCriteriaModalOpen(true)
                  }}
                >
                  <IconPlus size={13} className="mr-1" />
                  Tambah Kriteria Baru
                </Button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5 whitespace-nowrap">Kategori & Kriteria</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">Tipe</th>
                      <th className="py-3 px-3.5">Kebutuhan / Standar Penilaian Posisi</th>
                      <th className="py-3 px-3.5">Keywords Pencarian ATS</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">Bobot</th>
                      <th className="py-3 px-3.5 text-right whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {displayedCriteria.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Belum ada kriteria penilaian untuk tab ini. Klik <strong>Tambah Kriteria Baru</strong> untuk menambahkan.
                        </td>
                      </tr>
                    ) : (
                      displayedCriteria.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Badge tone="purple" className="text-[10px] px-1.5 py-0.5 font-mono">
                                {item.kategori}
                              </Badge>
                              <span className="font-bold">{item.nama_kriteria}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              {item.tipe_penilaian}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 min-w-[220px]">{item.kebutuhan}</td>
                          <td className="py-3 px-3.5 min-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {(item.keywords || []).slice(0, 6).map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]"
                                >
                                  {kw}
                                </span>
                              ))}
                              {(item.keywords || []).length > 6 && (
                                <span className="text-[10px] text-slate-400 font-mono self-center">
                                  +{(item.keywords || []).length - 6} lainnya
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-purple-700 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">
                              {item.bobot} Pts
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCriteria(item)
                                  setCriteriaKeywordsInput((item.keywords || []).join(', '))
                                  setFormCriteriaModalOpen(true)
                                }}
                                className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-700 border border-transparent hover:border-purple-200 transition-colors cursor-pointer"
                                title="Edit Kriteria"
                              >
                                <IconEdit size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCriteria(item.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                title="Hapus Kriteria"
                              >
                                <IconTrash size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button onClick={() => setSettingsModalOpen(false)}>
                Tutup Pengaturan
              </Button>
            </div>
          </Stack>
        </Dialog>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 5: Form Tambah / Edit Kriteria ATS
      ──────────────────────────────────────────────────────────────────────── */}
      {formCriteriaModalOpen && editingCriteria && (
        <Dialog
          open={formCriteriaModalOpen}
          onOpenChange={(open) => setFormCriteriaModalOpen(open)}
          title={editingCriteria.id ? 'Edit Kriteria Penilaian ATS' : 'Tambah Kriteria Penilaian ATS Baru'}
          description="Sesuaikan kriteria pencocokan, kebutuhan, kata kunci, dan bobot penilaian."
          size="lg"
        >
          <Stack gap={3}>
            <Grid cols={2}>
              <Field label="Divisi Terkait">
                {() => (
                  <Select
                    value={editingCriteria.divisi || 'H1'}
                    onChange={(v) => setEditingCriteria({ ...editingCriteria, divisi: v })}
                    options={DIVISI_OPTIONS.filter((d) => d.value !== 'all')}
                  />
                )}
              </Field>

              <Field label="Tipe Penilaian">
                {() => (
                  <Select
                    value={editingCriteria.tipe_penilaian || 'keyword'}
                    onChange={(v: any) => setEditingCriteria({ ...editingCriteria, tipe_penilaian: v })}
                    options={[
                      { value: 'keyword', label: 'Pencocokan Kata Kunci (Skill)' },
                      { value: 'pendidikan', label: 'Evaluasi Jenjang & Jurusan' },
                      { value: 'pengalaman', label: 'Evaluasi Tahun Pengalaman' },
                      { value: 'sertifikasi', label: 'Evaluasi Sertifikasi Khusus' },
                    ]}
                  />
                )}
              </Field>
            </Grid>

            <Field label="Nama Kriteria">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={editingCriteria.nama_kriteria || ''}
                  onChange={(v) => setEditingCriteria({ ...editingCriteria, nama_kriteria: v })}
                  placeholder="contoh: Digital Marketing, SQL / Database, Injeksi Motor..."
                />
              )}
            </Field>

            <Field label="Deskripsi Kebutuhan Posisi">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={editingCriteria.kebutuhan || ''}
                  onChange={(v) => setEditingCriteria({ ...editingCriteria, kebutuhan: v })}
                  placeholder="contoh: Wajib menguasai Meta Ads dan Google Ads..."
                />
              )}
            </Field>

            <Field label="Keywords Pencarian (Pisahkan dengan koma)">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={criteriaKeywordsInput}
                  onChange={(v) => setCriteriaKeywordsInput(v)}
                  placeholder="contoh: google ads, meta ads, facebook ads, seo, sem"
                />
              )}
            </Field>

            <Field label="Bobot Nilai Maksimal (Pts)">
              {(id, describedBy) => (
                <Input
                  id={id}
                  type="number"
                  describedBy={describedBy}
                  value={String(editingCriteria.bobot || 20)}
                  onChange={(v) => setEditingCriteria({ ...editingCriteria, bobot: parseInt(v, 10) || 20 })}
                  placeholder="20"
                />
              )}
            </Field>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setFormCriteriaModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                tone="purple"
                disabled={isSubmitting}
                onClick={handleSaveCriteria}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Kriteria ATS'}
              </Button>
            </div>
          </Stack>
        </Dialog>
      )}
    </AppLayout>
  )
}
