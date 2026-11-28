import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import lottie from 'lottie-web'
import { toast } from '@/components/pouf/toaster'
import HelpdeskChatBox, { type HelpdeskChatMessage } from '@/components/helpdesk/HelpdeskChatBox'
import { getEcho } from '@/lib/reverb'
import {
  IconArrowLeft,
  IconChevronRight,
  IconClock,
  IconExternalLink,
  IconPaperclip,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'

export interface HelpdeskTicketItem {
  id: number
  kode_tiket: string
  is_guest?: boolean
  is_open?: boolean
  guest_channel?: string | null
  chat_token?: string | null
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
}

interface CandidateHelpdeskWidgetProps {
  currentPath: string
  hidden?: boolean
  isGuest?: boolean
  defaultEmail?: string
  hasBottomNav?: boolean
}

const GUEST_STORAGE_KEY = 'citalent_guest_helpdesk_tickets_v2'

const KATEGORI_LIST = [
  'Kendala Akun & Login',
  'Error Halaman / Bug',
  'Gagal Upload Dokumen',
  'Masalah Formulir Lamaran',
  'Tampilan / Responsif',
  'Lainnya',
]

const STATUS_LABEL: Record<string, { label: string; dot: string; text: string }> = {
  menunggu: { label: 'Menunggu', dot: 'bg-amber-500', text: 'text-amber-700' },
  diproses: { label: 'Diproses', dot: 'bg-blue-500', text: 'text-blue-700' },
  selesai: { label: 'Selesai', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  ditutup: { label: 'Ditutup', dot: 'bg-zinc-400', text: 'text-zinc-600' },
}

let cachedWumpusData: unknown | null = null
let wumpusDataPromise: Promise<unknown | null> | null = null

function loadWumpusAnimationData(): Promise<unknown | null> {
  if (cachedWumpusData) {
    return Promise.resolve(cachedWumpusData)
  }
  if (!wumpusDataPromise) {
    wumpusDataPromise = fetch('/assets/animations/head_wumpus.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        cachedWumpusData = data
        return data
      })
      .catch(() => null)
  }
  return wumpusDataPromise
}

function getXsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function readGuestTicketsFromSession(): HelpdeskTicketItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(GUEST_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as HelpdeskTicketItem[]) : []
  } catch {
    return []
  }
}

function writeGuestTicketsToSession(list: HelpdeskTicketItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(list.slice(0, 10)))
  } catch {
    // Ignore storage quota errors
  }
}

function isTicketOpenStatus(status?: string): boolean {
  return status === 'menunggu' || status === 'diproses'
}

interface LiveChatSchedule {
  active: boolean
  schedule_label: string
  message: string
}

function getLocalWibLiveChatSchedule(): LiveChatSchedule {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date())

    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? ''
    const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '0'
    const hour = Number(hourStr) % 24

    const isOperationalDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(weekday)
    const isOperationalHour = hour >= 8 && hour < 17
    const active = isOperationalDay && isOperationalHour

    return {
      active,
      schedule_label: 'Senin – Sabtu, 08:00 – 17:00 WIB',
      message: active
        ? 'Live Chat aktif (Senin – Sabtu, 08:00 – 17:00 WIB).'
        : 'Live Chat aktif hari Senin – Sabtu pukul 08:00 – 17:00 WIB. Tiket Anda tetap tersimpan dan akan dibalas pada jam operasional.',
    }
  } catch {
    return {
      active: true,
      schedule_label: 'Senin – Sabtu, 08:00 – 17:00 WIB',
      message: 'Live Chat aktif (Senin – Sabtu, 08:00 – 17:00 WIB).',
    }
  }
}

function appendUniqueMessage(
  prev: HelpdeskChatMessage[],
  incoming: HelpdeskChatMessage,
): HelpdeskChatMessage[] {
  if (prev.some((m) => m.id === incoming.id)) {
    return prev
  }
  return [...prev, incoming]
}

function WumpusLottie({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let anim: ReturnType<typeof lottie.loadAnimation> | null = null
    let cancelled = false

    const init = async () => {
      const data = await loadWumpusAnimationData()
      if (cancelled || !containerRef.current) return

      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        ...(data ? { animationData: data } : { path: '/assets/animations/head_wumpus.json' }),
      })
    }

    void init()

    return () => {
      cancelled = true
      if (anim) {
        anim.destroy()
      }
    }
  }, [])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}

const INPUT_CLASS =
  'w-full rounded-lg border border-sky-200/80 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all'

export default function CandidateHelpdeskWidget({
  currentPath,
  hidden = false,
  isGuest = false,
  defaultEmail = '',
  hasBottomNav = true,
}: CandidateHelpdeskWidgetProps) {
  const defaultKategori = isGuest ? 'Kendala Akun & Login' : 'Error Halaman / Bug'

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'lapor' | 'riwayat'>('lapor')
  const [tickets, setTickets] = useState<HelpdeskTicketItem[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [liveChatSchedule, setLiveChatSchedule] = useState<LiveChatSchedule>(() =>
    getLocalWibLiveChatSchedule(),
  )
  const [replyBubble, setReplyBubble] = useState<{
    ticketId: number
    kodeTiket: string
    senderName: string
    message: string
  } | null>(null)

  const [chatTicket, setChatTicket] = useState<HelpdeskTicketItem | null>(null)
  const [chatMessages, setChatMessages] = useState<HelpdeskChatMessage[]>([])
  const [loadingChat, setLoadingChat] = useState(false)

  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState(defaultEmail)
  const [reporterPhone, setReporterPhone] = useState('')

  const [kategori, setKategori] = useState<string>(defaultKategori)
  const [judul, setJudul] = useState('')
  const [halamanUrl, setHalamanUrl] = useState(currentPath || '/')
  const [deskripsi, setDeskripsi] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openRef = useRef(open)
  const chatTicketRef = useRef<HelpdeskTicketItem | null>(chatTicket)
  useEffect(() => {
    openRef.current = open
  }, [open])
  useEffect(() => {
    chatTicketRef.current = chatTicket
  }, [chatTicket])

  const activeCount = tickets.filter((t) => isTicketOpenStatus(t.status)).length
  const totalBadge = unreadChatCount > 0 ? unreadChatCount : activeCount

  const fetchTickets = async (silent = false) => {
    if (isGuest) {
      const guestTickets = readGuestTicketsFromSession()
      setTickets(guestTickets)
      return
    }

    if (!silent) setLoadingTickets(true)
    try {
      const res = await fetch('/kandidat/helpdesk', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (!res.ok) return
      const payload = await res.json()
      if (payload?.live_chat_schedule) {
        setLiveChatSchedule(payload.live_chat_schedule as LiveChatSchedule)
      }
      const list: HelpdeskTicketItem[] = Array.isArray(payload?.tickets) ? payload.tickets : []
      setTickets(list)
    } catch {
      // Silent background error
    } finally {
      if (!silent) setLoadingTickets(false)
    }
  }

  const loadTicketChat = async (ticket: HelpdeskTicketItem) => {
    setChatTicket(ticket)
    setLoadingChat(true)
    setUnreadChatCount(0)
    if (replyBubble?.ticketId === ticket.id) {
      setReplyBubble(null)
    }

    try {
      const url = isGuest
        ? `/helpdesk/lapor/${encodeURIComponent(ticket.kode_tiket)}/messages`
        : `/kandidat/helpdesk/${ticket.id}/messages`

      const headers: Record<string, string> = { Accept: 'application/json' }
      if (isGuest && ticket.chat_token) {
        headers['X-Chat-Token'] = ticket.chat_token
      }

      const res = await fetch(url, {
        headers,
        credentials: 'same-origin',
      })
      if (!res.ok) {
        toast.error('Gagal memuat percakapan tiket.')
        return
      }
      const data = await res.json()
      if (data?.live_chat_schedule) {
        setLiveChatSchedule(data.live_chat_schedule as LiveChatSchedule)
      }
      if (data?.ticket) {
        const refreshed = {
          ...(data.ticket as HelpdeskTicketItem),
          chat_token: ticket.chat_token ?? (data.ticket as HelpdeskTicketItem).chat_token,
        }
        setChatTicket(refreshed)
        setTickets((prev) => {
          const next = prev.map((t) => (t.id === refreshed.id ? { ...t, ...refreshed } : t))
          if (isGuest) writeGuestTicketsToSession(next)
          return next
        })
      }
      setChatMessages(Array.isArray(data?.messages) ? (data.messages as HelpdeskChatMessage[]) : [])
    } catch {
      toast.error('Koneksi bermasalah saat memuat percakapan.')
    } finally {
      setLoadingChat(false)
    }
  }

  useEffect(() => {
    void loadWumpusAnimationData()
    void fetchTickets(true)
  }, [isGuest])

  useEffect(() => {
    const syncSchedule = () => setLiveChatSchedule(getLocalWibLiveChatSchedule())
    syncSchedule()
    const timer = setInterval(syncSchedule, 30_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isGuest && defaultEmail && !reporterEmail) {
      setReporterEmail(defaultEmail)
    }
  }, [isGuest, defaultEmail])

  useEffect(() => {
    if (open) {
      setUnreadChatCount(0)
      setHalamanUrl(currentPath || window.location.pathname)
      if (isGuest && defaultEmail && !reporterEmail) {
        setReporterEmail(defaultEmail)
      }
      void fetchTickets(false)
    }
  }, [open, currentPath, isGuest, defaultEmail])

  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview)
      }
    }
  }, [screenshotPreview])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const subscriptionKey = tickets
    .map((t) => (isGuest ? `${t.id}:${t.guest_channel || ''}` : String(t.id)))
    .join(',')

  useEffect(() => {
    const echo = getEcho()
    if (!echo || tickets.length === 0) return

    const subscribedChannels: string[] = []

    const handleIncomingMessage = (payload: {
      ticket_id?: number
      kode_tiket?: string
      ticket_status?: string
      message?: HelpdeskChatMessage
    }) => {
      const msg = payload?.message
      if (!msg) return

      setTickets((prev) => {
        const next = prev.map((t) =>
          t.id === payload.ticket_id
            ? {
                ...t,
                status: payload.ticket_status || t.status,
                messages_count: (t.messages_count ?? 0) + 1,
              }
            : t,
        )
        if (isGuest) writeGuestTicketsToSession(next)
        return next
      })

      if (chatTicketRef.current && chatTicketRef.current.id === payload.ticket_id) {
        setChatMessages((prev) => appendUniqueMessage(prev, msg))
        if (payload.ticket_status) {
          setChatTicket((prev) => (prev ? { ...prev, status: payload.ticket_status! } : prev))
        }
      }

      if (msg.sender_type === 'admin') {
        const watchingCurrent =
          openRef.current && chatTicketRef.current?.id === payload.ticket_id
        if (!watchingCurrent && payload.ticket_id) {
          setUnreadChatCount((prev) => prev + 1)
          setReplyBubble({
            ticketId: payload.ticket_id,
            kodeTiket: payload.kode_tiket || '',
            senderName: msg.sender_name || 'Helpdesk',
            message: msg.message,
          })
        }
      }
    }

    const handleTicketUpdated = (payload: {
      action?: string
      ticket?: HelpdeskTicketItem
    }) => {
      const updated = payload?.ticket
      if (!updated) return

      if (payload.action === 'deleted') {
        setTickets((prev) => {
          const next = prev.filter((t) => t.id !== updated.id)
          if (isGuest) writeGuestTicketsToSession(next)
          return next
        })
        if (chatTicketRef.current?.id === updated.id) {
          setChatTicket(null)
        }
        return
      }

      setTickets((prev) => {
        const next = prev.map((t) =>
          t.id === updated.id ? { ...t, ...updated, chat_token: t.chat_token } : t,
        )
        if (isGuest) writeGuestTicketsToSession(next)
        return next
      })

      if (chatTicketRef.current?.id === updated.id) {
        setChatTicket((prev) => (prev ? { ...prev, ...updated, chat_token: prev.chat_token } : prev))
      }
    }

    tickets.forEach((ticket) => {
      if (isGuest) {
        if (!ticket.guest_channel) return
        const channelName = `helpdesk.guest.${ticket.guest_channel}`
        if (subscribedChannels.includes(channelName)) return
        subscribedChannels.push(channelName)
        echo
          .channel(channelName)
          .listen('.helpdesk.message.sent', handleIncomingMessage)
          .listen('.helpdesk.ticket.updated', handleTicketUpdated)
      } else {
        const channelName = `helpdesk.ticket.${ticket.id}`
        if (subscribedChannels.includes(channelName)) return
        subscribedChannels.push(channelName)
        echo
          .private(channelName)
          .listen('.helpdesk.message.sent', handleIncomingMessage)
          .listen('.helpdesk.ticket.updated', handleTicketUpdated)
      }
    })

    return () => {
      subscribedChannels.forEach((name) => {
        echo.leave(name)
      })
    }
  }, [subscriptionKey, isGuest])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview)
    }

    setScreenshotFile(file)
    setScreenshotPreview(URL.createObjectURL(file))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.screenshot
      return next
    })
  }

  const clearScreenshot = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview)
    }
    setScreenshotFile(null)
    setScreenshotPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetForm = () => {
    setKategori(defaultKategori)
    setJudul('')
    setDeskripsi('')
    setHalamanUrl(currentPath || window.location.pathname)
    clearScreenshot()
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setErrors({})

    try {
      const formData = new FormData()
      if (isGuest) {
        formData.append('reporter_name', reporterName)
        formData.append('reporter_email', reporterEmail)
        if (reporterPhone.trim()) {
          formData.append('reporter_phone', reporterPhone)
        }
      }
      formData.append('kategori', kategori)
      formData.append('judul', judul)
      formData.append('deskripsi', deskripsi)
      formData.append('halaman_url', halamanUrl)
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile)
      }

      const endpoint = isGuest ? '/helpdesk/lapor' : '/kandidat/helpdesk'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        credentials: 'same-origin',
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 422 && data?.errors) {
        const nextErrors: Record<string, string> = {}
        Object.entries(data.errors).forEach(([key, val]) => {
          if (Array.isArray(val) && val[0]) {
            nextErrors[key] = String(val[0])
          }
        })
        setErrors(nextErrors)
        toast.error('Mohon periksa kembali isian tiket Anda.')
        return
      }

      if (res.status === 429) {
        toast.error('Terlalu banyak pengiriman laporan. Mohon tunggu sebentar.')
        return
      }

      if (data?.live_chat_schedule) {
        setLiveChatSchedule(data.live_chat_schedule as LiveChatSchedule)
      }

      if (!res.ok) {
        toast.error(data?.message || 'Gagal membuka tiket.')
        return
      }

      if (data?.ticket) {
        const created: HelpdeskTicketItem = {
          ...(data.ticket as HelpdeskTicketItem),
          chat_token: data?.chat_token || (data.ticket as HelpdeskTicketItem).chat_token || null,
        }
        setTickets((prev) => {
          const next = [created, ...prev]
          if (isGuest) {
            writeGuestTicketsToSession(next)
          }
          return next
        })

        resetForm()
        setActiveTab('riwayat')
        toast.success(data?.message || 'Tiket berhasil dibuka!')
        await loadTicketChat(created)
      } else {
        resetForm()
        setActiveTab('riwayat')
        void fetchTickets(true)
        toast.success(data?.message || 'Tiket berhasil dibuka!')
      }
    } catch {
      toast.error('Terjadi gangguan koneksi saat membuka tiket.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendChatMessage = async (
    messageText: string,
    attachmentFile: File | null,
  ): Promise<boolean> => {
    if (!chatTicket) return false

    try {
      const formData = new FormData()
      if (messageText) formData.append('message', messageText)
      if (attachmentFile) formData.append('attachment', attachmentFile)

      const url = isGuest
        ? `/helpdesk/lapor/${encodeURIComponent(chatTicket.kode_tiket)}/messages`
        : `/kandidat/helpdesk/${chatTicket.id}/messages`

      const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-XSRF-TOKEN': getXsrfToken(),
      }
      if (isGuest && chatTicket.chat_token) {
        headers['X-Chat-Token'] = chatTicket.chat_token
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (data?.live_chat_schedule) {
        setLiveChatSchedule(data.live_chat_schedule as LiveChatSchedule)
      }

      if (!res.ok) {
        toast.error(data?.message || 'Gagal mengirim pesan.')
        return false
      }

      if (data?.message) {
        setChatMessages((prev) => appendUniqueMessage(prev, data.message as HelpdeskChatMessage))
      }

      if (data?.ticket) {
        const refreshed = {
          ...(data.ticket as HelpdeskTicketItem),
          chat_token: chatTicket.chat_token,
        }
        setChatTicket(refreshed)
        setTickets((prev) => {
          const next = prev.map((t) => (t.id === refreshed.id ? { ...t, ...refreshed } : t))
          if (isGuest) writeGuestTicketsToSession(next)
          return next
        })
      }

      return true
    } catch {
      toast.error('Gagal terhubung ke server saat mengirim pesan.')
      return false
    }
  }

  const bottomOffsetClass = hasBottomNav ? 'bottom-24 lg:bottom-6' : 'bottom-5 lg:bottom-6'

  const openFromFloating = () => {
    const target = replyBubble
      ? tickets.find((t) => t.id === replyBubble.ticketId) ?? null
      : null
    setReplyBubble(null)
    setOpen(true)
    if (target) {
      setActiveTab('riwayat')
      void loadTicketChat(target)
    }
  }

  return (
    <>
      {/* Floating Launcher (Bottom-Right) */}
      <AnimatePresence>
        {!hidden && !open && (
          <motion.div
            key="floating-wumpus-helpdesk"
            initial={{ opacity: 0, scale: 0.8, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 14 }}
            transition={{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
            className={`font-helpdesk-sans fixed right-4 lg:right-6 ${bottomOffsetClass} z-[45] flex items-center select-none`}
          >
            <div className="group relative flex items-center gap-3">
              {/* Notification Bubble on Floating Wumpus Head when Admin Replies */}
              <AnimatePresence>
                {replyBubble ? (
                  <motion.div
                    key="wumpus-reply-bubble"
                    initial={{ opacity: 0, scale: 0.92, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.92, x: 10 }}
                    transition={{ duration: 0.18, ease: [0.165, 0.84, 0.44, 1] }}
                    onClick={openFromFloating}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openFromFloating()
                      }
                    }}
                    className="relative max-w-[260px] sm:max-w-[300px] rounded-2xl bg-white border border-sky-200 shadow-[0_10px_28px_rgba(37,99,235,0.14)] px-3.5 py-2.5 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    {/* Centered Speech Pointer toward Wumpus */}
                    <span
                      aria-hidden="true"
                      className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-white border-r border-t border-sky-200"
                    />

                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-helpdesk-display text-[11.5px] font-semibold text-[#1E3A5F] truncate">
                          {replyBubble.senderName}
                        </span>
                        {replyBubble.kodeTiket && (
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">
                            {replyBubble.kodeTiket}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setReplyBubble(null)
                        }}
                        aria-label="Tutup notifikasi"
                        className="w-5 h-5 -mr-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-sky-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      >
                        <IconX size={12} />
                      </button>
                    </div>

                    <p className="text-[12.5px] text-slate-700 line-clamp-2 mt-1 leading-snug">
                      {replyBubble.message}
                    </p>
                  </motion.div>
                ) : (
                  <div className="hidden sm:flex pointer-events-none opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 bg-white text-slate-800 border border-sky-200 rounded-xl px-3 py-2 shadow-sm items-center gap-2 whitespace-nowrap">
                    <span className="font-helpdesk-display text-xs font-semibold">Helpdesk</span>
                  </div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={openFromFloating}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Buka Helpdesk"
                title="Helpdesk"
                className="relative w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full bg-white border-2 border-sky-300 shadow-[0_10px_26px_rgba(59,130,246,0.18)] flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] flex items-center justify-center pointer-events-none">
                  <WumpusLottie className="w-full h-full" />
                </div>

                {totalBadge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-blue-500 text-white text-[10.5px] font-semibold flex items-center justify-center border-2 border-white [font-variant-numeric:tabular-nums]">
                    {totalBadge}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smooth Biru Putih Floating Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="helpdesk-messenger-panel"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="font-helpdesk-sans fixed right-3 bottom-3 sm:right-6 sm:bottom-6 z-[70] w-[calc(100vw-1.5rem)] sm:w-[396px] h-[min(610px,calc(100vh-2rem))] rounded-2xl bg-white border border-sky-200/90 shadow-[0_20px_50px_rgba(37,99,235,0.14)] flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Helpdesk"
          >
            {/* Biru Putih Smooth Header */}
            <div className="bg-white border-b border-sky-100 shrink-0">
              <div className="bg-[#EBF4FF] text-slate-900 px-4 py-3 flex items-center justify-between gap-2 border-b border-sky-200/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  {chatTicket ? (
                    <button
                      type="button"
                      onClick={() => setChatTicket(null)}
                      aria-label="Kembali ke daftar tiket"
                      className="w-8 h-8 rounded-lg hover:bg-white/80 text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <IconArrowLeft size={17} />
                    </button>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white border border-sky-200/70 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      <WumpusLottie className="w-8 h-8" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="font-helpdesk-display text-sm font-semibold text-[#1E3A5F] truncate">
                      {chatTicket ? chatTicket.kode_tiket : 'Helpdesk'}
                    </h2>
                    {chatTicket && (
                      <p className="text-xs text-slate-600 truncate">{chatTicket.judul}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {chatTicket && (
                    <button
                      type="button"
                      onClick={() => void loadTicketChat(chatTicket)}
                      disabled={loadingChat}
                      title="Muat ulang"
                      className="w-8 h-8 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-white/80 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <IconRefresh size={15} className={loadingChat ? 'animate-spin' : ''} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Tutup Helpdesk"
                    className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <IconX size={17} />
                  </button>
                </div>
              </div>

              {/* Clean White Underline Tabs */}
              {!chatTicket && (
                <div className="flex px-4 gap-5 bg-white">
                  <button
                    type="button"
                    onClick={() => setActiveTab('lapor')}
                    className={`py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'lapor'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Open Tiket
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('riwayat')}
                    className={`py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'riwayat'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tiket ({tickets.length})
                  </button>
                </div>
              )}
            </div>

            {/* Body */}
            {chatTicket ? (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Compact Subheader */}
                <div className="px-4 py-2 bg-[#F7FBFF] border-b border-sky-100 flex items-center justify-between gap-2 shrink-0 text-[11.5px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1.5 font-medium text-zinc-700 shrink-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          (STATUS_LABEL[chatTicket.status] ?? STATUS_LABEL.diproses).dot
                        }`}
                      />
                      {(STATUS_LABEL[chatTicket.status] ?? { label: chatTicket.status }).label}
                    </span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-zinc-500 truncate">{chatTicket.kategori}</span>
                  </div>

                  {chatTicket.screenshot_url && (
                    <a
                      href={chatTicket.screenshot_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-zinc-700 hover:text-zinc-900 shrink-0"
                    >
                      <span>Screenshot</span>
                      <IconExternalLink size={12} />
                    </a>
                  )}
                </div>

                {chatTicket.tanggapan_admin && (
                  <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-700 shrink-0">
                    <span className="font-medium text-zinc-900">Catatan:</span>{' '}
                    {chatTicket.tanggapan_admin}
                  </div>
                )}

                <HelpdeskChatBox
                  messages={chatMessages}
                  loading={loadingChat}
                  isOpen={isTicketOpenStatus(chatTicket.status)}
                  chatAvailable={liveChatSchedule.active}
                  scheduleNotice={liveChatSchedule.message}
                  viewerRole={isGuest ? 'guest' : 'kandidat'}
                  onSendMessage={handleSendChatMessage}
                  heightClass="flex-1 min-h-0"
                  showStatusBar={false}
                />
              </div>
            ) : activeTab === 'lapor' ? (
              <form
                onSubmit={handleSubmit}
                className="flex-1 min-h-0 overflow-y-auto helpdesk-scroll p-4 flex flex-col gap-3.5 bg-white"
              >
                {!liveChatSchedule.active && (
                  <div className="flex items-start gap-2 rounded-lg bg-[#F7FBFF] border border-sky-200/80 px-3 py-2 text-[12px] text-slate-600 leading-relaxed">
                    <IconClock size={15} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      Live Chat aktif <strong>Senin – Sabtu, 08:00 – 17:00 WIB</strong>. Anda tetap bisa mengirim tiket di luar jam tersebut.
                    </span>
                  </div>
                )}
                {isGuest && (
                  <div className="grid grid-cols-1 gap-3 pb-3 border-b border-zinc-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-zinc-700">Nama Lengkap</label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        required
                        className={INPUT_CLASS}
                      />
                      {errors.reporter_name && (
                        <span className="text-[11px] text-rose-600">{errors.reporter_name}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-zinc-700">Email</label>
                        <input
                          type="email"
                          value={reporterEmail}
                          onChange={(e) => setReporterEmail(e.target.value)}
                          placeholder="email@contoh.com"
                          required
                          className={INPUT_CLASS}
                        />
                        {errors.reporter_email && (
                          <span className="text-[11px] text-rose-600">{errors.reporter_email}</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-zinc-700">No. HP / WA</label>
                        <input
                          type="text"
                          value={reporterPhone}
                          onChange={(e) => setReporterPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-700">Kategori</label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className={INPUT_CLASS}
                    >
                      {KATEGORI_LIST.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-700">Halaman</label>
                    <input
                      type="text"
                      value={halamanUrl}
                      onChange={(e) => setHalamanUrl(e.target.value)}
                      placeholder="/login"
                      className={`${INPUT_CLASS} font-mono text-xs`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-700">Judul Kendala</label>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder={
                      isGuest
                        ? 'Contoh: Gagal login atau OTP belum masuk'
                        : 'Contoh: Error saat mengirim lamaran'
                    }
                    required
                    className={INPUT_CLASS}
                  />
                  {errors.judul && (
                    <span className="text-[11px] text-rose-600">{errors.judul}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-700">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Jelaskan kendala yang Anda alami..."
                    required
                    className={`${INPUT_CLASS} resize-y min-h-[84px]`}
                  />
                  {errors.deskripsi && (
                    <span className="text-[11px] text-rose-600">{errors.deskripsi}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    <IconPaperclip size={14} />
                    <span>{screenshotFile ? 'Ganti screenshot' : 'Lampirkan screenshot (opsional)'}</span>
                  </button>

                  {errors.screenshot && (
                    <span className="text-[11px] text-rose-600">{errors.screenshot}</span>
                  )}

                  {screenshotPreview && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                      <img
                        src={screenshotPreview}
                        alt="Preview screenshot"
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                      <span className="text-xs text-zinc-600 truncate flex-1">
                        {screenshotFile?.name}
                      </span>
                      <button
                        type="button"
                        onClick={clearScreenshot}
                        aria-label="Hapus screenshot"
                        className="text-zinc-400 hover:text-zinc-800 cursor-pointer"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-auto w-full py-2.5 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-[13px] transition-colors cursor-pointer disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(59,130,246,0.22)]"
                >
                  {submitting
                    ? 'Membuka tiket...'
                    : liveChatSchedule.active
                      ? 'Open Tiket & Mulai Chat'
                      : 'Kirim Tiket Laporan'}
                </button>
              </form>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col bg-white">
                <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <span className="text-xs text-zinc-500">
                    {isGuest ? 'Tiket pada sesi ini' : 'Pilih tiket untuk chat'}
                  </span>
                  {!isGuest && (
                    <button
                      type="button"
                      onClick={() => void fetchTickets(false)}
                      disabled={loadingTickets}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 cursor-pointer"
                    >
                      <IconRefresh size={13} className={loadingTickets ? 'animate-spin' : ''} />
                      <span>Muat ulang</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto helpdesk-scroll divide-y divide-zinc-100">
                  {loadingTickets && tickets.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      Memuat daftar tiket...
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="py-12 px-6 text-center flex flex-col items-center gap-3">
                      <p className="text-xs text-zinc-500">
                        Belum ada tiket. Buat tiket baru jika mengalami kendala.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('lapor')}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Open Tiket
                      </button>
                    </div>
                  ) : (
                    tickets.map((ticket) => {
                      const st = STATUS_LABEL[ticket.status] ?? {
                        label: ticket.status,
                        dot: 'bg-zinc-400',
                        text: 'text-zinc-600',
                      }
                      return (
                        <button
                          key={ticket.id}
                          type="button"
                          onClick={() => void loadTicketChat(ticket)}
                          className="w-full text-left px-4 py-3.5 hover:bg-[#F7FBFF] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-zinc-400">
                                {ticket.kode_tiket}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${st.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                            </div>

                            <p className="font-helpdesk-display text-[13px] font-semibold text-zinc-900 truncate">
                              {ticket.judul}
                            </p>

                            <p className="text-[11.5px] text-zinc-400 truncate [font-variant-numeric:tabular-nums]">
                              {ticket.kategori}
                              {typeof ticket.messages_count === 'number'
                                ? ` • ${ticket.messages_count} pesan`
                                : ''}
                            </p>
                          </div>

                          <IconChevronRight
                            size={16}
                            className="text-zinc-300 group-hover:text-zinc-600 shrink-0 transition-colors"
                          />
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
