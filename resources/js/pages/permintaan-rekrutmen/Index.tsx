import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Table } from '@/components/pouf/table'
import { Badge, Blob, Dot } from '@/components/pouf/media'
import { Confirm } from '@/components/pouf/controls'
import { Pagination } from '@/components/pouf/pagination'

import type {
  DepartementItem,
  JabatanItem,
  PermintaanItem,
} from './types'
import {
  emptyForm,
  emptyPublishForm,
  getTodayDate,
  PRIORITAS_TONE,
  STATUS_TONE,
} from './types'

import { StatsCards } from './components/StatsCards'
import { FilterBar } from './components/FilterBar'
import { FormDialog } from './components/FormDialog'
import { DetailDialog } from './components/DetailDialog'
import { ApproveDialog } from './components/ApproveDialog'

interface Props {
  permintaans: PermintaanItem[]
  departements: DepartementItem[]
  jabatans: JabatanItem[]
}

export default function Index({ permintaans, departements, jabatans }: Props) {
  const { auth, errors: pageErrors } = usePage<any>().props
  const userRole = auth?.user?.role?.name || ''
  const isHrOrAdmin = ['super-admin', 'hr', 'hr-manager'].includes(userRole)

  // Filter & pagination state
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [prioritasFilter, setPrioritasFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pageSize, setPageSize] = useState('5')
  const [page, setPage] = useState(1)

  // Modals state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)

  // Selected item & forms state
  const [selectedItem, setSelectedItem] = useState<PermintaanItem | null>(null)
  const [editing, setEditing] = useState<PermintaanItem | null>(null)
  const [form, setForm] = useState(emptyForm(permintaans))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

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

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
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
        setApproveDialogOpen(false)
        setDetailOpen(false)
        if (andPublish) {
          router.get(`/lowongan/create?permintaan_id=${item.id}`)
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
      minWidth: '130px',
      render: (item: PermintaanItem) => (
        <Badge tone="purple">{item.kode_permintaan}</Badge>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) =>
        a.kode_permintaan.localeCompare(b.kode_permintaan),
    },
    {
      key: 'departemen_posisi',
      header: 'Departemen & Posisi',
      minWidth: '220px',
      render: (item: PermintaanItem) => (
        <Row gap={3} wrap={false} align="center" className="min-w-[190px]">
          <Blob icon="database" tone="blue" size="sm" className="shrink-0" />
          <Stack gap={1} className="min-w-0">
            <Text className="whitespace-nowrap">
              <strong>{item.jabatan?.nama_jabatan ?? `Jabatan #${item.posisi_id}`}</strong>
            </Text>
            <Text size="sm" muted className="whitespace-nowrap">
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
      minWidth: '180px',
      render: (item: PermintaanItem) => (
        <Row gap={2} wrap={false} align="center" className="min-w-[150px]">
          <Blob icon="user" tone="purple" size="sm" className="shrink-0" />
          <Stack gap={1} className="min-w-0">
            <Text size="sm" className="whitespace-nowrap">
              <strong>{item.requester?.name ?? '—'}</strong>
            </Text>
            {item.requester?.email && (
              <Text size="sm" muted className="whitespace-nowrap">
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
      key: 'kebutuhan',
      header: 'Kebutuhan',
      align: 'center' as const,
      minWidth: '110px',
      render: (item: PermintaanItem) => (
        <Badge tone="blue" className="whitespace-nowrap font-bold">
          {item.jumlah} ORANG
        </Badge>
      ),
      sort: (a: PermintaanItem, b: PermintaanItem) => a.jumlah - b.jumlah,
    },
    {
      key: 'jadwal',
      header: 'Jadwal',
      minWidth: '150px',
      render: (item: PermintaanItem) => (
        <Stack gap={1} className="whitespace-nowrap min-w-[130px]">
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
      minWidth: '100px',
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
      minWidth: '130px',
      render: (item: PermintaanItem) => (
        <Row gap={2} justify="end" align="center" wrap={false} className="shrink-0 whitespace-nowrap">
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
      minWidth: '180px',
      render: (item: PermintaanItem) => {
        const canEdit = isHrOrAdmin || auth?.user?.id === item.requester_id
        return (
          <Row gap={2} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1} className="flex-1 min-w-0">
            <Eyebrow>Modul Rekrutmen & Talenta</Eyebrow>
            <Heading level={1}>Permintaan Rekrutmen</Heading>
            <Text size="sm" muted>
              Kelola pengajuan kebutuhan tenaga kerja baru, persetujuan HR/Management, dan publikasi lowongan kerja
            </Text>
          </Stack>
          <Button onClick={openCreate} className="w-full sm:w-auto shrink-0">+ Buat Permintaan</Button>
        </div>

        {/* Top KPI Stats */}
        <StatsCards stats={stats} />

        {/* Main Content Card with Pouf Table */}
        <Card>
          <Stack gap={4}>
            {/* Search & Filters Bar */}
            <FilterBar
              search={search}
              onSearchChange={(v) => {
                setSearch(v)
                setPage(1)
              }}
              deptFilter={deptFilter}
              onDeptFilterChange={(v) => {
                setDeptFilter(v)
                setPage(1)
              }}
              prioritasFilter={prioritasFilter}
              onPrioritasFilterChange={(v) => {
                setPrioritasFilter(v)
                setPage(1)
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
              pageSize={pageSize}
              onPageSizeChange={(v) => {
                setPageSize(v)
                setPage(1)
              }}
              departements={departements}
            />

            {/* Pouf Table */}
            <Table
              rows={paginatedPermintaans}
              columns={columns}
              getKey={(item) => String(item.id)}
            />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
              <Text size="sm" muted className="text-center sm:text-left">
                Menampilkan {startIndex}-{endIndex} dari {filteredPermintaans.length} data (Halaman {page} dari {totalPages})
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

      {/* Modal Dialog Form Create / Edit */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        form={form}
        setForm={setForm}
        departements={departements}
        jabatans={jabatans}
        errors={errors}
        pageErrors={pageErrors}
        loading={loading}
        onSubmit={submit}
        onClose={closeDialog}
      />

      {/* Modal Detail Permintaan */}
      <DetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedItem}
        isHrOrAdmin={isHrOrAdmin}
        loading={loading}
        copiedLink={copiedLink}
        onCopyLink={copyToClipboard}
        onReject={handleReject}
        onApproveClick={() => {
          setDetailOpen(false)
          setApproveDialogOpen(true)
        }}
        onOpenPublish={(item) => {
          setDetailOpen(false)
          router.get(`/lowongan/create?permintaan_id=${item.id}`)
        }}
      />

      {/* Modal Dialog Persetujuan Permintaan Rekrutmen */}
      <ApproveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        item={selectedItem}
        loading={loading}
        onApprove={handleApprove}
      />
    </AppLayout>
  )
}
