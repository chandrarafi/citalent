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
import { Dialog, Confirm, Select, Switch } from '@/components/pouf/controls'
import { Checkbox } from '@/components/pouf/checkbox'
import { Pagination } from '@/components/pouf/pagination'
import { Segmented } from '@/components/pouf/Segmented'
import type { Tone } from '@/components/pouf/tone'
import type { IconLike } from '@/components/pouf/Icon'

interface RoleOption {
  id: number
  name: string
  label: string
}

interface MenuItem {
  id: number
  name: string
  label: string
  url: string
  icon: string
  tone: string
  order: number
  is_active: boolean
  permission_name: string | null
  roles: string[]
}

interface Props {
  menus: MenuItem[]
  allRoles: RoleOption[]
}

const TONE_OPTIONS = [
  { value: 'purple', label: 'Purple (Ungu)' },
  { value: 'mint', label: 'Mint (Hijau)' },
  { value: 'blue', label: 'Blue (Biru)' },
  { value: 'pink', label: 'Pink (Merah Muda)' },
  { value: 'yellow', label: 'Yellow (Kuning)' },
  { value: 'orange', label: 'Orange (Jingga)' },
]

const ICON_OPTIONS = [
  { value: 'overview', label: 'Overview / Dashboard' },
  { value: 'users', label: 'Users / Pengguna' },
  { value: 'menu', label: 'Menu / Navigasi' },
  { value: 'settings', label: 'Settings / Pengaturan' },
  { value: 'chart', label: 'Chart / Laporan' },
  { value: 'lock', label: 'Lock / Keamanan' },
  { value: 'database', label: 'Database' },
  { value: 'calendar', label: 'Calendar / Jadwal' },
  { value: 'mail', label: 'Mail / Pesan' },
  { value: 'star', label: 'Star / Favorit' },
]

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
]

const emptyForm = () => ({
  name: '',
  label: '',
  url: '',
  icon: 'overview',
  tone: 'purple',
  order: '1',
  is_active: true,
  permission_name: '',
  roles: [] as string[],
})

export default function Menus({ menus, allRoles }: Props) {
  const { flash } = usePage<any>().props

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [pageSize, setPageSize] = useState('5')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [loading, setLoading] = useState(false)

  // Filtered & paginated menus
  const filteredMenus = useMemo(() => {
    return menus.filter((m) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        m.label.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.url.toLowerCase().includes(q) ||
        m.roles.some((r) => r.toLowerCase().includes(q))

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && m.is_active) ||
        (statusFilter === 'inactive' && !m.is_active)

      return matchSearch && matchStatus
    })
  }, [menus, search, statusFilter])

  const limit = parseInt(pageSize, 10) || 5
  const totalPages = Math.max(1, Math.ceil(filteredMenus.length / limit))
  
  const paginatedMenus = useMemo(() => {
    const start = (page - 1) * limit
    return filteredMenus.slice(start, start + limit)
  }, [filteredMenus, page, limit])

  const startIndex = filteredMenus.length === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, filteredMenus.length)

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm(),
      order: String((menus.length ? Math.max(...menus.map((m) => m.order)) : 0) + 1),
    })
    setDialogOpen(true)
  }

  function openEdit(menu: MenuItem) {
    setEditing(menu)
    setForm({
      name: menu.name,
      label: menu.label,
      url: menu.url,
      icon: menu.icon || 'overview',
      tone: menu.tone || 'purple',
      order: String(menu.order),
      is_active: Boolean(menu.is_active),
      permission_name: menu.permission_name ?? '',
      roles: [...menu.roles],
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
  }

  function toggleRole(roleName: string) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(roleName)
        ? f.roles.filter((r) => r !== roleName)
        : [...f.roles, roleName],
    }))
  }

  function toggleAllRoles() {
    if (form.roles.length === allRoles.length) {
      setForm((f) => ({ ...f, roles: [] }))
    } else {
      setForm((f) => ({ ...f, roles: allRoles.map((r) => r.name) }))
    }
  }

  function submit() {
    setLoading(true)
    const data = {
      ...form,
      order: parseInt(form.order, 10) || 0,
      permission_name: form.permission_name.trim() || null,
    }

    if (editing) {
      router.put(`/admin/menus/${editing.id}`, data, {
        onFinish: () => {
          setLoading(false)
          closeDialog()
        },
      })
    } else {
      router.post('/admin/menus', data, {
        onFinish: () => {
          setLoading(false)
          closeDialog()
        },
      })
    }
  }

  function destroy(menu: MenuItem) {
    router.delete(`/admin/menus/${menu.id}`)
  }

  const columns = [
    {
      key: 'order',
      header: '#',
      mono: true,
      render: (m: MenuItem) => <Text size="sm" mono num>{m.order}</Text>,
      sort: (a: MenuItem, b: MenuItem) => a.order - b.order,
    },
    {
      key: 'label',
      header: 'Menu & Icon',
      render: (m: MenuItem) => (
        <Row gap={3} wrap={false} align="center">
          <Blob
            icon={(m.icon || 'overview') as IconLike}
            tone={(m.tone || 'purple') as Tone}
            size="sm"
          />
          <Stack gap={1}>
            <Text>{m.label}</Text>
            <Text size="sm" mono muted>
              {m.name}
            </Text>
          </Stack>
        </Row>
      ),
      sort: (a: MenuItem, b: MenuItem) => a.label.localeCompare(b.label),
    },
    {
      key: 'url',
      header: 'URL Path',
      mono: true,
      minWidth: '140px',
      render: (m: MenuItem) => <Text size="sm" mono className="whitespace-nowrap">{m.url}</Text>,
      sort: (a: MenuItem, b: MenuItem) => a.url.localeCompare(b.url),
    },
    {
      key: 'roles',
      header: 'Role Akses',
      minWidth: '180px',
      render: (m: MenuItem) => {
        if (!m.roles || m.roles.length === 0) {
          return <Badge tone="blue" className="whitespace-nowrap">Semua Role</Badge>
        }
        return (
          <div className="flex flex-wrap gap-1.5 items-center">
            {m.roles.map((r) => (
              <Badge key={r} tone="purple" className="whitespace-nowrap">
                {r}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right' as const,
      minWidth: '120px',
      render: (m: MenuItem) => (
        <Row gap={2} justify="end" align="center" wrap={false} className="shrink-0 whitespace-nowrap">
          <Dot tone={m.is_active ? 'mint' : 'pink'} />
          <Badge tone={m.is_active ? 'mint' : 'pink'}>
            {m.is_active ? 'Aktif' : 'Non-aktif'}
          </Badge>
        </Row>
      ),
      sort: (a: MenuItem, b: MenuItem) => Number(b.is_active) - Number(a.is_active),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right' as const,
      minWidth: '140px',
      render: (m: MenuItem) => (
        <Row gap={2} justify="end" wrap={false} className="shrink-0 whitespace-nowrap">
          <Button size="sm" variant="quiet" onClick={() => openEdit(m)}>
            Edit
          </Button>
          <Confirm
            title={`Hapus Menu "${m.label}"?`}
            body="Menu ini akan dihapus dari navigasi sidebar untuk semua pengguna terkait."
            confirmLabel="Hapus Menu"
            cancelLabel="Batalkan"
            tone="orange"
            onConfirm={() => destroy(m)}
            details={
              <Card variant="tight">
                <Stack gap={1}>
                  <Text size="sm">
                    <strong>URL:</strong> {m.url}
                  </Text>
                  <Text size="sm">
                    <strong>Role Akses:</strong> {m.roles.length ? m.roles.join(', ') : 'Semua Role'}
                  </Text>
                </Stack>
              </Card>
            }
          >
            <Button size="sm" variant="quiet">
              Hapus
            </Button>
          </Confirm>
        </Row>
      ),
    },
  ]

  const activeCount = menus.filter((m) => m.is_active).length

  return (
    <AppLayout>
      <Head title="Manajemen Menu & Navigasi" />
      <Stack gap={5}>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1} className="flex-1 min-w-0">
            <Eyebrow>Sistem Navigasi</Eyebrow>
            <Heading level={1}>Manajemen Menu</Heading>
            <Text size="sm" muted>
              Atur menu navigasi, urutan posisi, warna tone, dan hak akses peran
            </Text>
          </Stack>
          <Button onClick={openCreate} className="w-full sm:w-auto shrink-0">+ Tambah Menu</Button>
        </div>

        {/* Top KPI Stats */}
        <Grid cols={3}>
          <Stat
            label="Total Menu"
            value={String(menus.length)}
            icon="menu"
            tone="purple"
          />
          <Stat
            label="Menu Aktif"
            value={`${activeCount} / ${menus.length}`}
            icon="ok"
            tone="mint"
          />
          <Stat
            label="Role Terdaftar"
            value={String(allRoles.length)}
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
            {/* Toolbar: Search + Filter Segmented + Page Size */}
            <Row justify="between" align="center">
              <div style={{ maxWidth: 360, width: '100%' }}>
                <Input
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setPage(1)
                  }}
                  placeholder="Cari label, url, atau role..."
                />
              </div>

              <Row gap={3} align="center">
                <Segmented
                  label="Status Filter"
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v as any)
                    setPage(1)
                  }}
                  options={[
                    { value: 'all', label: 'Semua' },
                    { value: 'active', label: 'Aktif' },
                    { value: 'inactive', label: 'Non-aktif' },
                  ]}
                />

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
              rows={paginatedMenus}
              columns={columns}
              getKey={(m) => String(m.id)}
            />

            {/* Pagination Controls */}
            <Row justify="between" align="center">
              <Text size="sm" muted>
                Menampilkan {startIndex}-{endIndex} dari {filteredMenus.length} menu (Halaman {page} dari {totalPages})
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

      {/* Modal Dialog Form for Create / Edit */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        size="lg"
        title={editing ? `Edit Menu: ${editing.label}` : 'Tambah Menu Baru'}
        description={
          editing
            ? 'Perbarui konfigurasi menu navigasi dan hak akses'
            : 'Buat entri menu baru untuk ditampilkan di sidebar'
        }
      >
        <Stack gap={5}>
          <Field label="Label Menu" hint="Nama yang akan tampil di sidebar">
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={form.label}
                onChange={(v) => setForm((f) => ({ ...f, label: v }))}
                placeholder="contoh: Data Karyawan"
              />
            )}
          </Field>

          <Grid cols={2} gap={3}>
            <Field label="Slug (Kode Unik)" hint="Identifier unik menu">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="contoh: employees"
                  mono
                />
              )}
            </Field>

            <Field label="URL Path" hint="Path route inertia">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={form.url}
                  onChange={(v) => setForm((f) => ({ ...f, url: v }))}
                  placeholder="contoh: /admin/employees"
                  mono
                />
              )}
            </Field>
          </Grid>

          <Grid cols={2} gap={3}>
            <Field label="Icon Menu" hint="Icon Tabler">
              {() => (
                <Select
                  value={form.icon}
                  onChange={(v) => setForm((f) => ({ ...f, icon: v }))}
                  options={ICON_OPTIONS}
                />
              )}
            </Field>

            <Field label="Warna Tone" hint="Warna aksen menu">
              {() => (
                <Select
                  value={form.tone}
                  onChange={(v) => setForm((f) => ({ ...f, tone: v }))}
                  options={TONE_OPTIONS}
                />
              )}
            </Field>
          </Grid>

          <Grid cols={2} gap={3}>
            <Field label="Urutan Posisi" hint="Angka urutan tampilan di sidebar">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  type="number"
                  value={form.order}
                  onChange={(v) => setForm((f) => ({ ...f, order: v }))}
                  placeholder="1"
                  mono
                />
              )}
            </Field>

            <Field label="Minimal Permission (Opsional)" hint="Permission yang dibutuhkan">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={form.permission_name}
                  onChange={(v) => setForm((f) => ({ ...f, permission_name: v }))}
                  placeholder="contoh: manage-roles"
                  mono
                />
              )}
            </Field>
          </Grid>

          {/* Switch Aktif */}
          <div className="flex items-center justify-between p-3 rounded-control bg-surface-alt">
            <Stack gap={1}>
              <Text size="sm"><strong>Status Menu Aktif</strong></Text>
              <Text size="sm" muted>Menu akan langsung terlihat di sidebar jika diaktifkan</Text>
            </Stack>
            <Switch
              checked={form.is_active}
              onChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              label="Status Aktif"
            />
          </div>

          {/* Roles Selector */}
          <Stack gap={3}>
            <Row justify="between" align="center">
              <Text size="sm" muted>
                Role yang Diizinkan (Kosongkan untuk semua role)
              </Text>
              <Button size="sm" variant="quiet" onClick={toggleAllRoles}>
                {form.roles.length === allRoles.length ? 'Kosongkan' : 'Pilih Semua'}
              </Button>
            </Row>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto p-1">
              {allRoles.map((role) => {
                const checked = form.roles.includes(role.name)
                return (
                  <label
                    key={role.name}
                    className="flex items-center gap-3 p-2.5 rounded-control cursor-pointer transition-all bg-surface-alt hover:bg-surface"
                    style={{
                      border: checked
                        ? '2px solid var(--purple)'
                        : '2px solid transparent',
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => toggleRole(role.name)}
                      hideLabel
                    />
                    <Stack gap={1}>
                      <Text size="sm">{role.label}</Text>
                      <Text size="sm" mono muted>
                        {role.name}
                      </Text>
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
              {editing ? 'Simpan Perubahan' : 'Buat Menu'}
            </Button>
          </Row>
        </Stack>
      </Dialog>
    </AppLayout>
  )
}
