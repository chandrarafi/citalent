import { useState, useMemo } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge } from '@/components/pouf/media'
import { Select } from '@/components/pouf/controls'
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
} from '@tabler/icons-react'

interface ScheduleData {
  id: number
  pelamar_id: number
  lowongan_id: number
  kandidat_nama: string
  kandidat_no_pendaftaran: string
  kandidat_email: string
  kandidat_phone: string
  posisi_nama: string
  tahap: 'interview_hr' | 'interview_user' | 'interview_gm'
  tanggal_interview: string
  jam_mulai: string
  jam_selesai?: string | null
  tipe_interview: 'online' | 'offline'
  lokasi?: string | null
  link_meeting?: string | null
  pewawancara_nama?: string | null
  catatan_untuk_kandidat?: string | null
  status_kehadiran: string
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
  schedule: ScheduleData
  eligiblePelamars: PelamarOption[]
}

export default function PenjadwalanInterviewEdit({
  schedule,
  eligiblePelamars,
}: Props) {
  const [tahap, setTahap] = useState<'interview_hr' | 'interview_user' | 'interview_gm'>(schedule.tahap)
  const [tanggal, setTanggal] = useState(schedule.tanggal_interview || '')
  const [jamMulai, setJamMulai] = useState(schedule.jam_mulai || '')
  const [jamSelesai, setJamSelesai] = useState(schedule.jam_selesai || '')
  const [tipe, setTipe] = useState<'online' | 'offline'>(schedule.tipe_interview)
  const [lokasi, setLokasi] = useState(schedule.lokasi || '')
  const [linkMeeting, setLinkMeeting] = useState(schedule.link_meeting || '')
  const [pewawancara, setPewawancara] = useState(schedule.pewawancara_nama || '')
  const [catatan, setCatatan] = useState(schedule.catatan_untuk_kandidat || '')
  const [statusKehadiran, setStatusKehadiran] = useState(schedule.status_kehadiran || 'scheduled')
  const [sendNotification, setSendNotification] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
      tahap,
      tanggal_interview: tanggal,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai || null,
      tipe_interview: tipe,
      lokasi: lokasi || null,
      link_meeting: linkMeeting || null,
      pewawancara_nama: pewawancara || null,
      catatan_untuk_kandidat: catatan || null,
      status_kehadiran: statusKehadiran,
      send_notification: sendNotification,
      send_email: sendNotification,
    }

    router.put(`/penjadwalan-interview/${schedule.id}`, payload, {
      onSuccess: () => {
        toast.success('Jadwal interview berhasil diperbarui.')
      },
      onError: (errs) => {
        const firstErr = Object.values(errs)[0] as string
        toast.error(firstErr || 'Gagal memperbarui jadwal interview.')
      },
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <AppLayout>
      <Head title={`Edit Jadwal Interview - ${schedule.kandidat_nama}`} />

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
                Edit Jadwal Interview
              </Heading>
              <Text muted size="sm">
                Perbarui detail jadwal wawancara untuk {schedule.kandidat_nama}.
              </Text>
            </div>
          </div>
        </div>

        {/* Candidate Summary Card */}
        <Card className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-900 text-base">{schedule.kandidat_nama}</div>
            <div className="text-xs text-purple-800 font-semibold mt-0.5">
              {schedule.posisi_nama} • <span className="font-mono">{schedule.kandidat_no_pendaftaran}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Email: {schedule.kandidat_email} | Kontak: {schedule.kandidat_phone}
            </div>
          </div>
          <Link href={`/pelamar/${schedule.pelamar_id}`}>
            <Button size="sm" tone="purple">
              Lihat Profil Pelamar ↗
            </Button>
          </Link>
        </Card>

        {/* Main Form Card */}
        <Card className="p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Tahap Interview */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 block">
                1. Tahap Interview <span className="text-rose-500">*</span>
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

            {/* 2. Tanggal & Waktu Pelaksanaan */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 block">
                2. Waktu & Tanggal Interview <span className="text-rose-500">*</span>
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

            {/* 3. Tipe Pelaksanaan (Online vs Offline) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 block">
                3. Tipe Pelaksanaan Wawancara <span className="text-rose-500">*</span>
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
                    Lokasi & Ruangan <span className="text-rose-500">*</span>
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

            {/* 4. Status Kehadiran */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 block">
                4. Status Kehadiran
              </label>
              <div className="w-full sm:w-72">
                <Select
                  value={statusKehadiran}
                  onChange={(val) => setStatusKehadiran(val)}
                  options={[
                    { value: 'scheduled', label: 'Dijadwalkan (Belum Mulai)' },
                    { value: 'attended', label: 'Hadir / Selesai Wawancara' },
                    { value: 'not_attended', label: 'Tidak Hadir (No Show)' },
                    { value: 'rescheduled', label: 'Perlu Reschedule (Jadwal Ulang)' },
                    { value: 'cancelled', label: 'Dibatalkan' },
                  ]}
                />
              </div>
            </div>

            {/* 5. Catatan */}
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
                  Kirim email update jadwal interview ke email kandidat.
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
                {submitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Jadwal'}
              </Button>
            </div>
          </form>
        </Card>
      </Stack>
    </AppLayout>
  )
}
