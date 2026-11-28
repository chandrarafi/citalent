import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from '@/components/pouf/toaster'
import {
  IconArrowUp,
  IconClock,
  IconExternalLink,
  IconLock,
  IconPaperclip,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'

export interface HelpdeskChatMessage {
  id: number
  helpdesk_ticket_id: number
  user_id?: number | null
  sender_type: 'kandidat' | 'guest' | 'admin' | 'system' | string
  sender_name: string
  message: string
  attachment_url?: string | null
  is_read?: boolean
  created_at?: string | null
  time_short?: string | null
}

interface HelpdeskChatBoxProps {
  messages: HelpdeskChatMessage[]
  loading?: boolean
  isOpen: boolean
  chatAvailable?: boolean
  scheduleNotice?: string
  viewerRole: 'kandidat' | 'guest' | 'admin'
  onSendMessage: (messageText: string, attachmentFile: File | null) => Promise<boolean>
  onRefresh?: () => void
  heightClass?: string
  showStatusBar?: boolean
}

export default function HelpdeskChatBox({
  messages,
  loading = false,
  isOpen,
  chatAvailable = true,
  scheduleNotice = 'Live Chat aktif Senin – Sabtu, pukul 08:00 – 17:00 WIB.',
  viewerRole,
  onSendMessage,
  onRefresh,
  heightClass = 'h-[300px]',
  showStatusBar = true,
}: HelpdeskChatBoxProps) {
  const [text, setText] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const scrollEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    return () => {
      if (attachmentPreview) {
        URL.revokeObjectURL(attachmentPreview)
      }
    }
  }, [attachmentPreview])

  const clearAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview)
    }
    setAttachmentFile(null)
    setAttachmentPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Ukuran lampiran maksimal 3 MB.')
      return
    }

    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview)
    }
    setAttachmentFile(file)
    setAttachmentPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending || !isOpen) return

    const trimmed = text.trim()
    if ((!trimmed && !attachmentFile) || !chatAvailable) return

    setSending(true)
    try {
      const ok = await onSendMessage(trimmed, attachmentFile)
      if (ok) {
        setText('')
        clearAttachment()
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="font-helpdesk-sans flex flex-col min-h-0 flex-1 bg-white">
      {showStatusBar && onRefresh && (
        <div className="flex items-center justify-end px-4 py-2 border-b border-sky-100 bg-[#F7FBFF] shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <IconRefresh size={13} className={loading ? 'animate-spin' : ''} />
            <span>Muat ulang</span>
          </button>
        </div>
      )}

      {/* Messages */}
      <div className={`${heightClass} overflow-y-auto helpdesk-scroll px-4 py-4 flex flex-col gap-3.5 bg-white`}>
        {loading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <span className="text-xs text-zinc-400">Memuat percakapan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center px-6 py-10">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Belum ada pesan. Tulis pesan di bawah untuk memulai percakapan.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine =
              viewerRole === 'admin'
                ? msg.sender_type === 'admin'
                : msg.sender_type === 'kandidat' || msg.sender_type === 'guest'

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[82%] ${
                  isMine ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 px-0.5 pb-1">
                  <span className="text-[11px] font-medium text-zinc-500">
                    {isMine ? 'Anda' : msg.sender_name}
                  </span>
                  <span className="text-[10.5px] text-zinc-400 [font-variant-numeric:tabular-nums]">
                    {msg.time_short || msg.created_at || ''}
                  </span>
                </div>

                <div
                  className={`px-3.5 py-2.5 text-[13px] leading-[1.5] flex flex-col gap-2 transition-colors ${
                    isMine
                      ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm shadow-[0_2px_8px_rgba(59,130,246,0.18)]'
                      : 'bg-[#F1F7FE] text-slate-800 border border-sky-100 rounded-2xl rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{msg.message}</p>

                  {msg.attachment_url && (
                    <a
                      href={msg.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className={`group/img relative block rounded-lg overflow-hidden border max-w-[220px] ${
                        isMine ? 'border-white/15 bg-black/20' : 'border-zinc-200 bg-white'
                      }`}
                    >
                      <img
                        src={msg.attachment_url}
                        alt="Lampiran pesan"
                        className="w-full max-h-44 object-contain"
                      />
                      <span className="absolute top-1.5 right-1.5 bg-zinc-900/75 text-white p-1 rounded opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <IconExternalLink size={12} />
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Composer */}
      <div className="px-3.5 py-3 bg-white border-t border-sky-100 shrink-0">
        {!isOpen ? (
          <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-500">
            <IconLock size={13} />
            <span>Tiket sudah selesai / ditutup</span>
          </div>
        ) : !chatAvailable ? (
          <div className="flex items-start gap-2 rounded-xl bg-[#F7FBFF] border border-sky-200/80 px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
            <IconClock size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <span>{scheduleNotice}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {attachmentPreview && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F7FBFF] border border-sky-200/80 self-start">
                <img
                  src={attachmentPreview}
                  alt="Preview lampiran"
                  className="w-8 h-8 rounded object-cover"
                />
                <span className="text-xs text-slate-600 max-w-[160px] truncate">
                  {attachmentFile?.name}
                </span>
                <button
                  type="button"
                  onClick={clearAttachment}
                  aria-label="Hapus lampiran"
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <IconX size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 rounded-xl border border-sky-200/90 bg-white px-2.5 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
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
                title="Lampirkan gambar"
                aria-label="Lampirkan gambar"
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-sky-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <IconPaperclip size={16} />
              </button>

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis pesan..."
                disabled={sending}
                className="flex-1 min-w-0 bg-transparent border-none text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none py-1"
              />

              <button
                type="submit"
                disabled={sending || (!text.trim() && !attachmentFile)}
                aria-label="Kirim pesan"
                className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <IconArrowUp size={15} />
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
