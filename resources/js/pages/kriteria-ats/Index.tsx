import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Input, Textarea, Field } from '@/components/pouf/Input'
import { Badge, Blob } from '@/components/pouf/media'
import { Select, Switch, Dialog, Confirm } from '@/components/pouf/controls'
import { Checkbox } from '@/components/pouf/checkbox'
import { Separator } from '@/components/pouf/separator'
import { Table, type TableColumn } from '@/components/pouf/table'
import { Pagination } from '@/components/pouf/pagination'
import type { Tone } from '@/components/pouf/tone'
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconCopy,
  IconTags,
  IconTarget,
} from '@tabler/icons-react'

export interface KriteriaAtsItem {
  id: number
  divisi?: string
  lowongan_id: number | null
  lowongan?: {
    id: number
    judul: string
    kode_lowongan: string
    departement?: {
      id: number
      deskripsi: string
    } | null
  } | null
  kategori: string
  nama_kriteria: string
  kebutuhan: string
  tipe_penilaian: 'pendidikan' | 'pengalaman' | 'keyword' | 'sertifikasi'
  keywords: string[] | null
  bobot: number
  is_wajib: boolean
  urutan: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface LowonganOption {
  id: number
  judul: string
  kode_lowongan: string
  departement: string
}

interface StatsProps {
  total: number
  lowonganTerkonfigurasi: number
  active: number
  wajib: number
}

interface Props {
  kriteriaList: KriteriaAtsItem[]
  lowonganOptions: LowonganOption[]
  kategoriOptions: string[]
  stats: StatsProps
  filters: {
    search: string
    lowongan_id: string
    tipe: string
    status: string
  }
}

interface KriteriaFormData {
  lowongan_id: string
  kategori: string
  nama_kriteria: string
  kebutuhan: string
  tipe_penilaian: 'pendidikan' | 'pengalaman' | 'keyword' | 'sertifikasi'
  keywords_input: string
  bobot: number
  is_wajib: boolean
  urutan: number
  active: boolean
}

const TIPE_PENILAIAN_OPTIONS = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'pengalaman', label: 'Pengalaman Kerja' },
  { value: 'keyword', label: 'Keyword / Keahlian' },
  { value: 'sertifikasi', label: 'Sertifikasi' },
]

const TIPE_TONES: Record<string, Tone> = {
  pendidikan: 'blue',
  pengalaman: 'purple',
  keyword: 'mint',
  sertifikasi: 'yellow',
}

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
  { value: '50', label: '50 per hal' },
]

const BOBOT_PRESETS = [10, 15, 20, 25, 30, 40, 50]

export default function KriteriaAtsIndex({
  kriteriaList = [],
  lowonganOptions = [],
  kategoriOptions = [],
  stats,
  filters: serverFilters,
}: Props) {
  const { flash } = usePage<any>().props

  // Search & Filters state
  const [search, setSearch] = useState(serverFilters?.search || '')
  const [lowonganFilter, setLowonganFilter] = useState(serverFilters?.lowongan_id || 'all')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState('10')

  // Modal Dialogs state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KriteriaAtsItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [duplicateSource, setDuplicateSource] = useState<KriteriaAtsItem | null>(null)
  const [duplicateTargetLowonganId, setDuplicateTargetLowonganId] = useState('')
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Default lowongan ID
  const defaultLowonganId = lowonganOptions[0] ? String(lowonganOptions[0].id) : ''

  // Form state
  const [formData, setFormData] = useState<KriteriaFormData>({
    lowongan_id: defaultLowonganId,
    kategori: 'Pendidikan',
    nama_kriteria: '',
    kebutuhan: '',
    tipe_penilaian: 'pendidikan',
    keywords_input: '',
    bobot: 20,
    is_wajib: true,
    urutan: 1,
    active: true,
  })

  // Filtered criteria list
  const filteredList = useMemo(() => {
    return kriteriaList.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        item.nama_kriteria.toLowerCase().includes(q) ||
        item.kebutuhan.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q))) ||
        (item.lowongan?.judul && item.lowongan.judul.toLowerCase().includes(q)) ||
        (item.lowongan?.kode_lowongan && item.lowongan.kode_lowongan.toLowerCase().includes(q))

      const matchLowongan =
        lowonganFilter === 'all' || String(item.lowongan_id) === String(lowonganFilter)

      return matchSearch && matchLowongan
    })
  }, [kriteriaList, search, lowonganFilter])

  // Paged rows calculation
  const perPageNum = parseInt(pageSize, 10)
  const totalPages = Math.max(1, Math.ceil(filteredList.length / perPageNum))
  const paginatedList = useMemo(() => {
    const start = (page - 1) * perPageNum
    return filteredList.slice(start, start + perPageNum)
  }, [filteredList, page, perPageNum])

  const startIndex = filteredList.length === 0 ? 0 : (page - 1) * perPageNum + 1
  const endIndex = Math.min(page * perPageNum, filteredList.length)

  // Open Add Dialog
  function openAddModal() {
    setFormErrors({})
    setEditingItem(null)
    setFormData({
      lowongan_id:
        lowonganFilter !== 'all' ? lowonganFilter : (lowonganOptions[0] ? String(lowonganOptions[0].id) : ''),
      kategori: 'Pendidikan',
      nama_kriteria: '',
      kebutuhan: '',
      tipe_penilaian: 'pendidikan',
      keywords_input: '',
      bobot: 20,
      is_wajib: true,
      urutan: filteredList.length + 1,
      active: true,
    })
    setModalOpen(true)
  }

  // Open Edit Dialog
  function openEditModal(item: KriteriaAtsItem) {
    setFormErrors({})
    setEditingItem(item)
    setFormData({
      lowongan_id: item.lowongan_id ? String(item.lowongan_id) : defaultLowonganId,
      kategori: item.kategori,
      nama_kriteria: item.nama_kriteria,
      kebutuhan: item.kebutuhan,
      tipe_penilaian: item.tipe_penilaian,
      keywords_input: item.keywords ? item.keywords.join(', ') : '',
      bobot: item.bobot,
      is_wajib: item.is_wajib,
      urutan: item.urutan || 1,
      active: item.active,
    })
    setModalOpen(true)
  }

  // Open Duplicate Dialog
  function openDuplicateModal(item: KriteriaAtsItem) {
    setDuplicateSource(item)
    setDuplicateTargetLowonganId(
      lowonganOptions[0] ? String(lowonganOptions[0].id) : ''
    )
    setDuplicateModalOpen(true)
  }

  // Handle Form Submit
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})

    const payload = {
      ...formData,
      lowongan_id: Number(formData.lowongan_id),
      keywords: formData.keywords_input,
    }

    if (editingItem) {
      router.put(`/kriteria-ats/${editingItem.id}`, payload, {
        onSuccess: () => {
          setModalOpen(false)
          setEditingItem(null)
          setIsSubmitting(false)
        },
        onError: (errs) => {
          setFormErrors(errs as Record<string, string>)
          setIsSubmitting(false)
        },
      })
    } else {
      router.post('/kriteria-ats', payload, {
        onSuccess: () => {
          setModalOpen(false)
          setIsSubmitting(false)
        },
        onError: (errs) => {
          setFormErrors(errs as Record<string, string>)
          setIsSubmitting(false)
        },
      })
    }
  }

  // Handle Delete
  function handleDelete(item: KriteriaAtsItem) {
    router.delete(`/kriteria-ats/${item.id}`)
  }

  // Handle Toggle Active
  function handleToggleActive(item: KriteriaAtsItem) {
    router.patch(`/kriteria-ats/${item.id}/toggle-active`, {}, { preserveScroll: true })
  }

  // Handle Duplicate Submit
  function handleDuplicateSubmit() {
    if (!duplicateSource || !duplicateTargetLowonganId) return
    setIsDuplicating(true)

    router.post(
      `/kriteria-ats/${duplicateSource.id}/duplicate`,
      {
        target_lowongan_id: Number(duplicateTargetLowonganId),
      },
      {
        onSuccess: () => {
          setDuplicateModalOpen(false)
          setDuplicateSource(null)
          setIsDuplicating(false)
        },
        onError: () => {
          setIsDuplicating(false)
        },
      }
    )
  }

  // Table Columns Definition matching app design system
  const columns: TableColumn<KriteriaAtsItem>[] = [
    {
      key: 'urutan',
      header: 'No',
      width: '60px',
      align: 'center',
      sort: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-muted">
          #{item.urutan || item.id}
        </span>
      ),
    },
    {
      key: 'lowongan',
      header: 'Lowongan Pekerjaan',
      minWidth: '200px',
      sort: true,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="font-bold text-sm text-ink truncate max-w-[220px] block" title={item.lowongan?.judul || 'Lowongan'}>
            {item.lowongan?.judul || `Lowongan #${item.lowongan_id}`}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.lowongan?.kode_lowongan && (
              <Badge tone="purple">
                {item.lowongan.kode_lowongan}
              </Badge>
            )}
            {item.lowongan?.departement?.deskripsi && (
              <span className="text-[11px] font-medium text-muted truncate max-w-[150px]">
                {item.lowongan.departement.deskripsi}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'nama_kriteria',
      header: 'Kategori & Kriteria',
      minWidth: '210px',
      sort: true,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          <Badge tone={TIPE_TONES[item.tipe_penilaian] || 'blue'}>
            {item.kategori}
          </Badge>
          <Text size="sm" className="font-bold text-ink">
            {item.nama_kriteria}
          </Text>
        </div>
      ),
    },
    {
      key: 'kebutuhan',
      header: 'Kualifikasi & Keywords',
      minWidth: '290px',
      render: (item) => (
        <div className="flex flex-col gap-1.5 items-start">
          <span className="text-xs line-clamp-2 text-ink/80 leading-relaxed font-normal">
            {item.kebutuhan}
          </span>
          {item.keywords && item.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-1 items-center max-w-[340px]">
              {item.keywords.slice(0, 4).map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-surface-raised px-1.5 py-0.5 rounded-md border border-edge text-ink/80"
                >
                  <IconTags size={10} className="opacity-60" />
                  {kw}
                </span>
              ))}
              {item.keywords.length > 4 && (
                <span className="text-[11px] font-extrabold text-muted">
                  +{item.keywords.length - 4} lainnya
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] italic text-muted">Tidak ada keywords</span>
          )}
        </div>
      ),
    },
    {
      key: 'bobot',
      header: 'Tipe & Bobot',
      minWidth: '130px',
      sort: true,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {item.tipe_penilaian}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-ink">
              {item.bobot}%
            </span>
            <div className="w-12 h-2 bg-edge rounded-full overflow-hidden">
              <div
                className="h-full bg-purple rounded-full transition-all"
                style={{ width: `${Math.min(100, item.bobot * 2)}%` }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'is_wajib',
      header: 'Sifat',
      width: '90px',
      align: 'center',
      sort: true,
      render: (item) =>
        item.is_wajib ? (
          <Badge tone="orange">
            Wajib
          </Badge>
        ) : (
          <Badge tone="blue">
            Opsional
          </Badge>
        ),
    },
    {
      key: 'active',
      header: 'Status',
      width: '90px',
      align: 'center',
      sort: true,
      render: (item) => (
        <div className="flex items-center justify-center">
          <Switch
            checked={item.active}
            onChange={() => handleToggleActive(item)}
            label={`Toggle status ${item.nama_kriteria}`}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      minWidth: '150px',
      render: (item) => (
        <Row gap={1} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
          <Button
            size="sm"
            variant="quiet"
            tone="purple"
            onClick={() => openEditModal(item)}
            label="Edit Kriteria"
          >
            <IconEdit size={14} />
          </Button>

          <Button
            size="sm"
            variant="quiet"
            tone="blue"
            onClick={() => openDuplicateModal(item)}
            label="Duplikat Kriteria"
          >
            <IconCopy size={14} />
          </Button>

          <Confirm
            title="Hapus Kriteria ATS?"
            body={`Apakah Anda yakin ingin menghapus kriteria '${item.nama_kriteria}' untuk lowongan '${item.lowongan?.judul || 'Lowongan'}'? Kriteria ini tidak akan lagi digunakan dalam evaluasi otomatis CV.`}
            confirmLabel="Ya, Hapus Kriteria"
            cancelLabel="Batal"
            tone="orange"
            onConfirm={() => handleDelete(item)}
          >
            <Button
              size="sm"
              variant="quiet"
              tone="pink"
              label="Hapus Kriteria"
            >
              <IconTrash size={14} />
            </Button>
          </Confirm>
        </Row>
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Kriteria ATS Screening" />

      <Stack gap={5}>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1} className="flex-1 min-w-0">
            <Eyebrow>Modul Rekrutmen & Seleksi</Eyebrow>
            <Heading level={1}>Kriteria ATS Screening</Heading>
            <Text size="sm" muted>
              Konfigurasi aturan seleksi CV otomatis, bobot kriteria, kata kunci (keywords), dan kualifikasi khusus per lowongan pekerjaan.
            </Text>
          </Stack>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap">
            <Button
              variant="quiet"
              onClick={() => router.get('/screening-cv')}
              className="w-full sm:w-auto"
            >
              <IconTarget size={16} /> Buka Screening CV
            </Button>
            <Button onClick={openAddModal} className="w-full sm:w-auto">
              <IconPlus size={16} />Tambah Kriteria
            </Button>
          </div>
        </div>


        {/* Flash Notifications */}
        {(flash as any)?.success && (
          <Card variant="tight">
            <Row gap={2} align="center">
              <Blob icon="ok" tone="mint" size="sm" />
              <Text size="sm" className="font-bold text-mint-900">{(flash as any).success}</Text>
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
                  placeholder="Cari kriteria, lowongan, kebutuhan, keywords..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                {/* Lowongan Filter */}
                <div className="flex-1 sm:flex-none min-w-[180px] sm:w-[260px]">
                  <Select
                    value={lowonganFilter}
                    onChange={(v) => {
                      setLowonganFilter(v)
                      setPage(1)
                    }}
                    options={[
                      { value: 'all', label: 'Semua Lowongan' },
                      ...lowonganOptions.map((l) => ({
                        value: String(l.id),
                        label: `${l.kode_lowongan} - ${l.judul}`,
                      })),
                    ]}
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

            {/* Pouf DataTable Powered by TanStack Table */}
            <Table
              rows={paginatedList}
              columns={columns}
              getKey={(item) => String(item.id)}
            />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
              <Text size="sm" muted className="text-center sm:text-left">
                Menampilkan {startIndex}-{endIndex} dari {filteredList.length} data (Halaman {page} dari {totalPages})
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

      {/* ========================================================================= */}
      {/* ADD / EDIT CRITERIA DIALOG                                                */}
      {/* ========================================================================= */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false)
            setEditingItem(null)
          }
        }}
        title={editingItem ? 'Edit Kriteria ATS' : 'Tambah Kriteria ATS Baru'}
        description="Atur parameter penilaian otomatis untuk pencocokan CV pelamar pada lowongan ini."
        size="xl"
      >
        <form onSubmit={handleFormSubmit}>
          <Stack gap={4}>
            {/* Lowongan Selector */}
            <Field
              label="Lowongan Pekerjaan"
              hint="Pilih lowongan pekerjaan yang akan menggunakan kriteria ATS ini"
              error={formErrors.lowongan_id}
            >
              {(id, desc) => (
                <Select
                  id={id}
                  describedBy={desc}
                  value={formData.lowongan_id}
                  onChange={(v) => setFormData((prev) => ({ ...prev, lowongan_id: v }))}
                  options={lowonganOptions.map((l) => ({
                    value: String(l.id),
                    label: `${l.judul} (${l.kode_lowongan}) - ${l.departement}`,
                  }))}
                />
              )}
            </Field>

            {/* Row 2: Kategori & Nama Kriteria */}
            <Grid cols={2} gap={4}>
              <Field
                label="Kategori Kriteria"
                hint="Pendidikan, Pengalaman Kerja, Keahlian, dll."
                error={formErrors.kategori}
              >
                {(id, desc) => (
                  <div className="space-y-1.5">
                    <Input
                      id={id}
                      describedBy={desc}
                      value={formData.kategori}
                      onChange={(v) => setFormData((prev) => ({ ...prev, kategori: v }))}
                      placeholder="Contoh: Pendidikan"
                    />
                    <div className="flex flex-wrap gap-1">
                      {kategoriOptions.slice(0, 5).map((kat) => (
                        <button
                          key={kat}
                          type="button"
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-edge text-muted hover:text-ink transition-colors"
                          onClick={() => setFormData((prev) => ({ ...prev, kategori: kat }))}
                        >
                          {kat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Field>

              <Field
                label="Nama Kriteria"
                hint="Nama ringkas parameter kriteria"
                error={formErrors.nama_kriteria}
              >
                {(id, desc) => (
                  <Input
                    id={id}
                    describedBy={desc}
                    value={formData.nama_kriteria}
                    onChange={(v) => setFormData((prev) => ({ ...prev, nama_kriteria: v }))}
                    placeholder="Contoh: Pendidikan Formal"
                  />
                )}
              </Field>
            </Grid>

            {/* Row 3: Tipe Penilaian & Bobot */}
            <Grid cols={2} gap={4}>
              <Field
                label="Tipe Penilaian ATS"
                hint="Metode mesin ATS dalam membaca data pelamar"
                error={formErrors.tipe_penilaian}
              >
                {(id, desc) => (
                  <Select
                    id={id}
                    describedBy={desc}
                    value={formData.tipe_penilaian}
                    onChange={(v: any) => setFormData((prev) => ({ ...prev, tipe_penilaian: v }))}
                    options={TIPE_PENILAIAN_OPTIONS.filter((o) => o.value !== 'all')}
                  />
                )}
              </Field>

              <Field
                label={`Bobot Penilaian (${formData.bobot}%)`}
                hint="Persentase kontribusi kriteria terhadap skor total ATS (1-100)"
                error={formErrors.bobot}
              >
                {(id, desc) => (
                  <div className="space-y-1.5">
                    <Input
                      id={id}
                      type="number"
                      min={1}
                      max={100}
                      describedBy={desc}
                      value={String(formData.bobot)}
                      onChange={(v) => setFormData((prev) => ({ ...prev, bobot: Number(v) || 0 }))}
                      placeholder="Contoh: 20"
                    />
                    <div className="flex flex-wrap gap-1">
                      {BOBOT_PRESETS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                            formData.bobot === b
                              ? 'bg-purple text-white'
                              : 'bg-surface border border-edge text-muted hover:text-ink'
                          }`}
                          onClick={() => setFormData((prev) => ({ ...prev, bobot: b }))}
                        >
                          {b}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Field>
            </Grid>

            {/* Kebutuhan / Deskripsi Kualifikasi */}
            <Field
              label="Kebutuhan / Kualifikasi Spesifik"
              hint="Uraian kualifikasi yang diharapkan dari pelamar lowongan ini"
              error={formErrors.kebutuhan}
            >
              {(id, desc) => (
                <Textarea
                  id={id}
                  describedBy={desc}
                  rows={3}
                  value={formData.kebutuhan}
                  onChange={(v) => setFormData((prev) => ({ ...prev, kebutuhan: v }))}
                  placeholder="Contoh: Minimal SMA/SMK / D3 / S1 Semua Jurusan (Komunikasi nilai tambah)"
                />
              )}
            </Field>

            {/* Keywords Penilaian */}
            <Field
              label="Kata Kunci Penilaian (Keywords ATS)"
              hint="Pisahkan kata kunci dengan tanda koma (,). Sistem ATS akan mencocokkan kata kunci ini di CV / formulir pelamar."
              error={formErrors.keywords}
            >
              {(id, desc) => (
                <div className="space-y-2">
                  <Input
                    id={id}
                    describedBy={desc}
                    value={formData.keywords_input}
                    onChange={(v) => setFormData((prev) => ({ ...prev, keywords_input: v }))}
                    placeholder="Contoh: komunikasi, sastra, manajemen, semua jurusan, administrasi"
                  />
                  {formData.keywords_input && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-surface rounded-lg border border-edge">
                      <span className="text-[11px] font-bold text-muted mr-1 self-center">
                        Preview Keywords:
                      </span>
                      {formData.keywords_input
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((kw, i) => (
                          <Badge key={i} tone="mint">
                            {kw}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </Field>

            {/* Urutan, Wajib & Active */}
            <Grid cols={3} gap={4}>
              <Field
                label="Nomor Urut Tampilan"
                hint="Urutan kriteria pada penilaian & review"
                error={formErrors.urutan}
              >
                {(id, desc) => (
                  <Input
                    id={id}
                    type="number"
                    min={1}
                    describedBy={desc}
                    value={String(formData.urutan)}
                    onChange={(v) => setFormData((prev) => ({ ...prev, urutan: Number(v) || 1 }))}
                  />
                )}
              </Field>

              <div className="flex flex-col justify-center gap-1.5 p-3 rounded-xl border border-edge bg-surface">
                <span className="text-[12px] font-bold uppercase tracking-wider text-ink">
                  Kriteria Wajib (Mandatory)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Checkbox
                    checked={formData.is_wajib}
                    onChange={(c) => setFormData((prev) => ({ ...prev, is_wajib: !!c }))}
                    label="Kriteria Wajib"
                  />
                  <span className="text-xs text-muted">
                    Pelamar harus memenuhi kriteria ini
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-1.5 p-3 rounded-xl border border-edge bg-surface">
                <span className="text-[12px] font-bold uppercase tracking-wider text-ink">
                  Status Penggunaan
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Switch
                    checked={formData.active}
                    onChange={(c) => setFormData((prev) => ({ ...prev, active: c }))}
                    label="Kriteria Aktif"
                  />
                  <span className="text-xs text-muted">
                    {formData.active ? 'Aktif digunakan' : 'Non-aktif'}
                  </span>
                </div>
              </div>
            </Grid>

            <Separator />

            {/* Modal Actions */}
            <Row gap={2} justify="end">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Kriteria'}
              </Button>
            </Row>
          </Stack>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* DUPLICATE CRITERIA DIALOG                                                 */}
      {/* ========================================================================= */}
      <Dialog
        open={duplicateModalOpen}
        onOpenChange={(open) => {
          if (!open) setDuplicateModalOpen(false)
        }}
        title="Duplikat Kriteria ATS"
        description={`Salin kriteria '${duplicateSource?.nama_kriteria}' ke lowongan pekerjaan lain.`}
        size="md"
      >
        <Stack gap={4}>
          <Field
            label="Pilih Lowongan Tujuan"
            hint="Lowongan pekerjaan yang akan menerima salinan kriteria ini"
          >
            {(id, desc) => (
              <Select
                id={id}
                describedBy={desc}
                value={duplicateTargetLowonganId}
                onChange={(v) => setDuplicateTargetLowonganId(v)}
                options={lowonganOptions.map((l) => ({
                  value: String(l.id),
                  label: `${l.judul} (${l.kode_lowongan}) - ${l.departement}`,
                }))}
              />
            )}
          </Field>

          <Separator />

          <Row gap={2} justify="end">
            <Button
              type="button"
              variant="quiet"
              onClick={() => setDuplicateModalOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleDuplicateSubmit} disabled={isDuplicating || !duplicateTargetLowonganId}>
              <IconCopy size={16} /> {isDuplicating ? 'Menduplikasi...' : 'Duplikat Sekarang'}
            </Button>
          </Row>
        </Stack>
      </Dialog>
    </AppLayout>
  )
}
