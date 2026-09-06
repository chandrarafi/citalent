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
import { Badge, Blob } from '@/components/pouf/media'
import { Dialog, Confirm, Select } from '@/components/pouf/controls'
import { Checkbox } from '@/components/pouf/checkbox'
import { Pagination } from '@/components/pouf/pagination'

interface Role {
  id: number
  name: string
  label: string
  permissions: string[]
}

interface Props {
  roles: Role[]
  allPermissions: string[]
}

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
]

export default function Roles({ roles, allPermissions }: Props) {
  const { flash } = usePage<any>().props

  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState('5')
  const [page, setPage] = useState(1)

  // Role form dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [form, setForm] = useState({ name: '', label: '', permissions: [] as string[] })
  const [loading, setLoading] = useState(false)

  // Permission form dialog
  const [permDialogOpen, setPermDialogOpen] = useState(false)
  const [permForm, setPermForm] = useState({ name: '', label: '', group: 'general' })
  const [permLoading, setPermLoading] = useState(false)

  // Filtered & paginated roles
  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return roles
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q) ||
        r.permissions.some((p) => p.toLowerCase().includes(q)),
    )
  }, [roles, search])

  const limit = parseInt(pageSize, 10) || 5
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / limit))

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * limit
    return filteredRoles.slice(start, start + limit)
  }, [filteredRoles, page, limit])

  const startIndex = filteredRoles.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredRoles.length)

  function openCreate() {
    setEditing(null)
    setForm({ name: '', label: '', permissions: [] })
    setDialogOpen(true)
  }

  function openEdit(role: Role) {
    setEditing(role)
    setForm({ name: role.name, label: role.label, permissions: [...role.permissions] })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
  }

  function openCreatePerm() {
    setPermForm({ name: '', label: '', group: 'general' })
    setPermDialogOpen(true)
  }

  function closePermDialog() {
    setPermDialogOpen(false)
  }

  function togglePermission(perm: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }))
  }

  function toggleAllPermissions() {
    if (form.permissions.length === allPermissions.length) {
      setForm((f) => ({ ...f, permissions: [] }))
    } else {
      setForm((f) => ({ ...f, permissions: [...allPermissions] }))
    }
  }

  function submit() {
    setLoading(true)
    const data = { name: form.name, label: form.label, permissions: form.permissions }

    if (editing) {
      router.put(`/admin/roles/${editing.id}`, data, {
        onFinish: () => {
          setLoading(false)
          closeDialog()
        },
      })
    } else {
      router.post('/admin/roles', data, {
        onFinish: () => {
          setLoading(false)
          closeDialog()
        },
      })
    }
  }

  function submitPerm() {
    setPermLoading(true)
    router.post('/admin/permissions', permForm, {
      onFinish: () => {
        setPermLoading(false)
        closePermDialog()
      },
    })
  }

  function destroy(role: Role) {
    router.delete(`/admin/roles/${role.id}`)
  }

  const columns = [
    {
      key: 'role',
      header: 'Role / Label',
      render: (r: Role) => (
        <Row gap={3} wrap={false} align="center">
          <Blob
            icon={r.name === 'super-admin' ? 'star' : 'user'}
            tone={r.name === 'super-admin' ? 'purple' : 'blue'}
            size="sm"
          />
          <Stack gap={1}>
            <Text>{r.label}</Text>
            <Text size="sm" mono muted>
              {r.name}
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a: Role, b: Role) => a.label.localeCompare(b.label),
    },
    {
      key: 'permissions',
      header: 'Hak Akses (Permissions)',
      render: (r: Role) => {
        if (!r.permissions.length) {
          return <Text size="sm" muted>Tidak ada hak akses</Text>
        }
        const visible = r.permissions.slice(0, 3)
        const rest = r.permissions.length - 3
        return (
          <div className="flex flex-wrap gap-1.5 items-center">
            {visible.map((p) => (
              <Badge key={p} tone="purple">
                {p}
              </Badge>
            ))}
            {rest > 0 && <Badge tone="blue">+{rest} lainnya</Badge>}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right' as const,
      render: (r: Role) => (
        <Row gap={2} justify="end" wrap={false}>
          <Button size="sm" variant="quiet" onClick={() => openEdit(r)}>
            Edit
          </Button>
          {r.name !== 'super-admin' && (
            <Confirm
              title={`Hapus Role "${r.label}"?`}
              body="Role ini akan dihapus secara permanen beserta hak akses yang terkait. Pengguna dengan role ini akan kehilangan akses."
              confirmLabel="Hapus Role"
              cancelLabel="Batalkan"
              tone="orange"
              onConfirm={() => destroy(r)}
              details={
                <Card variant="tight">
                  <Stack gap={1}>
                    <Text size="sm">
                      <strong>Slug:</strong> {r.name}
                    </Text>
                    <Text size="sm">
                      <strong>Total Permission:</strong> {r.permissions.length} akses
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
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Manajemen Role & RBAC" />
      <Stack gap={5}>
        {/* Header Title & Actions */}
        <Row justify="between" align="center">
          <Stack gap={1}>
            <Eyebrow>Sistem Hak Akses</Eyebrow>
            <Heading level={1}>Manajemen Role & RBAC</Heading>
            <Text size="sm" muted>
              Kelola peran pengguna dan konfigurasi izin akses fitur dalam aplikasi
            </Text>
          </Stack>
          <Row gap={2}>
            <Button variant="quiet" onClick={openCreatePerm}>+ Hak Akses Baru</Button>
            <Button onClick={openCreate}>+ Tambah Role</Button>
          </Row>
        </Row>

        {/* Top KPI Stats */}
        <Grid cols={3}>
          <Stat
            label="Total Role"
            value={String(roles.length)}
            icon="users"
            tone="purple"
          />
          <Stat
            label="Total Permissions"
            value={String(allPermissions.length)}
            icon="lock"
            tone="blue"
          />
          <Stat
            label="Super Admin Akses"
            value={`${roles.find((r) => r.name === 'super-admin')?.permissions.length ?? allPermissions.length} Fitur`}
            icon="star"
            tone="mint"
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
            {/* Search & Page Size Toolbar */}
            <Row justify="between" align="center">
              <div style={{ maxWidth: 360, width: '100%' }}>
                <Input
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setPage(1)
                  }}
                  placeholder="Cari nama role, slug, atau hak akses..."
                />
              </div>

              <Row gap={3} align="center">
                <Text size="sm" muted>
                  Menampilkan {startIndex}-{endIndex} dari {filteredRoles.length} role
                </Text>
                <div style={{ width: 130 }}>
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
              rows={paginatedRoles}
              columns={columns}
              getKey={(r) => String(r.id)}
            />

            {/* Pagination Controls */}
            <Row justify="between" align="center">
              <Text size="sm" muted>
                Halaman {page} dari {totalPages}
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

      {/* Modal Dialog Form for Create / Edit Role */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        size="md"
        title={editing ? `Edit Role: ${editing.label}` : 'Tambah Role Baru'}
        description={
          editing
            ? 'Perbarui informasi role dan izin akses yang diberikan'
            : 'Buat role baru dan tentukan hak akses untuk pengguna'
        }
      >
        <Stack gap={5}>
          <Field label="Slug (Kode Unik)" hint="Digunakan dalam sistem middleware (e.g. hr-staff)">
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="contoh: hr-staff"
                disabled={editing?.name === 'super-admin'}
                mono
              />
            )}
          </Field>

          <Field label="Label Role" hint="Nama tampilan role yang dibaca pengguna">
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={form.label}
                onChange={(v) => setForm((f) => ({ ...f, label: v }))}
                placeholder="contoh: HR Staff Officer"
              />
            )}
          </Field>

          {/* Permissions selector */}
          <Stack gap={3}>
            <Row justify="between" align="center">
              <Text size="sm" muted>
                Hak Akses ({form.permissions.length} dari {allPermissions.length} dipilih)
              </Text>
              <Row gap={2}>
                <Button size="sm" variant="quiet" onClick={openCreatePerm}>
                  + Baru
                </Button>
                <Button size="sm" variant="quiet" onClick={toggleAllPermissions}>
                  {form.permissions.length === allPermissions.length
                    ? 'Batal Semua'
                    : 'Pilih Semua'}
                </Button>
              </Row>
            </Row>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto p-1">
              {allPermissions.map((perm) => {
                const checked = form.permissions.includes(perm)
                return (
                  <label
                    key={perm}
                    className="flex items-center gap-3 p-2.5 rounded-control cursor-pointer transition-all bg-surface-alt hover:bg-surface"
                    style={{
                      border: checked
                        ? '2px solid var(--purple)'
                        : '2px solid transparent',
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => togglePermission(perm)}
                      hideLabel
                    />
                    <Stack gap={1}>
                      <Text size="sm">{perm}</Text>
                    </Stack>
                  </label>
                )
              })}
            </div>
          </Stack>

          {/* Dialog Actions */}
          <Row gap={3} justify="end">
            <Button variant="quiet" onClick={closeDialog}>
              Batal
            </Button>
            <Button loading={loading} onClick={submit}>
              {editing ? 'Simpan Perubahan' : 'Buat Role'}
            </Button>
          </Row>
        </Stack>
      </Dialog>

      {/* Modal Dialog Form for Create New Master Permission */}
      <Dialog
        open={permDialogOpen}
        onOpenChange={setPermDialogOpen}
        size="md"
        title="Tambah Hak Akses (Permission) Baru"
        description="Daftarkan izin akses baru untuk modul atau fitur sistem"
      >
        <Stack gap={5}>
          <Field label="Nama Permission (Kode Unik)" hint="Huruf kecil dengan tanda hubung (e.g. approve-rekrutmen)">
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={permForm.name}
                onChange={(v) => setPermForm((f) => ({ ...f, name: v }))}
                placeholder="contoh: approve-rekrutmen"
                mono
              />
            )}
          </Field>

          <Field label="Label Permission" hint="Deskripsi izin akses yang mudah dipahami">
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={permForm.label}
                onChange={(v) => setPermForm((f) => ({ ...f, label: v }))}
                placeholder="contoh: Menyetujui Pengajuan Rekrutmen"
              />
            )}
          </Field>

          <Field label="Modul / Group" hint="Kategori modul (e.g. rekrutmen, employee, settings)">
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={permForm.group}
                onChange={(v) => setPermForm((f) => ({ ...f, group: v }))}
                placeholder="contoh: rekrutmen"
                mono
              />
            )}
          </Field>

          {/* Dialog Actions */}
          <Row gap={3} justify="end">
            <Button variant="quiet" onClick={closePermDialog}>
              Batal
            </Button>
            <Button loading={permLoading} onClick={submitPerm}>
              Buat Permission
            </Button>
          </Row>
        </Stack>
      </Dialog>
    </AppLayout>
  )
}
