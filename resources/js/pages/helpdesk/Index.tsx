import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Confirm } from '@/components/pouf/controls'
import { toast } from '@/components/pouf/toaster'
import HelpdeskChatBox, { type HelpdeskChatMessage } from '@/components/helpdesk/HelpdeskChatBox'
import { getEcho } from '@/lib/reverb'
import {
  IconExternalLink,
  IconInbox,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'

interface HelpdeskTicketAdminItem {
  id: number
  kode_tiket: string
  is_guest?: boolean
  is_open?: boolean
  reporter_name?: string | null
  reporter_email?: string | null
  reporter_phone?: string | null
  kategori: string
  judul: string
  deskripsi: string
  halaman_url?: string | null
  screenshot_url?: string | null
  status: 'menunggu' | 'diproses' | 'selesai' | 'ditutup' | string
  tanggapan_admin?: string | null
  handler_name?: string | null
  ditangani_at?: string | null
  messages_count?: number | null
  created_at?: string | null
  updated_at?: string | null
  user?: {
    id: number
    name: string
    email: string
    phone?: string | null
  } | null
}

interface StatsProps {
  total: number
  menunggu: number
  diproses: number
  selesai: number
}

interface Props {
  tickets: HelpdeskTicketAdminItem[]
  stats: StatsProps
  kategoriOptions: string[]
  liveChatSchedule?: {
    active: boolean
    schedule_label: string
    message: string
  }
  filters: {
    search: string
    status: string
    kategori: string
  }
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditutup', label: 'Ditutup' },
]

const UPDATE_STATUS_OPTIONS = [
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditutup', label: 'Ditutup' },
]

const STATUS_STYLE: Record<string, { label: string; dot: string; text: string }> = {
  menunggu: { label: 'Menunggu', dot: 'bg-amber-500', text: 'text-amber-700' },
  diproses: { label: 'Diproses', dot: 'bg-blue-500', text: 'text-blue-700' },
  selesai: { label: 'Selesai', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  ditutup: { label: 'Ditutup', dot: 'bg-zinc-400', text: 'text-zinc-600' },
}

function getXsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function computeStatsFromList(list: HelpdeskTicketAdminItem[]): StatsProps {
  let menunggu = 0
  let diproses = 0
  let selesai = 0

  list.forEach((t) => {
    if (t.status === 'menunggu') menunggu++
    else if (t.status === 'diproses') diproses++
    else if (t.status === 'selesai' || t.status === 'ditutup') selesai++
  })

  return {
    total: list.length,
    menunggu,
    diproses,
    selesai,
  }
}

export default function HelpdeskIndex({
  tickets: initialTickets = [],
  stats: initialStats,
  kategoriOptions = [],
  liveChatSchedule,
  filters: serverFilters,
}: Props) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props

  const [tickets, setTickets] = useState<HelpdeskTicketAdminItem[]>(initialTickets)
  const [liveStats, setLiveStats] = useState<StatsProps>(initialStats)

  const [search, setSearch] = useState(serverFilters?.search ?? '')
  const [statusFilter, setStatusFilter] = useState(serverFilters?.status || 'all')
  const [kategoriFilter, setKategoriFilter] = useState(serverFilters?.kategori || 'all')

  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicketAdminItem | null>(
    initialTickets[0] ?? null,
  )
  const [paneTab, setPaneTab] = useState<'chat' | 'detail'>('chat')
  const [chatMessages, setChatMessages] = useState<HelpdeskChatMessage[]>([])
  const [loadingChat, setLoadingChat] = useState(false)

  const [formStatus, setFormStatus] = useState(initialTickets[0]?.status || 'diproses')
  const [formTanggapan, setFormTanggapan] = useState(initialTickets[0]?.tanggapan_admin || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const selectedTicketRef = useRef<HelpdeskTicketAdminItem | null>(selectedTicket)
  useEffect(() => {
    selectedTicketRef.current = selectedTicket
  }, [selectedTicket])

  useEffect(() => {
    setTickets(initialTickets)
    if (initialTickets.length > 0 && !selectedTicketRef.current) {
      selectTicket(initialTickets[0])
    }
  }, [initialTickets])

  useEffect(() => {
    setLiveStats(initialStats)
  }, [initialStats])

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success)
    }
    if (flash?.error) {
      toast.error(flash.error)
    }
  }, [flash?.success, flash?.error])

  useEffect(() => {
    if (initialTickets[0]) {
      void loadAdminChat(initialTickets[0])
    }
  }, [])

  useEffect(() => {
    const echo = getEcho()
    if (!echo) return

    const channel = echo.private('helpdesk.admin')

    channel.listen(
      '.helpdesk.ticket.updated',
      (payload: { action?: string; ticket?: HelpdeskTicketAdminItem }) => {
        const ticket = payload?.ticket
        if (!ticket) return

        setTickets((prev) => {
          let next: HelpdeskTicketAdminItem[] = prev
          if (payload.action === 'deleted') {
            next = prev.filter((t) => t.id !== ticket.id)
          } else if (payload.action === 'created') {
            if (prev.some((t) => t.id === ticket.id)) {
              next = prev.map((t) => (t.id === ticket.id ? { ...t, ...ticket } : t))
            } else {
              next = [ticket, ...prev]
              toast.info(
                `Tiket baru ${ticket.kode_tiket} dari ${ticket.reporter_name || 'Pelapor'}: ${ticket.judul}`,
              )
            }
          } else {
            next = prev.map((t) => (t.id === ticket.id ? { ...t, ...ticket } : t))
          }

          if (!search && statusFilter === 'all' && kategoriFilter === 'all') {
            setLiveStats(computeStatsFromList(next))
          }
          return next
        })

        if (selectedTicketRef.current?.id === ticket.id) {
          if (payload.action === 'deleted') {
            setSelectedTicket(null)
          } else {
            setSelectedTicket((prev) => (prev ? { ...prev, ...ticket } : prev))
            if (ticket.status) setFormStatus(ticket.status)
          }
        }
      },
    )

    channel.listen(
      '.helpdesk.message.sent',
      (payload: {
        ticket_id?: number
        kode_tiket?: string
        ticket_status?: string
        message?: HelpdeskChatMessage
      }) => {
        const msg = payload?.message
        if (!msg) return

        setTickets((prev) =>
          prev.map((t) =>
            t.id === payload.ticket_id
              ? {
                  ...t,
                  status: payload.ticket_status || t.status,
                  messages_count: (t.messages_count ?? 0) + 1,
                }
              : t,
          ),
        )

        if (selectedTicketRef.current?.id === payload.ticket_id) {
          setChatMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
          if (payload.ticket_status) {
            setSelectedTicket((prev) =>
              prev ? { ...prev, status: payload.ticket_status! } : prev,
            )
            setFormStatus(payload.ticket_status)
          }
        } else if (msg.sender_type !== 'admin') {
          toast.info(
            `Pesan baru di ${payload.kode_tiket || 'Tiket'} (${msg.sender_name}): ${msg.message}`,
          )
        }
      },
    )

    return () => {
      echo.leave('helpdesk.admin')
    }
  }, [search, statusFilter, kategoriFilter])

  const applyFilters = (
    nextSearch = search,
    nextStatus = statusFilter,
    nextKategori = kategoriFilter,
  ) => {
    router.get(
      '/helpdesk',
      {
        search: nextSearch || undefined,
        status: nextStatus !== 'all' ? nextStatus : undefined,
        kategori: nextKategori !== 'all' ? nextKategori : undefined,
      },
      { preserveState: true, preserveScroll: true, replace: true },
    )
  }

  const loadAdminChat = async (ticket: HelpdeskTicketAdminItem) => {
    setLoadingChat(true)
    try {
      const res = await fetch(`/helpdesk/${ticket.id}/messages`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (!res.ok) return
      const data = await res.json()
      if (data?.ticket && selectedTicketRef.current?.id === ticket.id) {
        setSelectedTicket(data.ticket as HelpdeskTicketAdminItem)
      }
      setChatMessages(Array.isArray(data?.messages) ? (data.messages as HelpdeskChatMessage[]) : [])
    } catch {
      toast.error('Gagal memuat riwayat live chat.')
    } finally {
      setLoadingChat(false)
    }
  }

  const selectTicket = (ticket: HelpdeskTicketAdminItem) => {
    setSelectedTicket(ticket)
    setPaneTab('chat')
    setFormStatus(ticket.status || 'diproses')
    setFormTanggapan(ticket.tanggapan_admin || '')
    setChatMessages([])
    void loadAdminChat(ticket)
  }

  const handleSendAdminMessage = async (
    messageText: string,
    attachmentFile: File | null,
  ): Promise<boolean> => {
    if (!selectedTicket) return false

    try {
      const formData = new FormData()
      if (messageText) formData.append('message', messageText)
      if (attachmentFile) formData.append('attachment', attachmentFile)

      const res = await fetch(`/helpdesk/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        credentials: 'same-origin',
        body: formData,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.message || 'Gagal mengirim pesan.')
        return false
      }

      if (data?.message) {
        const msg = data.message as HelpdeskChatMessage
        setChatMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      }

      if (data?.ticket) {
        const updated = data.ticket as HelpdeskTicketAdminItem
        setSelectedTicket(updated)
        setFormStatus(updated.status)
        setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
      }

      return true
    } catch {
      toast.error('Terjadi gangguan koneksi saat mengirim balasan.')
      return false
    }
  }

  const handleUpdateSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || saving) return

    setSaving(true)
    router.put(
      `/helpdesk/${selectedTicket.id}`,
      {
        status: formStatus,
        tanggapan_admin: formTanggapan,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedTicket((prev) =>
            prev
              ? { ...prev, status: formStatus, tanggapan_admin: formTanggapan || null }
              : prev,
          )
        },
        onFinish: () => {
          setSaving(false)
        },
      },
    )
  }

  const handleDelete = (ticket: HelpdeskTicketAdminItem) => {
    if (deleting) return
    setDeleting(true)
    router.delete(`/helpdesk/${ticket.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        if (selectedTicketRef.current?.id === ticket.id) {
          setSelectedTicket(null)
        }
      },
      onFinish: () => {
        setDeleting(false)
      },
    })
  }

  return (
    <AdminLayout wide>
      <Head title="Helpdesk & Live Chat" />

      <div className="font-helpdesk-sans flex flex-col gap-3.5 w-full">
        {/* Smooth Biru Putih Workspace Header */}
        <div className="rounded-xl bg-white px-5 py-4 flex flex-col gap-3.5 shadow-[0_2px_10px_rgba(59,130,246,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-helpdesk-display text-xl font-bold tracking-tight text-[#1E3A5F]">
                Helpdesk
              </h1>

            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 [font-variant-numeric:tabular-nums]">
              <span>
                Total <strong className="text-zinc-900 font-semibold">{liveStats?.total ?? 0}</strong>
              </span>
              <span>
                Menunggu <strong className="text-amber-700 font-semibold">{liveStats?.menunggu ?? 0}</strong>
              </span>
              <span>
                Diproses <strong className="text-blue-700 font-semibold">{liveStats?.diproses ?? 0}</strong>
              </span>
              <span>
                Selesai <strong className="text-emerald-700 font-semibold">{liveStats?.selesai ?? 0}</strong>
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyFilters()
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2"
          >
            <div className="lg:col-span-6 relative">
              <IconSearch
                size={15}
                className="text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode tiket, nama pelapor, atau judul..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-sky-200/80 bg-white text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value
                  setStatusFilter(val)
                  applyFilters(search, val, kategoriFilter)
                }}
                aria-label="Filter Status"
                className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200/80 bg-white text-[13px] text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                value={kategoriFilter}
                onChange={(e) => {
                  const val = e.target.value
                  setKategoriFilter(val)
                  applyFilters(search, statusFilter, val)
                }}
                aria-label="Filter Kategori"
                className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200/80 bg-white text-[13px] text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                {kategoriOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1">
              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cari
              </button>
            </div>
          </form>
        </div>

        {/* Unified Two-Pane Inbox */}
        <div className="rounded-xl bg-white border border-sky-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:divide-x divide-sky-100 shadow-[0_2px_10px_rgba(59,130,246,0.04)]">
          {/* Ticket Queue */}
          <div className="lg:col-span-4 flex flex-col h-[420px] lg:h-[630px] border-b lg:border-b-0 border-sky-100">
            <div className="flex-1 min-h-0 overflow-y-auto helpdesk-scroll divide-y divide-sky-100/70">
              {tickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-2">
                  <IconInbox size={24} className="text-zinc-300" />
                  <p className="text-xs text-zinc-500">Belum ada tiket pengaduan.</p>
                </div>
              ) : (
                tickets.map((row) => {
                  const active = selectedTicket?.id === row.id
                  const st = STATUS_STYLE[row.status] ?? {
                    label: row.status,
                    dot: 'bg-zinc-400',
                    text: 'text-zinc-600',
                  }
                  const name = row.reporter_name || row.user?.name || 'Pelapor'

                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => selectTicket(row)}
                      className={`w-full text-left px-4 py-3.5 transition-colors flex flex-col gap-1 cursor-pointer border-l-2 ${
                        active
                          ? 'bg-[#EBF4FF] border-l-blue-500'
                          : 'bg-white hover:bg-[#F7FBFF] border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-zinc-400">
                          {row.kode_tiket}
                          {row.is_guest ? ' • Login' : ''}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>

                      <h3 className="font-helpdesk-display text-[13.5px] font-semibold text-zinc-900 truncate">
                        {row.judul}
                      </h3>

                      <div className="flex items-center justify-between gap-2 text-[11.5px] text-zinc-500">
                        <span className="truncate">{name}</span>
                        <span className="shrink-0 text-[11px] text-zinc-400 [font-variant-numeric:tabular-nums]">
                          {typeof row.messages_count === 'number' && row.messages_count > 0
                            ? `${row.messages_count} pesan`
                            : row.created_at || ''}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Active Ticket Conversation & Inspector */}
          <div className="lg:col-span-8 flex flex-col h-[580px] lg:h-[630px]">
            {!selectedTicket ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-2 bg-zinc-50/50">
                <IconMessageCircle size={24} className="text-zinc-300" />
                <p className="text-xs text-zinc-500">Pilih tiket di sebelah kiri untuk membuka chat.</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-3.5 border-b border-zinc-200 flex flex-wrap items-start justify-between gap-3 bg-white shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-mono">{selectedTicket.kode_tiket}</span>
                      <span>•</span>
                      <span>{selectedTicket.kategori}</span>
                    </div>
                    <h2 className="font-helpdesk-display text-[15px] font-semibold text-zinc-900 mt-0.5">
                      {selectedTicket.judul}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">
                      <span className="font-medium text-zinc-800">
                        {selectedTicket.reporter_name || selectedTicket.user?.name || 'Pelapor'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IconMail size={13} className="text-zinc-400" />
                        <span>{selectedTicket.reporter_email || selectedTicket.user?.email || '-'}</span>
                      </span>
                      {(selectedTicket.reporter_phone || selectedTicket.user?.phone) && (
                        <span className="inline-flex items-center gap-1">
                          <IconPhone size={13} className="text-zinc-400" />
                          <span>{selectedTicket.reporter_phone || selectedTicket.user?.phone}</span>
                        </span>
                      )}
                      {selectedTicket.halaman_url && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <IconMapPin size={13} className="text-zinc-400" />
                          <span>{selectedTicket.halaman_url}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="inline-flex p-0.5 rounded-lg bg-[#F1F7FE] border border-sky-200/70">
                      <button
                        type="button"
                        onClick={() => setPaneTab('chat')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          paneTab === 'chat'
                            ? 'bg-blue-500 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Live Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaneTab('detail')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          paneTab === 'detail'
                            ? 'bg-blue-500 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Detail & Status
                      </button>
                    </div>

                    <Confirm
                      title={`Hapus Tiket ${selectedTicket.kode_tiket}?`}
                      body="Tiket pengaduan error beserta riwayat chat dan lampiran gambar akan dihapus permanen."
                      confirmLabel="Hapus Tiket"
                      cancelLabel="Batal"
                      tone="pink"
                      loading={deleting}
                      onConfirm={() => handleDelete(selectedTicket)}
                    >
                      <button
                        type="button"
                        title={`Hapus ${selectedTicket.kode_tiket}`}
                        aria-label={`Hapus ${selectedTicket.kode_tiket}`}
                        className="w-8 h-8 rounded-lg border border-zinc-200 hover:border-rose-300 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <IconTrash size={15} />
                      </button>
                    </Confirm>
                  </div>
                </div>

                {paneTab === 'chat' ? (
                  <HelpdeskChatBox
                    messages={chatMessages}
                    loading={loadingChat}
                    isOpen={
                      selectedTicket.status === 'menunggu' || selectedTicket.status === 'diproses'
                    }
                    viewerRole="admin"
                    onSendMessage={handleSendAdminMessage}
                    onRefresh={() => void loadAdminChat(selectedTicket)}
                    heightClass="flex-1 min-h-0"
                    showStatusBar={true}
                  />
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto helpdesk-scroll p-5 bg-white flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium text-zinc-500">Deskripsi Kendala</span>
                      <p className="text-[13px] text-zinc-800 leading-relaxed whitespace-pre-line">
                        {selectedTicket.deskripsi}
                      </p>

                      {selectedTicket.screenshot_url && (
                        <div className="flex flex-col gap-2 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-500">Screenshot</span>
                            <a
                              href={selectedTicket.screenshot_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900"
                            >
                              <span>Buka penuh</span>
                              <IconExternalLink size={12} />
                            </a>
                          </div>
                          <div className="rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50">
                            <img
                              src={selectedTicket.screenshot_url}
                              alt={`Screenshot ${selectedTicket.kode_tiket}`}
                              className="w-full max-h-64 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <form
                      onSubmit={handleUpdateSubmit}
                      className="pt-4 border-t border-zinc-200 flex flex-col gap-3.5"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-700">Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-sky-200/80 bg-white text-[13px] text-slate-800 focus:border-blue-500 focus:outline-none"
                        >
                          {UPDATE_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-700">
                          Catatan Resolusi
                        </label>
                        <textarea
                          rows={3}
                          value={formTanggapan}
                          onChange={(e) => setFormTanggapan(e.target.value)}
                          placeholder="Tulis catatan resolusi atau solusi..."
                          className="w-full rounded-lg border border-sky-200/80 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none resize-y"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
                        >
                          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
