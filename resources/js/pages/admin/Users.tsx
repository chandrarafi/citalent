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
import { Pagination } from '@/components/pouf/pagination'
import type { Tone } from '@/components/pouf/tone'

interface RoleOption {
  id: number
  name: string
  label: string
}

interface UserItem {
  id: number
  name: string
  email: string
  role_id: number | null
  role?: RoleOption | null
  created_at?: string | null
}

interface Props {
  users: UserItem[]
  roles: RoleOption[]
}

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
]

const ROLE_TONE: Record<string, Tone> = {
  'super-admin': 'purple',
  'hr-manager': 'mint',
  'employee': 'blue',
}

const emptyForm = () => ({
  name: '',
  email: '',
  password: '',
  role_id: '',
})

export default function Users({ users, roles }: Props) {
  const { auth, flash, errors: pageErrors } = usePage<any>().props

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [pageSize, setPageSize] = useState('5')
  const [page, setPage] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserItem | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Filtered & paginated users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role?.label && u.role.label.toLowerCase().includes(q)) ||
        (u.role?.name && u.role.name.toLowerCase().includes(q))

      const matchRole =
        roleFilter === 'all' ||
        String(u.role_id) === String(roleFilter) ||
        u.role?.name === roleFilter

      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  const limit = parseInt(pageSize, 10) || 5
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / limit))

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit
    return filteredUsers.slice(start, start + limit)
  }, [filteredUsers, page, limit])

  const startIndex = filteredUsers.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredUsers.length)

  // Top stats calculations
  const stats = useMemo(() => {
    const total = users.length
    const superAdminCount = users.filter((u) => u.role?.name === 'super-admin').length
    const rolesCount = roles.length
    return { total, superAdminCount, rolesCount }
  }, [users, roles])

  function openCreate() {
    setEditing(null)
    setForm({
      name: '',
      email: '',
      password: '',
      role_id: roles.length > 0 ? String(roles[0].id) : '',
    })
    setErrors({})
    setDialogOpen(true)
  }

  function openEdit(user: UserItem) {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id ? String(user.role_id) : (roles[0] ? String(roles[0].id) : ''),
    })
    setErrors({})
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
  }

  function submit() {
    setLoading(true)
    setErrors({})

    const payload: Record<string, any> = {
      name: form.name,
      email: form.email,
      role_id: parseInt(form.role_id, 10),
    }

    if (form.password) {
      payload.password = form.password
    }

    if (editing) {
      router.put(`/admin/users/${editing.id}`, payload, {
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
      router.post('/admin/users', payload, {
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

  function destroy(user: UserItem) {
    router.delete(`/admin/users/${user.id}`)
  }

  const columns = [
    {
      key: 'user',
      header: 'Pengguna',
      minWidth: '220px',
      render: (u: UserItem) => (
        <Row gap={3} wrap={false} align="center" className="min-w-[190px]">
          <Blob
            icon={u.role?.name === 'super-admin' ? 'star' : 'user'}
            tone={ROLE_TONE[u.role?.name ?? ''] || 'blue'}
            size="sm"
            className="shrink-0"
          />
          <Stack gap={1} className="min-w-0">
            <Text className="whitespace-nowrap">
              <strong>{u.name}</strong>
            </Text>
            <Text size="sm" muted mono className="whitespace-nowrap">
              {u.email}
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a: UserItem, b: UserItem) => a.name.localeCompare(b.name),
    },
    {
      key: 'role',
      header: 'Peran (Role)',
      minWidth: '150px',
      render: (u: UserItem) => (
        <Badge tone={ROLE_TONE[u.role?.name ?? ''] || 'purple'} className="whitespace-nowrap">
          {u.role?.label ?? 'Tanpa Role'}
        </Badge>
      ),
      sort: (a: UserItem, b: UserItem) =>
        (a.role?.label ?? '').localeCompare(b.role?.label ?? ''),
    },
    {
      key: 'created_at',
      header: 'Terdaftar',
      mono: true,
      minWidth: '130px',
      render: (u: UserItem) => (
        <Text size="sm" muted mono className="whitespace-nowrap">
          {u.created_at ?? '—'}
        </Text>
      ),
      sort: (a: UserItem, b: UserItem) =>
        (a.created_at ?? '').localeCompare(b.created_at ?? ''),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right' as const,
      minWidth: '140px',
      render: (u: UserItem) => {
        const isSelf = auth?.user?.id === u.id
        return (
          <Row gap={2} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
            <Button size="sm" variant="quiet" onClick={() => openEdit(u)}>
              Edit
            </Button>
            {!isSelf && (
              <Confirm
                title={`Hapus Pengguna "${u.name}"?`}
                body="Akun pengguna ini akan dihapus permanen. Pengguna tidak akan dapat login kembali."
                confirmLabel="Hapus Akun"
                cancelLabel="Batalkan"
                tone="orange"
                onConfirm={() => destroy(u)}
                details={
                  <Card variant="tight">
                    <Stack gap={1}>
                      <Text size="sm">
                        <strong>Email:</strong> {u.email}
                      </Text>
                      <Text size="sm">
                        <strong>Role:</strong> {u.role?.label ?? 'Tanpa Role'}
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
      <Head title="Manajemen Pengguna" />
      <Stack gap={5}>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1} className="flex-1 min-w-0">
            <Eyebrow>Sistem Pengguna</Eyebrow>
            <Heading level={1}>Manajemen Pengguna</Heading>
            <Text size="sm" muted>
              Kelola akun pengguna, penetapan peran (role), dan kredensial login ke sistem
            </Text>
          </Stack>
          <Button onClick={openCreate} className="w-full sm:w-auto shrink-0">+ Tambah Pengguna</Button>
        </div>

        {/* Top KPI Stats */}
        <Grid cols={3}>
          <Stat
            label="Total Pengguna"
            value={String(stats.total)}
            icon="users"
            tone="purple"
          />
          <Stat
            label="Super Admin"
            value={`${stats.superAdminCount} Akun`}
            icon="star"
            tone="mint"
          />
          <Stat
            label="Pilihan Role"
            value={`${stats.rolesCount} Role`}
            icon="lock"
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
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full">
              <div className="w-full sm:max-w-[360px]">
                <Input
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setPage(1)
                  }}
                  placeholder="Cari nama, email, atau peran..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[180px]">
                  <Select
                    value={roleFilter}
                    onChange={(v) => {
                      setRoleFilter(v)
                      setPage(1)
                    }}
                    options={[
                      { value: 'all', label: 'Semua Peran' },
                      ...roles.map((r) => ({ value: String(r.id), label: r.label })),
                    ]}
                  />
                </div>

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
              rows={paginatedUsers}
              columns={columns}
              getKey={(u) => String(u.id)}
            />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
              <Text size="sm" muted className="text-center sm:text-left">
                Menampilkan {startIndex}-{endIndex} dari {filteredUsers.length} pengguna (Halaman {page} dari {totalPages})
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

      {/* Modal Dialog Form for Create / Edit */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        size="md"
        title={editing ? `Edit Pengguna: ${editing.name}` : 'Tambah Pengguna Baru'}
        description={
          editing
            ? 'Perbarui informasi profil pengguna dan peran hak akses'
            : 'Buat akun pengguna baru dan tentukan peran akses ke sistem'
        }
      >
        <Stack gap={4}>
          <Field label="Nama Lengkap" error={errors.name || pageErrors?.name}>
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="contoh: Budi Pratama"
              />
            )}
          </Field>

          <Field label="Alamat Email" error={errors.email || pageErrors?.email}>
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="contoh: budi@citalent.com"
                mono
              />
            )}
          </Field>

          <Field
            label={editing ? 'Password Baru (Opsional)' : 'Password'}
            error={errors.password || pageErrors?.password}
            hint={editing ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
          >
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="password"
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                placeholder="••••••••"
              />
            )}
          </Field>

          <Field label="Peran (Role)" error={errors.role_id || pageErrors?.role_id}>
            {() => (
              <Select
                value={form.role_id}
                onChange={(v) => setForm((f) => ({ ...f, role_id: v }))}
                options={roles.map((r) => ({
                  value: String(r.id),
                  label: r.label,
                }))}
              />
            )}
          </Field>

          {/* Dialog Actions */}
          <Row gap={3} justify="end">
            <Button variant="quiet" onClick={closeDialog}>
              Batal
            </Button>
            <Button loading={loading} onClick={submit}>
              {editing ? 'Simpan Perubahan' : 'Buat Pengguna'}
            </Button>
          </Row>
        </Stack>
      </Dialog>
    </AppLayout>
  )
}
