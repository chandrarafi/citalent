import { useState } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Table, type TableColumn } from '@/components/pouf/table'
import { Badge, Blob } from '@/components/pouf/media'
import { Select, Dialog, Confirm } from '@/components/pouf/controls'
import { toast } from '@/components/pouf/toaster'
import type { Tone } from '@/components/pouf/tone'
import {
  IconCalendarEvent,
  IconClock,
  IconVideo,
  IconMapPin,
  IconUser,
  IconBell,
  IconCheck,
  IconTrash,
  IconEdit,
  IconPlus,
  IconSearch,
  IconExternalLink,
} from '@tabler/icons-react'

interface ScheduleItem {
  id: number
  pelamar_id: number
  lowongan_id: number
  kandidat_nama: string
  kandidat_email: string
  kandidat_phone: string
  kandidat_no_pendaftaran: string
  kandidat_foto: string
  posisi_nama: string
  kode_lowongan: string
  tahap: 'interview_hr' | 'interview_user' | 'interview_gm'
  tahap_label: string
  tanggal_interview: string
  tanggal_formatted: string
  jam_mulai: string
  jam_selesai?: string | null
  waktu_formatted: string
  tipe_interview: 'online' | 'offline'
  lokasi?: string | null
  link_meeting?: string | null
  pewawancara_nama?: string | null
  catatan_untuk_kandidat?: string | null
  status_kehadiran: 'scheduled' | 'attended' | 'not_attended' | 'rescheduled' | 'cancelled'
  reminder_sent_at?: string | null
  creator_name: string
  is_today: boolean
  is_past: boolean
}

interface LowonganOption {
  id: number
  kode_lowongan: string
  judul: string
  posisi_nama: string
  departement_nama: string
}

interface PelamarOption {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  email: string
  nomor_kontak: string
  lowongan_id: number
  posisi_dilamar: string
  status: string
  foto_url: string
}

interface StatsData {
  total_hari_ini: number
  total_mendatang: number
  total_hr: number
  total_user: number
  total_gm: number
}

interface Props {
  schedules: ScheduleItem[]
  stats: StatsData
  lowongans: LowonganOption[]
  eligiblePelamars: PelamarOption[]
  filters: {
    search?: string
    lowongan_id?: string
    tahap?: string
    tipe?: string
    status_kehadiran?: string
    date_filter?: string
  }
}

const TAHAP_TONE_MAP: Record<string, Tone> = {
  interview_hr: 'purple',
  interview_user: 'blue',
  interview_gm: 'orange',
}

const STATUS_KEHADIRAN_CONFIG: Record<
  string,
  { label: string; tone: Tone; colorClass: string }
> = {
  scheduled: {
    label: 'Dijadwalkan',
    tone: 'blue',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  attended: {
    label: 'Hadir / Selesai',
    tone: 'mint',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  not_attended: {
    label: 'Tidak Hadir',
    tone: 'pink',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  rescheduled: {
    label: 'Reschedule',
    tone: 'orange',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    tone: 'pink',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
}

export default function PenjadwalanInterviewIndex({
  schedules,
  stats,
  lowongans,
  filters,
}: Props) {
  // Search and Filter States
  const [search, setSearch] = useState(filters.search || '')
  const [selectedLowongan, setSelectedLowongan] = useState(filters.lowongan_id || '')
  const [selectedTahap, setSelectedTahap] = useState(filters.tahap || 'all')
  const [selectedStatus, setSelectedStatus] = useState(filters.status_kehadiran || 'all')
  const [selectedDateFilter, setSelectedDateFilter] = useState(filters.date_filter || 'all')

  // Status Change Dialog State
  const [statusDialogItem, setStatusDialogItem] = useState<ScheduleItem | null>(null)
  const [newStatusKehadiran, setNewStatusKehadiran] = useState<string>('scheduled')

  // Reminder Trigger State
  const [remindingId, setRemindingId] = useState<number | null>(null)

  // Apply filters via Inertia router
  const applyFilters = (overrides?: Record<string, string>) => {
    const params: Record<string, string> = {
      search,
      lowongan_id: selectedLowongan,
      tahap: selectedTahap,
      status_kehadiran: selectedStatus,
      date_filter: selectedDateFilter,
      ...overrides,
    }

    // Clean empty values
    Object.keys(params).forEach((key) => {
      if (!params[key] || params[key] === 'all') delete params[key]
    })

    router.get('/penjadwalan-interview', params, {
      preserveState: true,
      replace: true,
    })
  }

  // Send Reminder Action
  const handleSendReminder = (scheduleId: number) => {
    setRemindingId(scheduleId)
    router.post(
      `/penjadwalan-interview/${scheduleId}/send-reminder`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Email reminder interview berhasil dikirim ke kandidat!')
        },
        onError: () => {
          toast.error('Gagal mengirim email reminder.')
        },
        onFinish: () => setRemindingId(null),
      }
    )
  }

  // Update Status Kehadiran
  const handleUpdateStatusKehadiran = () => {
    if (!statusDialogItem) return

    router.put(
      `/penjadwalan-interview/${statusDialogItem.id}/status`,
      { status_kehadiran: newStatusKehadiran },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusDialogItem(null)
          toast.success('Status kehadiran interview berhasil diperbarui.')
        },
        onError: () => {
          toast.error('Gagal mengubah status kehadiran.')
        },
      }
    )
  }

  // Delete Schedule
  const handleDeleteSchedule = (scheduleId: number) => {
    router.delete(`/penjadwalan-interview/${scheduleId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Jadwal interview berhasil dihapus.')
      },
      onError: () => {
        toast.error('Gagal menghapus jadwal.')
      },
    })
  }

  // Define Table Columns
  const tableColumns: TableColumn<ScheduleItem>[] = [
    {
      key: 'kandidat',
      header: 'Kandidat & Posisi',
      render: (item) => (
        <div className="flex items-start gap-3 py-1">
          <img
            src={item.kandidat_foto}
            alt={item.kandidat_nama}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0 mt-0.5"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/assets/images/user.png'
            }}
          />
          <div className="min-w-0">
            <Link
              href={`/pelamar/${item.pelamar_id}`}
              className="font-bold text-sm text-slate-900 hover:text-blue-600 transition flex items-center gap-1.5 group"
            >
              <span className="truncate">{item.kandidat_nama}</span>
              <IconExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition shrink-0" />
            </Link>
            <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {item.posisi_nama}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="font-mono">{item.kandidat_no_pendaftaran}</span>
              <span>•</span>
              <span className="truncate max-w-[150px]">{item.kandidat_email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'tahap',
      header: 'Tahap Seleksi',
      render: (item) => {
        const tone = TAHAP_TONE_MAP[item.tahap] || 'purple'
        return (
          <div className="py-1">
            <Badge tone={tone}>
              {item.tahap_label}
            </Badge>
          </div>
        )
      },
    },
    {
      key: 'waktu',
      header: 'Waktu & Pelaksanaan',
      render: (item) => (
        <div className="py-1 min-w-[190px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
            <IconCalendarEvent size={14} className="text-blue-600 shrink-0" />
            <span>{item.tanggal_formatted}</span>
            {item.is_today && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                HARI INI
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
            <IconClock size={13} className="text-slate-400 shrink-0" />
            <span>{item.waktu_formatted}</span>
          </div>
          <div className="mt-1.5">
            {item.tipe_interview === 'online' ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <IconVideo size={12} />
                  Online Meeting
                </span>
                {item.link_meeting && (
                  <a
                    href={item.link_meeting}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                    title={item.link_meeting}
                  >
                    Buka Link
                    <IconExternalLink size={12} />
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-slate-600 truncate max-w-[220px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <IconMapPin size={12} />
                  Tatap Muka
                </span>
                <span className="truncate text-[11px] text-slate-500" title={item.lokasi || ''}>
                  {item.lokasi || 'Kantor Pusat'}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status_kehadiran',
      header: 'Status & Reminder',
      render: (item) => {
        const config = STATUS_KEHADIRAN_CONFIG[item.status_kehadiran] || STATUS_KEHADIRAN_CONFIG.scheduled
        return (
          <div className="py-1">
            <button
              onClick={() => {
                setStatusDialogItem(item)
                setNewStatusKehadiran(item.status_kehadiran)
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border hover:opacity-85 transition cursor-pointer ${config.colorClass}`}
              title="Klik untuk ubah status kehadiran"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {config.label}
              <IconEdit size={12} className="opacity-60 ml-0.5" />
            </button>

            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                tone="purple"
                className="text-[11px] h-7 px-2"
                onClick={() => handleSendReminder(item.id)}
                disabled={remindingId === item.id}
                title="Kirim email pengingat interview ke kandidat"
              >
                <IconBell size={13} className="mr-1" />
                {remindingId === item.id ? 'Mengirim...' : 'Kirim Reminder'}
              </Button>
            </div>
            {item.reminder_sent_at && (
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <IconCheck size={11} className="text-emerald-500" />
                <span>Diingatkan: {item.reminder_sent_at}</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-1.5 py-1">
          {/* Direct link to assessment form if relevant */}
          <Link
            href={
              item.tahap === 'interview_hr'
                ? `/penilaian-interview-hr/lowongan/${item.lowongan_id}`
                : item.tahap === 'interview_user'
                ? `/penilaian-interview-user/lowongan/${item.lowongan_id}`
                : `/penilaian-interview-gm/lowongan/${item.lowongan_id}`
            }
            title="Buka Form Penilaian Interview"
          >
            <Button
              size="sm"
              tone="mint"
              className="h-8 w-8 !min-h-0 !p-0 inline-flex items-center justify-center rounded-xl"
              title="Buka Form Penilaian"
            >
              <IconCheck size={16} stroke={2.5} className="text-emerald-950 shrink-0" />
            </Button>
          </Link>

          <Link href={`/penjadwalan-interview/${item.id}/edit`}>
            <Button
              size="sm"
              tone="blue"
              className="h-8 w-8 !min-h-0 !p-0 inline-flex items-center justify-center rounded-xl"
              title="Edit Jadwal di Halaman Baru"
            >
              <IconEdit size={16} stroke={2.2} className="text-blue-950 shrink-0" />
            </Button>
          </Link>

          <Confirm
            title="Hapus Jadwal Interview?"
            body={`Apakah Anda yakin ingin menghapus jadwal interview untuk ${item.kandidat_nama}?`}
            confirmLabel="Hapus Jadwal"
            cancelLabel="Batalkan"
            tone="pink"
            onConfirm={() => handleDeleteSchedule(item.id)}
          >
            <Button
              size="sm"
              tone="pink"
              className="h-8 w-8 !min-h-0 !p-0 inline-flex items-center justify-center rounded-xl"
              title="Hapus Jadwal"
            >
              <IconTrash size={16} stroke={2.2} className="text-rose-950 shrink-0" />
            </Button>
          </Confirm>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Penjadwalan Interview & Pengingat Kandidat" />

      <Stack gap={5} className="w-full pb-12">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Stack gap={1}>
            <div className="flex items-center gap-2">
              <Heading level={1} className="text-2xl font-bold tracking-tight text-slate-900">
                Penjadwalan Interview
              </Heading>
            </div>
            <Text muted size="sm">
              Kelola jadwal interview HR, User, dan GM, serta kirim pengingat otomatis ke email kandidat.
            </Text>
          </Stack>

          <div className="flex items-center">
            <Link href="/penjadwalan-interview/create">
              <Button
                tone="purple"
                className="shadow-xs font-semibold flex items-center gap-1.5"
              >
                <IconPlus size={18} />
                Tambah Jadwal Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50/70 to-white border-blue-100/80 shadow-xs">
            <div className="flex items-center justify-between">
              <Text size="sm" muted className="font-semibold text-slate-600">
                Jadwal Hari Ini
              </Text>
              <Blob icon="calendar" tone="blue" size="sm" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-700 tracking-tight">
                {stats.total_hari_ini}
              </span>
              <span className="text-xs text-slate-500 font-medium">kandidat</span>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-50/70 to-white border-emerald-100/80 shadow-xs">
            <div className="flex items-center justify-between">
              <Text size="sm" muted className="font-semibold text-slate-600">
                Jadwal Mendatang
              </Text>
              <Blob icon="clock" tone="mint" size="sm" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                {stats.total_mendatang}
              </span>
              <span className="text-xs text-slate-500 font-medium">sesi</span>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50/70 to-white border-purple-100/80 shadow-xs">
            <div className="flex items-center justify-between">
              <Text size="sm" muted className="font-semibold text-slate-600">
                Interview HR
              </Text>
              <Badge tone="purple">Tahap 1</Badge>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-700 tracking-tight">
                {stats.total_hr}
              </span>
              <span className="text-xs text-slate-500 font-medium">total</span>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-cyan-50/70 to-white border-cyan-100/80 shadow-xs">
            <div className="flex items-center justify-between">
              <Text size="sm" muted className="font-semibold text-slate-600">
                Interview User
              </Text>
              <Badge tone="blue">Tahap 2</Badge>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-700 tracking-tight">
                {stats.total_user}
              </span>
              <span className="text-xs text-slate-500 font-medium">total</span>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-50/70 to-white border-amber-100/80 shadow-xs">
            <div className="flex items-center justify-between">
              <Text size="sm" muted className="font-semibold text-slate-600">
                Interview GM
              </Text>
              <Badge tone="orange">Tahap 3</Badge>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700 tracking-tight">
                {stats.total_gm}
              </span>
              <span className="text-xs text-slate-500 font-medium">total</span>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 border-slate-200/90 shadow-xs bg-white">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[240px] relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch size={16} />
              </div>
              <input
                type="text"
                placeholder="Cari kandidat, no pendaftaran, posisi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters()
                }}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
              />
            </div>

            {/* Quick Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Lowongan */}
              <div className="w-48">
                <Select
                  value={selectedLowongan}
                  onChange={(val) => {
                    setSelectedLowongan(val)
                    applyFilters({ lowongan_id: val })
                  }}
                  options={[
                    { value: '', label: 'Semua Lowongan' },
                    ...lowongans.map((l) => ({
                      value: String(l.id),
                      label: `${l.kode_lowongan} - ${l.judul}`,
                    })),
                  ]}
                />
              </div>

              {/* Filter Tahap */}
              <div className="w-40">
                <Select
                  value={selectedTahap}
                  onChange={(val) => {
                    setSelectedTahap(val)
                    applyFilters({ tahap: val })
                  }}
                  options={[
                    { value: 'all', label: 'Semua Tahap' },
                    { value: 'interview_hr', label: 'Interview HR' },
                    { value: 'interview_user', label: 'Interview User' },
                    { value: 'interview_gm', label: 'Interview GM' },
                  ]}
                />
              </div>

              {/* Filter Status Kehadiran */}
              <div className="w-36">
                <Select
                  value={selectedStatus}
                  onChange={(val) => {
                    setSelectedStatus(val)
                    applyFilters({ status_kehadiran: val })
                  }}
                  options={[
                    { value: 'all', label: 'Status: Semua' },
                    { value: 'scheduled', label: 'Dijadwalkan' },
                    { value: 'attended', label: 'Hadir' },
                    { value: 'not_attended', label: 'Tidak Hadir' },
                    { value: 'rescheduled', label: 'Reschedule' },
                    { value: 'cancelled', label: 'Dibatalkan' },
                  ]}
                />
              </div>

              {/* Filter Waktu */}
              <div className="w-32">
                <Select
                  value={selectedDateFilter}
                  onChange={(val) => {
                    setSelectedDateFilter(val)
                    applyFilters({ date_filter: val })
                  }}
                  options={[
                    { value: 'all', label: 'Waktu: Semua' },
                    { value: 'today', label: 'Hari Ini' },
                    { value: 'upcoming', label: 'Mendatang' },
                    { value: 'past', label: 'Selesai / Lalu' },
                  ]}
                />
              </div>

              <Button
                tone="purple"
                className="px-3 text-xs"
                onClick={() => applyFilters()}
              >
                Terapkan
              </Button>
            </div>
          </div>
        </Card>

        {/* Schedule Table */}
        <Card className="border-slate-200/90 shadow-xs overflow-hidden">
          {schedules.length > 0 ? (
            <Table
              rows={schedules}
              columns={tableColumns}
              getKey={(item) => String(item.id)}
            />
          ) : (
            <div className="py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-3">
                <IconCalendarEvent size={28} />
              </div>
              <Heading level={3} className="text-base font-bold text-slate-800">
                Belum ada jadwal interview
              </Heading>
              <Text size="sm" muted className="mt-1 max-w-md mx-auto">
                Silakan buat jadwal wawancara untuk kandidat yang lolos screening CV atau skill test.
              </Text>
              <Link href="/penjadwalan-interview/create">
                <Button
                  tone="purple"
                  size="sm"
                  className="mt-4"
                >
                  <IconPlus size={16} className="mr-1.5" />
                  Jadwalkan Interview Sekarang
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </Stack>

      {/* Modal Dialog: Update Status Kehadiran */}
      <Dialog
        open={Boolean(statusDialogItem)}
        onOpenChange={(open) => {
          if (!open) setStatusDialogItem(null)
        }}
        title="Ubah Status Kehadiran Interview"
        size="md"
      >
        <div className="space-y-4 pt-1">
          <div className="text-xs text-slate-600">
            Kandidat: <b className="text-slate-900">{statusDialogItem?.kandidat_nama}</b> ({statusDialogItem?.tahap_label})
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Pilih Status Kehadiran:</label>
            <Select
              value={newStatusKehadiran}
              onChange={(val) => setNewStatusKehadiran(val)}
              options={[
                { value: 'scheduled', label: 'Dijadwalkan (Belum Mulai)' },
                { value: 'attended', label: 'Hadir / Selesai Wawancara' },
                { value: 'not_attended', label: 'Tidak Hadir (No Show)' },
                { value: 'rescheduled', label: 'Perlu Reschedule (Jadwal Ulang)' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ]}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              
              size="sm"
              onClick={() => setStatusDialogItem(null)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              tone="purple"
              onClick={handleUpdateStatusKehadiran}
            >
              Simpan Status
            </Button>
          </div>
        </div>
      </Dialog>
    </AppLayout>
  )
}
