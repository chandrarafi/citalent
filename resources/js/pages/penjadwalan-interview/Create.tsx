import { useState, useMemo } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge } from '@/components/pouf/media'
import { Dialog } from '@/components/pouf/controls'
import { toast } from '@/components/pouf/toaster'
import {
  IconArrowLeft,
  IconCalendarEvent,
  IconClock,
  IconVideo,
  IconMapPin,
  IconUser,
  IconInfoCircle,
  IconCheck,
  IconSearch,
  IconUsers,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react'

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
  lowongan_judul: string
  posisi_dilamar: string
  status: string
  foto_url: string
}

interface Props {
  eligiblePelamars: PelamarOption[]
  lowongans: LowonganOption[]
  preselectedPelamarId?: number | null
  preselectedTahap?: string
}

export default function PenjadwalanInterviewCreate({
  eligiblePelamars,
  lowongans,
  preselectedPelamarId,
  preselectedTahap,
}: Props) {
  // Default date: tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  const [pelamarId, setPelamarId] = useState<number | ''>(
    preselectedPelamarId || (eligiblePelamars.length > 0 ? eligiblePelamars[0].id : '')
  )
  const [tahap, setTahap] = useState<'interview_hr' | 'interview_user' | 'interview_gm'>(
    (preselectedTahap as any) || 'interview_hr'
  )
  const [tanggal, setTanggal] = useState(defaultDate)
  const [jamMulai, setJamMulai] = useState('09:00')
  const [jamSelesai, setJamSelesai] = useState('')
  const [tipe, setTipe] = useState<'online' | 'offline'>('online')
  const [lokasi, setLokasi] = useState('PT. Menara Agung LT.2')
  const [linkMeeting, setLinkMeeting] = useState('https://meet.google.com/')
  const [pewawancara, setPewawancara] = useState('')
  const [catatan, setCatatan] = useState('')
  const [sendNotification, setSendNotification] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false)
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('')

  const selectedPelamar = useMemo(() => {
    return eligiblePelamars.find((p) => p.id === Number(pelamarId))
  }, [pelamarId, eligiblePelamars])

  const filteredCandidates = useMemo(() => {
    const q = candidateSearchQuery.trim().toLowerCase()
    if (!q) return eligiblePelamars

    return eligiblePelamars.filter((p) => {
      return (
        p.nama_lengkap.toLowerCase().includes(q) ||
        p.no_pendaftaran.toLowerCase().includes(q) ||
        p.posisi_dilamar.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        (p.lowongan_judul && p.lowongan_judul.toLowerCase().includes(q))
      )
    })
  }, [eligiblePelamars, candidateSearchQuery])

  const handleSelectCandidate = (candidate: PelamarOption) => {
    setPelamarId(candidate.id)
    setIsCandidateModalOpen(false)
    toast.success(`Kandidat ${candidate.nama_lengkap} dipilih.`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!pelamarId) {
      toast.error('Pilih kandidat yang akan dijadwalkan.')
      return
    }

    if (!tanggal || !jamMulai) {
      toast.error('Tanggal dan jam mulai wawancara wajib diisi.')
      return
    }

    if (tipe === 'online' && !linkMeeting) {
      toast.error('Link Google Meet / Zoom meeting wajib diisi untuk interview online.')
      return
    }

    if (tipe === 'offline' && !lokasi) {
      toast.error('Lokasi ruangan wawancara wajib diisi untuk interview tatap muka.')
      return
    }

    setSubmitting(true)

    const payload = {
      pelamar_id: pelamarId,
      lowongan_id: selectedPelamar?.lowongan_id || null,
      tahap,
      tanggal_interview: tanggal,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai || null,
      tipe_interview: tipe,
      lokasi: lokasi || null,
      link_meeting: linkMeeting || null,
      pewawancara_nama: pewawancara || null,
      catatan_untuk_kandidat: catatan || null,
      send_notification: sendNotification,
      send_email: sendNotification,
    }

    router.post('/penjadwalan-interview', payload, {
      onSuccess: () => {
        toast.success('Jadwal interview berhasil dibuat & undangan terkirim.')
      },
      onError: (errs) => {
        const firstErr = Object.values(errs)[0] as string
        toast.error(firstErr || 'Gagal membuat jadwal interview.')
      },
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <AppLayout>
      <Head title="Tambah Jadwal Interview Baru" />

      <Stack gap={5} className="w-full max-w-4xl mx-auto pb-16">
        {/* Header Title with Back Link */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/penjadwalan-interview">
              <Button variant="quiet" tone="purple" className="h-9 w-9 p-0 rounded-xl" title="Kembali ke Daftar Jadwal">
                <IconArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <Heading level={1} className="text-2xl font-bold tracking-tight text-slate-900">
                Tambah Jadwal Interview Baru
              </Heading>
              <Text muted size="sm">
                Atur jadwal wawancara untuk kandidat pelamar dan kirim undangan otomatis via email.
              </Text>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Candidate Selection with Modal Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 block">
                  1. Pilih Kandidat Pelamar <span className="text-rose-500">*</span>
                </label>
                {selectedPelamar && (
                  <button
                    type="button"
                    onClick={() => {
                      setCandidateSearchQuery('')
                      setIsCandidateModalOpen(true)
                    }}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <IconSearch size={14} />
                    Ganti / Cari Kandidat Lain
                  </button>
                )}
              </div>

              {/* Selected Candidate Card Display */}
              {selectedPelamar ? (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50/80 to-white border-2 border-purple-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedPelamar.foto_url}
                      alt={selectedPelamar.nama_lengkap}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-purple-200 shadow-xs shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/assets/images/user.png'
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 text-base">{selectedPelamar.nama_lengkap}</span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-900 font-semibold border border-purple-200">
                          {selectedPelamar.no_pendaftaran}
                        </span>
                      </div>
                      <div className="text-xs text-purple-800 font-semibold mt-0.5">
                        {selectedPelamar.posisi_dilamar}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>Email: <b>{selectedPelamar.email}</b></span>
                        <span>•</span>
                        <span>Kontak: <b>{selectedPelamar.nomor_kontak}</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="quiet"
                      tone="purple"
                      size="sm"
                      onClick={() => {
                        setCandidateSearchQuery('')
                        setIsCandidateModalOpen(true)
                      }}
                      className="font-bold"
                    >
                      <IconSearch size={15} className="mr-1" />
                      Cari Lagi
                    </Button>
                  </div>
                </div>
              ) : (
                /* Unselected State: Large clickable search trigger */
                <button
                  type="button"
                  onClick={() => {
                    setCandidateSearchQuery('')
                    setIsCandidateModalOpen(true)
                  }}
                  className="w-full p-6 border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl transition flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition shrink-0 mb-2 shadow-xs">
                    <IconSearch size={24} />
                  </div>
                  <span className="text-sm font-bold text-purple-950">
                    Klik di sini untuk Membuka Modal & Memilih Kandidat
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">
                    Cari berdasarkan nama, no pendaftaran, posisi lowongan, atau email pelamar
                  </span>
                </button>
              )}
            </div>

            {/* 2. Tahap Interview */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 block">
                2. Tahap Interview <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'interview_hr', label: 'Interview HR', desc: 'Wawancara awal & background check oleh tim HR' },
                  { key: 'interview_user', label: 'Interview User', desc: 'Wawancara kompetensi teknis dengan User / Lead' },
                  { key: 'interview_gm', label: 'Interview GM', desc: 'Wawancara final dengan General Manager' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => setTahap(t.key as any)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      tahap === t.key
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 text-purple-950 font-semibold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{t.label}</span>
                      {tahap === t.key && <IconCheck size={16} className="text-purple-600 shrink-0" />}
                    </div>
                    <span className="text-xs text-slate-500 font-normal mt-1">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tanggal & Waktu Pelaksanaan */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 block">
                3. Waktu & Tanggal Interview <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Tanggal Wawancara <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Jam Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Jam Selesai (Estimasi)
                  </label>
                  <input
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. Tipe Pelaksanaan (Online vs Offline) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 block">
                4. Tipe Pelaksanaan Wawancara <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipe('online')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                    tipe === 'online'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <IconVideo size={22} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">Online Video Call</div>
                    <div className="text-xs text-slate-500 font-normal">Google Meet, Zoom, atau Microsoft Teams</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipe('offline')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                    tipe === 'offline'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <IconMapPin size={22} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">Tatap Muka (Offline)</div>
                    <div className="text-xs text-slate-500 font-normal">Kantor Pusat / Ruang Meeting Perusahaan</div>
                  </div>
                </button>
              </div>

              {/* Conditional Input: Link vs Lokasi */}
              {tipe === 'online' ? (
                <div className="space-y-1.5 mt-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Link Pertemuan Online (Google Meet / Zoom URL) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <IconVideo size={18} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/abc-defg-hij"
                      value={linkMeeting}
                      onChange={(e) => setLinkMeeting(e.target.value)}
                      required={tipe === 'online'}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 mt-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Lokasi / Alamat Lengkap & Ruangan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <IconMapPin size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: PT. Menara Agung LT.2"
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      required={tipe === 'offline'}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Catatan untuk Kandidat */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 block">
                  5. Catatan / Petunjuk Khusus untuk Kandidat
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Harap membawa berkas asli, pakaian kemeja rapi, dan hadir 10 menit sebelum waktu mulai."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              {/* Email Notification Option */}
              <div className="p-4 bg-purple-50/80 border border-purple-100 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="sendNotification" className="text-xs text-slate-800 font-semibold cursor-pointer">
                  Kirim email undangan & rincian jadwal interview ke email kandidat secara otomatis.
                </label>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link href="/penjadwalan-interview">
                <Button type="button" variant="quiet">
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                tone="purple"
                disabled={submitting}
                className="font-bold px-6 shadow-sm"
              >
                {submitting ? 'Menyimpan Jadwal...' : 'Simpan & Jadwalkan Wawancara'}
              </Button>
            </div>
          </form>
        </Card>
      </Stack>

      {/* Modal Dialog: Search & Select Candidate */}
      <Dialog
        open={isCandidateModalOpen}
        onOpenChange={(open) => setIsCandidateModalOpen(open)}
        title="Cari & Pilih Kandidat Pelamar"
        size="lg"
      >
        <div className="space-y-4 pt-1">
          {/* Search Bar inside modal */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IconSearch size={18} />
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Ketik nama kandidat, nomor pendaftaran, posisi yang dilamar, atau email..."
              value={candidateSearchQuery}
              onChange={(e) => setCandidateSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
            />
            {candidateSearchQuery && (
              <button
                type="button"
                onClick={() => setCandidateSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <IconX size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Menampilkan <b>{filteredCandidates.length}</b> kandidat yang eligible untuk interview</span>
          </div>

          {/* Candidate List */}
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((c) => {
                const isSelected = c.id === Number(pelamarId)
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCandidate(c)}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20'
                        : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.foto_url}
                        alt={c.nama_lengkap}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/assets/images/user.png'
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">{c.nama_lengkap}</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {c.no_pendaftaran}
                          </span>
                        </div>
                        <div className="text-xs text-purple-700 font-semibold truncate mt-0.5">
                          {c.posisi_dilamar}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.email} • {c.nomor_kontak}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge tone={isSelected ? 'purple' : 'blue'}>
                        {c.status}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        tone={isSelected ? 'purple' : 'mint'}
                        className="text-xs font-bold"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectCandidate(c)
                        }}
                      >
                        {isSelected ? 'Terpilih ✓' : 'Pilih'}
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center text-slate-400">
                <IconUsers size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-600">Tidak ada kandidat yang cocok</p>
                <p className="text-xs mt-0.5">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => setIsCandidateModalOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Dialog>
    </AppLayout>
  )
}
