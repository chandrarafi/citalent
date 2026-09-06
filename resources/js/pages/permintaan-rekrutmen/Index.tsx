import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import { Table } from '@/components/pouf/table'
import { Stat } from '@/components/pouf/readout'
import { Badge, Blob, Dot } from '@/components/pouf/media'
import { Dialog, Confirm, Select } from '@/components/pouf/controls'
import { Pagination } from '@/components/pouf/pagination'
import { Segmented } from '@/components/pouf/Segmented'
import type { Tone } from '@/components/pouf/tone'

interface DepartementItem {
  id: number
  kd_departement: string
  deskripsi: string
  active?: boolean | string
}

interface JabatanItem {
  id: number
  kd_departement: string
  kd_jabatan: string
  nama_jabatan: string
  active?: boolean | string
}

interface LowonganItem {
  id: number
  kode_lowongan: string
  slug: string
  judul: string
  lokasi_kerja: string
  tipe_pekerjaan: string
  deskripsi?: string | null
  kualifikasi?: string | null
  tgl_buka?: string | null
  tgl_tutup?: string | null
  status: string
  share_url: string
}

interface PermintaanItem {
  id: number
  kode_permintaan: string
  kd_departement: number
  departement?: {
    id: number
    kd_departement: string
    deskripsi: string
  } | null
  posisi_id: number
  jabatan?: {
    id: number
    kd_departement: string
    kd_jabatan: string
    nama_jabatan: string
  } | null
  requester_id?: number | null
  requester?: {
    id: number
    name: string
    email: string
  } | null
  jumlah: number
  tgl_permintaan: string
  target_join: string
  prioritas: 'high' | 'medium' | 'low'
  status_persetujuan: 'pending' | 'disetujui' | 'ditolak' | 'cancel'
  lowongan?: LowonganItem | null
  created_at?: string
}

interface Props {
  permintaans: PermintaanItem[]
  departements: DepartementItem[]
  jabatans: JabatanItem[]
}

const PRIORITAS_OPTIONS = [
  { value: 'high', label: 'High (Tinggi)' },
  { value: 'medium', label: 'Medium (Sedang)' },
  { value: 'low', label: 'Low (Rendah)' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending (Menunggu)' },
  { value: 'disetujui', label: 'Disetujui' },
  { value: 'ditolak', label: 'Ditolak' },
  { value: 'cancel', label: 'Dibatalkan (Cancel)' },
]

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
]

const PRIORITAS_TONE: Record<string, Tone> = {
  high: 'pink',
  medium: 'yellow',
  low: 'blue',
}

const STATUS_TONE: Record<string, Tone> = {
  pending: 'yellow',
  disetujui: 'mint',
  ditolak: 'pink',
  cancel: 'orange',
}

const TIPE_PEKERJAAN_OPTIONS = [
  { value: 'Full-time', label: 'Full-time (Penuh Waktu)' },
  { value: 'Contract', label: 'Kontrak (PKWT)' },
  { value: 'Internship', label: 'Magang (Internship)' },
  { value: 'Part-time', label: 'Part-time' },
]

function generateKodePermintaan(items: PermintaanItem[] = []): string {
  const yearStr = new Date().getFullYear().toString()
  const prefix = `MPR-${yearStr}-`

  const yearSeqs = items
    .map((item) => item.kode_permintaan)
    .filter((code) => Boolean(code && code.startsWith(prefix)))
    .map((code) => {
      const parts = code.split('-')
      const seqStr = parts[parts.length - 1]
      return parseInt(seqStr, 10) || 0
    })

  const nextSeq = (yearSeqs.length ? Math.max(...yearSeqs) : 0) + 1
  const sequence = String(nextSeq).padStart(3, '0')
  return `${prefix}${sequence}`
}

const getTodayDate = () => new Date().toISOString().slice(0, 10)

const emptyForm = (items: PermintaanItem[] = []) => ({
  kode_permintaan: generateKodePermintaan(items),
  kd_departement: '',
  posisi_id: '',
  jumlah: '1',
  tgl_permintaan: getTodayDate(),
  target_join: '',
  prioritas: 'medium' as 'high' | 'medium' | 'low',
  status_persetujuan: 'pending' as 'pending' | 'disetujui' | 'ditolak' | 'cancel',
})

const emptyPublishForm = () => ({
  judul: '',
  lokasi_kerja: 'Kantor Pusat (On-site)',
  tipe_pekerjaan: 'Full-time',
  deskripsi: '',
  kualifikasi: '',
  tgl_buka: getTodayDate(),
  tgl_tutup: '',
})

export default function Index({ permintaans, departements, jabatans }: Props) {
  const { auth, flash, errors: pageErrors } = usePage<any>().props
  const userRole = auth?.user?.role?.name || ''
  const isHrOrAdmin = ['super-admin', 'hr', 'hr-manager'].includes(userRole)

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [prioritasFilter, setPrioritasFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pageSize, setPageSize] = useState('5')
  const [page, setPage] = useState(1)

  // Modals state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  const [selectedItem, setSelectedItem] = useState<PermintaanItem | null>(null)
  const [editing, setEditing] = useState<PermintaanItem | null>(null)
  const [form, setForm] = useState(emptyForm(permintaans))
  const [publishForm, setPublishForm] = useState(emptyPublishForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Filtered positions based on selected department in form
  const filteredJabatansForForm = useMemo(() => {
    if (!form.kd_departement) return jabatans
    const dept = departements.find((d) => String(d.id) === String(form.kd_departement))
    if (!dept) return jabatans
    return jabatans.filter((j) => j.kd_departement === dept.kd_departement)
  }, [form.kd_departement, departements, jabatans])

  // Filtered permintaans
  const filteredPermintaans = useMemo(() => {
    return permintaans.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        item.kode_permintaan.toLowerCase().includes(q) ||
        (item.jabatan?.nama_jabatan &&
          item.jabatan.nama_jabatan.toLowerCase().includes(q)) ||
        (item.departement?.deskripsi &&
          item.departement.deskripsi.toLowerCase().includes(q)) ||
        (item.requester?.name &&
          item.requester.name.toLowerCase().includes(q))

      const matchDept =
        deptFilter === 'all' || String(item.kd_departement) === String(deptFilter)
      const matchPrioritas =
        prioritasFilter === 'all' || item.prioritas === prioritasFilter
      const matchStatus =
        statusFilter === 'all' || item.status_persetujuan === statusFilter

      return matchSearch && matchDept && matchPrioritas && matchStatus
    })
  }, [permintaans, search, deptFilter, prioritasFilter, statusFilter])

  // Pagination calculations
  const limit = parseInt(pageSize, 10) || 5
  const totalPages = Math.max(1, Math.ceil(filteredPermintaans.length / limit))

  const paginatedPermintaans = useMemo(() => {
    const start = (page - 1) * limit
    return filteredPermintaans.slice(start, start + limit)
  }, [filteredPermintaans, page, limit])

  const startIndex = filteredPermintaans.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredPermintaans.length)

  // Top KPI Stats
  const stats = useMemo(() => {
    const total = permintaans.length
    const pending = permintaans.filter((p) => p.status_persetujuan === 'pending').length
    const disetujui = permintaans.filter((p) => p.status_persetujuan === 'disetujui').length
    const totalKebutuhan = permintaans.reduce((sum, p) => sum + (p.jumlah || 0), 0)
    return { total, pending, disetujui, totalKebutuhan }
  }, [permintaans])

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm(permintaans),
      kd_departement: departements.length > 0 ? String(departements[0].id) : '',
      posisi_id: jabatans.length > 0 ? String(jabatans[0].id) : '',
    })
    setErrors({})
    setDialogOpen(true)
  }

  function openEdit(item: PermintaanItem) {
    setEditing(item)
    setForm({
      kode_permintaan: item.kode_permintaan,
      kd_departement: String(item.kd_departement),
      posisi_id: String(item.posisi_id),
      jumlah: String(item.jumlah),
      tgl_permintaan: item.tgl_permintaan,
      target_join: item.target_join,
      prioritas: item.prioritas,
      status_persetujuan: item.status_persetujuan,
    })
    setErrors({})
    setDialogOpen(true)
  }

  function openDetail(item: PermintaanItem) {
    setSelectedItem(item)
    setCopiedLink(false)
    setDetailOpen(true)
  }

  function openPublish(item: PermintaanItem) {
    setSelectedItem(item)
    const posisiNama = item.jabatan?.nama_jabatan || `Posisi #${item.posisi_id}`
    setPublishForm({
      judul: `${posisiNama}`,
      lokasi_kerja: 'Kantor Pusat (On-site)',
      tipe_pekerjaan: 'Full-time',
      deskripsi: `Kami membuka kesempatan berkarir untuk posisi ${posisiNama} di departemen ${item.departement?.deskripsi ?? ''}. Kebutuhan: ${item.jumlah} orang.`,
      kualifikasi: `- Pendidikan minimal sesuai kualifikasi\n- Memiliki pengalaman relevan di bidangnya\n- Mampu bekerja secara tim maupun mandiri`,
      tgl_buka: getTodayDate(),
      tgl_tutup: item.target_join || '',
    })
    setErrors({})
    setPublishOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
  }

  function closePublish() {
    setPublishOpen(false)
  }

  function handleDepartementChange(deptId: string) {
    const selectedDept = departements.find((d) => String(d.id) === String(deptId))
    const firstJabatan = selectedDept
      ? jabatans.find((j) => j.kd_departement === selectedDept.kd_departement)
      : undefined

    setForm((f) => ({
      ...f,
      kd_departement: deptId,
      posisi_id: firstJabatan ? String(firstJabatan.id) : (jabatans[0] ? String(jabatans[0].id) : ''),
    }))
  }

  function submit() {
    setLoading(true)
    setErrors({})

    const payload = {
      kode_permintaan: form.kode_permintaan,
      kd_departement: parseInt(form.kd_departement, 10),
      posisi_id: parseInt(form.posisi_id, 10),
      jumlah: parseInt(form.jumlah, 10) || 1,
      tgl_permintaan: form.tgl_permintaan,
      target_join: form.target_join,
      prioritas: form.prioritas,
      status_persetujuan: form.status_persetujuan,
    }

    if (editing) {
      router.put(`/permintaanrekrutmen/${editing.id}`, payload, {
        onSuccess: () => {
          setLoading(false)
          closeDialog()
        },
        onError: (errs) => {
          setLoading(false)
          setErrors(errs)
        },
      })
    } else {
      router.post('/permintaanrekrutmen', payload, {
        onSuccess: () => {
          setLoading(false)
          closeDialog()
        },
        onError: (errs) => {
          setLoading(false)
          setErrors(errs)
        },
      })
    }
  }

  function handleApprove(item: PermintaanItem, andPublish = false) {
    setLoading(true)
    router.post(`/permintaanrekrutmen/${item.id}/approve`, {}, {
      onSuccess: () => {
        setLoading(false)
        setDetailOpen(false)
        if (andPublish) {
          openPublish(item)
        }
      },
      onError: () => setLoading(false),
    })
  }

  function handleReject(item: PermintaanItem) {
    setLoading(true)
    router.post(`/permintaanrekrutmen/${item.id}/reject`, {}, {
      onSuccess: () => {
        setLoading(false)
        setDetailOpen(false)
      },
      onError: () => setLoading(false),
    })
  }

  function submitPublish() {
    if (!selectedItem) return
    setLoading(true)
    setErrors({})

    router.post(`/permintaanrekrutmen/${selectedItem.id}/publish`, publishForm, {
      onSuccess: () => {
        setLoading(false)
        setPublishOpen(false)
        setDetailOpen(false)
      },
      onError: (errs) => {
        setLoading(false)
        setErrors(errs)
      },
    })
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  function destroy(item: PermintaanItem) {
    router.delete(`/permintaanrekrutmen/${item.id}`)
  }

  const columns = [
    {
      key: 'kode',
      header: 'Kode Permintaan',
      mono: true,
      render: (item: PermintaanItem) => (
        <Badge tone="purple">{item.kode_permintaan}</Badge>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) =>
        a.kode_permintaan.localeCompare(b.kode_permintaan),
    },
    {
      key: 'departemen_posisi',
      header: 'Departemen & Posisi',
      render: (item: PermintaanItem) => (
        <Row gap={3} wrap={false} align="center">
          <Blob icon="database" tone="blue" size="sm" />
          <Stack gap={1}>
            <Text>
              <strong>{item.jabatan?.nama_jabatan ?? `Jabatan #${item.posisi_id}`}</strong>
            </Text>
            <Text size="sm" muted>
              {item.departement?.deskripsi ?? `Dept #${item.kd_departement}`}
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) =>
        (a.jabatan?.nama_jabatan ?? '').localeCompare(b.jabatan?.nama_jabatan ?? ''),
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (item: PermintaanItem) => (
        <Row gap={2} wrap={false} align="center">
          <Blob icon="user" tone="purple" size="sm" />
          <Stack gap={1}>
            <Text size="sm">
              <strong>{item.requester?.name ?? '—'}</strong>
            </Text>
            {item.requester?.email && (
              <Text size="sm" muted truncate>
                {item.requester.email}
              </Text>
            )}
          </Stack>
        </Row>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) =>
        (a.requester?.name ?? '').localeCompare(b.requester?.name ?? ''),
    },
    {
      key: 'jumlah',
      header: 'Kebutuhan',
      align: 'right' as const,
      mono: true,
      render: (item: PermintaanItem) => (
        <Badge tone="blue">
          {item.jumlah} Orang
        </Badge>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) => a.jumlah - b.jumlah,
    },
    {
      key: 'jadwal',
      header: 'Jadwal',
      render: (item: PermintaanItem) => (
        <Stack gap={1}>
          <Text size="sm">
            <span className="text-muted">Minta:</span> {item.tgl_permintaan}
          </Text>
          <Text size="sm">
            <span className="text-muted">Target:</span> <strong>{item.target_join}</strong>
          </Text>
        </Stack>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) =>
        a.target_join.localeCompare(b.target_join),
    },
    {
      key: 'prioritas',
      header: 'Prioritas',
      render: (item: PermintaanItem) => (
        <Badge tone={PRIORITAS_TONE[item.prioritas] || 'yellow'}>
          {item.prioritas.toUpperCase()}
        </Badge>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) =>
        a.prioritas.localeCompare(b.prioritas),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right' as const,
      render: (item: PermintaanItem) => (
        <Row gap={2} justify="end" align="center" wrap={false}>
          <Dot tone={STATUS_TONE[item.status_persetujuan] || 'yellow'} />
          <Badge tone={STATUS_TONE[item.status_persetujuan] || 'yellow'}>
            {item.status_persetujuan.toUpperCase()}
          </Badge>
        </Row>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) =>
        a.status_persetujuan.localeCompare(b.status_persetujuan),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right' as const,
      render: (item: PermintaanItem) => {
        const canEdit = isHrOrAdmin || auth?.user?.id === item.requester_id
        return (
          <Row gap={2} justify="end" wrap={false}>
            {/* Detail Button */}
            <Button size="sm" variant="quiet" tone="purple" onClick={() => openDetail(item)}>
              Detail
            </Button>

            {canEdit && item.status_persetujuan === 'pending' && (
              <Button size="sm" variant="quiet" onClick={() => openEdit(item)}>
                Edit
              </Button>
            )}

            {canEdit && (
              <Confirm
                title={`Hapus Permintaan "${item.kode_permintaan}"?`}
                body="Permintaan rekrutmen ini akan dihapus secara permanen dari sistem."
                confirmLabel="Hapus Permintaan"
                cancelLabel="Batalkan"
                tone="orange"
                onConfirm={() => destroy(item)}
                details={
                  <Card variant="tight">
                    <Stack gap={1}>
                      <Text size="sm">
                        <strong>Posisi:</strong> {item.jabatan?.nama_jabatan ?? item.posisi_id}
                      </Text>
                      <Text size="sm">
                        <strong>Departemen:</strong> {item.departement?.deskripsi ?? item.kd_departement}
                      </Text>
                      <Text size="sm">
                        <strong>Requester:</strong> {item.requester?.name ?? '—'}
                      </Text>
                      <Text size="sm">
                        <strong>Jumlah:</strong> {item.jumlah} Orang
                      </Text>
                    </Stack>
                  </Card>
                }
              >
                <Button size="sm" variant="quiet">
                  Hapus
                </Button>
              </Confirm>
            )}
          </Row>
        )
      },
    },
  ]

  return (
    <AppLayout>
      <Head title="Permintaan Rekrutmen" />
      <Stack gap={5}>
        {/* Header Title & Actions */}
        <Row justify="between" align="center">
          <Stack gap={1}>
            <Eyebrow>Modul Rekrutmen & Talenta</Eyebrow>
            <Heading level={1}>Permintaan Rekrutmen</Heading>
            <Text size="sm" muted>
              Kelola pengajuan kebutuhan tenaga kerja baru, persetujuan HR/Management, dan publikasi lowongan kerja
            </Text>
          </Stack>
          <Button onClick={openCreate}>+ Buat Permintaan</Button>
        </Row>

        {/* Top KPI Stats */}
        <Grid cols={4}>
          <Stat
            label="Total Pengajuan"
            value={String(stats.total)}
            icon="database"
            tone="purple"
          />
          <Stat
            label="Menunggu Persetujuan"
            value={`${stats.pending} Item`}
            icon="clock"
            tone="yellow"
          />
          <Stat
            label="Telah Disetujui"
            value={`${stats.disetujui} Item`}
            icon="ok"
            tone="mint"
          />
          <Stat
            label="Total Kebutuhan SDM"
            value={`${stats.totalKebutuhan} Posisi`}
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

        {(flash as any)?.error && (
          <Card variant="tight">
            <Row gap={2} align="center">
              <Blob icon="fail" tone="pink" size="sm" />
              <Text>{(flash as any).error}</Text>
            </Row>
          </Card>
        )}

        {/* DataTable Card */}
        <Card>
          <Stack gap={4}>
            {/* Search & Filter Toolbar */}
            <Row justify="between" align="center">
              <div style={{ maxWidth: 320, width: '100%' }}>
                <Input
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setPage(1)
                  }}
                  placeholder="Cari kode, posisi, departemen, requester..."
                />
              </div>

              <Row gap={3} align="center">
                {/* Departement Filter */}
                <div style={{ width: 170 }}>
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

                {/* Prioritas Filter */}
                <div style={{ width: 150 }}>
                  <Select
                    value={prioritasFilter}
                    onChange={(v) => {
                      setPrioritasFilter(v)
                      setPage(1)
                    }}
                    options={[
                      { value: 'all', label: 'Semua Prioritas' },
                      ...PRIORITAS_OPTIONS,
                    ]}
                  />
                </div>

                {/* Status Filter */}
                <div style={{ width: 160 }}>
                  <Select
                    value={statusFilter}
                    onChange={(v) => {
                      setStatusFilter(v)
                      setPage(1)
                    }}
                    options={[
                      { value: 'all', label: 'Semua Status' },
                      ...STATUS_OPTIONS,
                    ]}
                  />
                </div>

                {/* Page Size */}
                <div style={{ width: 120 }}>
                  <Select
                    value={pageSize}
                    onChange={(v) => {
                      setPageSize(v)
                      setPage(1)
                    }}
                    options={PAGE_SIZE_OPTIONS}
                  />
                </div>
              </Row>
            </Row>

            {/* Pouf Table */}
            <Table
              rows={paginatedPermintaans}
              columns={columns}
              getKey={(item) => String(item.id)}
            />

            {/* Pagination Controls */}
            <Row justify="between" align="center">
              <Text size="sm" muted>
                Menampilkan {startIndex}-{endIndex} dari {filteredPermintaans.length} data (Halaman {page} dari {totalPages})
              </Text>
              <Pagination
                page={page}
                total={totalPages}
                onChange={(p) => setPage(p)}
              />
            </Row>
          </Stack>
        </Card>
      </Stack>

      {/* Modal Dialog Form Create / Edit */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        size="lg"
        title={editing ? `Edit Permintaan: ${editing.kode_permintaan}` : 'Buat Permintaan Rekrutmen'}
        description="Isi rincian pengajuan kebutuhan penambahan tenaga kerja baru"
      >
        <Stack gap={4}>
          <Field
            label="Kode Permintaan"
            error={errors.kode_permintaan || pageErrors?.kode_permintaan}
          >
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={form.kode_permintaan}
                onChange={() => {}}
                disabled
                mono
              />
            )}
          </Field>

          <Grid cols={2}>
            <Field
              label="Departemen"
              error={errors.kd_departement || pageErrors?.kd_departement}
            >
              {() => (
                <Select
                  value={form.kd_departement}
                  onChange={handleDepartementChange}
                  options={departements.map((d) => ({
                    value: String(d.id),
                    label: d.deskripsi,
                  }))}
                />
              )}
            </Field>

            <Field
              label="Posisi / Jabatan"
              error={errors.posisi_id || pageErrors?.posisi_id}
            >
              {() => (
                <Select
                  value={form.posisi_id}
                  onChange={(v) => setForm((f) => ({ ...f, posisi_id: v }))}
                  options={filteredJabatansForForm.map((j) => ({
                    value: String(j.id),
                    label: j.nama_jabatan,
                  }))}
                />
              )}
            </Field>
          </Grid>

          <Grid cols={3}>
            <Field
              label="Jumlah (Orang)"
              error={errors.jumlah || pageErrors?.jumlah}
            >
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  type="number"
                  min="1"
                  value={form.jumlah}
                  onChange={(v) => setForm((f) => ({ ...f, jumlah: v }))}
                  mono
                />
              )}
            </Field>

            <Field
              label="Tgl Permintaan"
              error={errors.tgl_permintaan || pageErrors?.tgl_permintaan}
            >
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  type="date"
                  value={form.tgl_permintaan}
                  onChange={(v) => setForm((f) => ({ ...f, tgl_permintaan: v }))}
                />
              )}
            </Field>

            <Field
              label="Target Join"
              error={errors.target_join || pageErrors?.target_join}
            >
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  type="date"
                  value={form.target_join}
                  onChange={(v) => setForm((f) => ({ ...f, target_join: v }))}
                />
              )}
            </Field>
          </Grid>

          <Field
            label="Prioritas Kebutuhan"
            error={errors.prioritas || pageErrors?.prioritas}
          >
            {() => (
              <Select
                value={form.prioritas}
                onChange={(v) => setForm((f) => ({ ...f, prioritas: v as any }))}
                options={[
                  { value: 'high', label: 'High (Tinggi)' },
                  { value: 'medium', label: 'Medium (Sedang)' },
                  { value: 'low', label: 'Low (Rendah)' },
                ]}
              />
            )}
          </Field>

          {/* Dialog Action Buttons */}
          <Row gap={3} justify="end">
            <Button variant="quiet" onClick={closeDialog}>
              Batal
            </Button>
            <Button loading={loading} onClick={submit}>
              {editing ? 'Simpan Perubahan' : 'Kirim Permintaan'}
            </Button>
          </Row>
        </Stack>
      </Dialog>

      {/* Modal Detail Permintaan */}
      <Dialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        size="lg"
        title={`Rincian Permintaan: ${selectedItem?.kode_permintaan ?? ''}`}
        description="Detail informasi kebutuhan tenaga kerja dan status persetujuan"
      >
        {selectedItem && (
          <Stack gap={5}>
            {/* Top Badge & Status Summary */}
            <Row justify="between" align="center">
              <Row gap={2} align="center">
                <Badge tone="purple">{selectedItem.kode_permintaan}</Badge>
                <Badge tone={PRIORITAS_TONE[selectedItem.prioritas] || 'yellow'}>
                  PRIORITAS {selectedItem.prioritas.toUpperCase()}
                </Badge>
              </Row>
              <Badge tone={STATUS_TONE[selectedItem.status_persetujuan] || 'yellow'}>
                STATUS: {selectedItem.status_persetujuan.toUpperCase()}
              </Badge>
            </Row>

            {/* Info Grid Card */}
            <Card variant="tight">
              <Grid cols={2}>
                <Stack gap={1}>
                  <Text size="sm" muted>Posisi / Jabatan:</Text>
                  <Text><strong>{selectedItem.jabatan?.nama_jabatan ?? `Posisi #${selectedItem.posisi_id}`}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Departemen:</Text>
                  <Text><strong>{selectedItem.departement?.deskripsi ?? `Dept #${selectedItem.kd_departement}`}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Jumlah Kebutuhan:</Text>
                  <Text><strong>{selectedItem.jumlah} Orang</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Diajukan Oleh (Requester):</Text>
                  <Text><strong>{selectedItem.requester?.name ?? '—'}</strong> ({selectedItem.requester?.email ?? ''})</Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Tanggal Permintaan:</Text>
                  <Text mono>{selectedItem.tgl_permintaan}</Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Target Masuk (Join):</Text>
                  <Text mono><strong>{selectedItem.target_join}</strong></Text>
                </Stack>
              </Grid>
            </Card>

            {/* Published Vacancy Link Section if Lowongan exists */}
            {selectedItem.lowongan ? (
              <Card variant="tight">
                <Stack gap={3}>
                  <Row justify="between" align="center">
                    <Row gap={2} align="center">
                      <Blob icon="ok" tone="mint" size="sm" />
                      <Heading level={2}>Lowongan Telah Dipublikasikan</Heading>
                    </Row>
                    <Badge tone="mint">STATUS: {selectedItem.lowongan.status.toUpperCase()}</Badge>
                  </Row>

                  <Text size="sm">
                    <strong>{selectedItem.lowongan.judul}</strong> ({selectedItem.lowongan.kode_lowongan}) &bull; {selectedItem.lowongan.tipe_pekerjaan} &bull; {selectedItem.lowongan.lokasi_kerja}
                  </Text>

                  <div className="bg-[var(--color-surface)] p-3 rounded-[12px] border border-[var(--color-line)]">
                    <Stack gap={2}>
                      <Text size="sm" muted>URL Pendaftaran Kandidat (Dapat Dibagikan ke Publik):</Text>
                      <Row gap={2} align="center">
                        <Input
                          value={selectedItem.lowongan.share_url}
                          onChange={() => {}}
                          readOnly
                          mono
                        />
                        <Button
                          size="sm"
                          variant="quiet"
                          onClick={() => copyToClipboard(selectedItem.lowongan!.share_url)}
                        >
                          {copiedLink ? '✓ Tersalin!' : 'Salin URL'}
                        </Button>
                        <Button
                          size="sm"
                          tone="purple"
                          onClick={() => window.open(selectedItem.lowongan!.share_url, '_blank')}
                        >
                          Buka Form ↗
                        </Button>
                      </Row>
                    </Stack>
                  </div>
                </Stack>
              </Card>
            ) : selectedItem.status_persetujuan === 'disetujui' && isHrOrAdmin ? (
              <Card variant="tight">
                <Row justify="between" align="center">
                  <Stack gap={1}>
                    <Heading level={2}>Permintaan Disetujui</Heading>
                    <Text size="sm" muted>
                      Permintaan telah disetujui. Publikasikan lowongan agar kandidat dapat mendaftar.
                    </Text>
                  </Stack>
                  <Button tone="purple" onClick={() => { setDetailOpen(false); openPublish(selectedItem); }}>
                    Publikasikan Lowongan ↗
                  </Button>
                </Row>
              </Card>
            ) : null}

            {/* Approval / Rejection Actions for HR & Super Admin */}
            {isHrOrAdmin && selectedItem.status_persetujuan === 'pending' && (
              <div className="pt-3 border-t border-[var(--color-line)]">
                <Row justify="between" align="center">
                  {/* Reject Confirm */}
                  <Confirm
                    title={`Tolak Permintaan "${selectedItem.kode_permintaan}"?`}
                    body="Status permintaan akan diubah menjadi Ditolak."
                    confirmLabel="Tolak Permintaan"
                    cancelLabel="Batalkan"
                    tone="orange"
                    onConfirm={() => handleReject(selectedItem)}
                  >
                    <Button variant="quiet" tone="pink" loading={loading}>
                      ✕ Tolak Permintaan
                    </Button>
                  </Confirm>

                  <Row gap={2}>
                    <Button
                      variant="quiet"
                      tone="mint"
                      loading={loading}
                      onClick={() => handleApprove(selectedItem, false)}
                    >
                      ✓ Setujui Saja
                    </Button>
                    <Button
                      tone="purple"
                      loading={loading}
                      onClick={() => handleApprove(selectedItem, true)}
                    >
                      ✓ Setujui & Publikasikan Lowongan
                    </Button>
                  </Row>
                </Row>
              </div>
            )}

            {/* Close Button */}
            <Row justify="end">
              <Button variant="quiet" onClick={() => setDetailOpen(false)}>
                Tutup
              </Button>
            </Row>
          </Stack>
        )}
      </Dialog>

      {/* Modal Dialog Publikasi Lowongan */}
      <Dialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        size="lg"
        title="Publikasikan Lowongan Pekerjaan"
        description="Formulir publikasi lowongan kerja untuk pendaftaran kandidat eksternal"
      >
        <Stack gap={4}>
          <Field label="Judul Lowongan Pekerjaan *" error={errors.judul || pageErrors?.judul}>
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={publishForm.judul}
                onChange={(v) => setPublishForm((f) => ({ ...f, judul: v }))}
                placeholder="contoh: Senior Backend Developer"
              />
            )}
          </Field>

          <Grid cols={2}>
            <Field label="Tipe Pekerjaan *" error={errors.tipe_pekerjaan || pageErrors?.tipe_pekerjaan}>
              {() => (
                <Select
                  value={publishForm.tipe_pekerjaan}
                  onChange={(v) => setPublishForm((f) => ({ ...f, tipe_pekerjaan: v }))}
                  options={TIPE_PEKERJAAN_OPTIONS}
                />
              )}
            </Field>

            <Field label="Lokasi Kerja *" error={errors.lokasi_kerja || pageErrors?.lokasi_kerja}>
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={publishForm.lokasi_kerja}
                  onChange={(v) => setPublishForm((f) => ({ ...f, lokasi_kerja: v }))}
                  placeholder="contoh: Jakarta Selatan / Hybrid"
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
                  value={publishForm.tgl_buka}
                  onChange={(v) => setPublishForm((f) => ({ ...f, tgl_buka: v }))}
                />
              )}
            </Field>

            <Field label="Batas Akhir Pendaftaran (Tgl Tutup)" error={errors.tgl_tutup || pageErrors?.tgl_tutup}>
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  type="date"
                  value={publishForm.tgl_tutup}
                  onChange={(v) => setPublishForm((f) => ({ ...f, tgl_tutup: v }))}
                />
              )}
            </Field>
          </Grid>

          <Field label="Deskripsi Pekerjaan" error={errors.deskripsi || pageErrors?.deskripsi}>
            {() => (
              <textarea
                className="w-full min-h-[90px] p-3 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] text-[14px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
                value={publishForm.deskripsi}
                onChange={(e) => setPublishForm((f) => ({ ...f, deskripsi: e.target.value }))}
                placeholder="Rincian tanggung jawab dan tugas posisi ini..."
              />
            )}
          </Field>

          <Field label="Kualifikasi & Persyaratan" error={errors.kualifikasi || pageErrors?.kualifikasi}>
            {() => (
              <textarea
                className="w-full min-h-[90px] p-3 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] text-[14px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
                value={publishForm.kualifikasi}
                onChange={(e) => setPublishForm((f) => ({ ...f, kualifikasi: e.target.value }))}
                placeholder="Syarat pendidikan, pengalaman, dan keahlian yang dibutuhkan..."
              />
            )}
          </Field>

          {/* Action buttons */}
          <Row gap={3} justify="end">
            <Button variant="quiet" onClick={closePublish}>
              Batal
            </Button>
            <Button loading={loading} tone="purple" onClick={submitPublish}>
              Publikasikan Lowongan & Buat Link Form Pendaftaran
            </Button>
          </Row>
        </Stack>
      </Dialog>
    </AppLayout>
  )
}
