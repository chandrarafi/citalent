import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge, Blob } from '@/components/pouf/media'
import type { Tone } from '@/components/pouf/tone'
import {
  IconFileText,
  IconCheck,
  IconBriefcase,
  IconCalendar,
  IconEye,
  IconChevronRight,
} from '@tabler/icons-react'

interface ApplicationItem {
  id: number
  no_pendaftaran: string
  posisi_dilamar: string
  nama_lengkap: string
  email: string
  nomor_kontak: string
  departement_nama: string
  kd_jabatan: string
  lokasi_kerja: string
  tipe_pekerjaan: string
  status: string
  status_label: string
  status_tone: Tone
  step: number
  catatan?: string | null
  applied_at: string
  lowongan?: {
    id: number
    kode_lowongan: string
    judul: string
    slug: string
  } | null
}

interface Props {
  applications: ApplicationItem[]
}

export default function Lamaran({ applications }: Props) {
  const { flash } = usePage<any>().props

  return (
    <AppLayout>
      <Head title="Riwayat Lamaran Saya - Citalent" />

      <div className="max-w-5xl mx-auto pb-16 pt-1 sm:pt-2">
        <Stack gap={5}>
          {/* Header Card */}
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Blob icon="log" tone="blue" size="lg" />
                <Stack gap={1}>
                  <Heading level={2}>Riwayat Lamaran Kerja</Heading>
                  <Text size="sm" muted>
                    Pantau tahapan seleksi dan status proses rekrutmen dari seluruh posisi yang telah Anda lamar.
                  </Text>
                </Stack>
              </div>

              <Button tone="purple" onClick={() => router.visit('/kandidat/lowongan')}>
                <IconBriefcase size={16} />
                Cari Lowongan Lain
              </Button>
            </div>
          </Card>

          {/* Flash Messages */}
          {flash?.success && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <IconCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Berhasil</p>
                <p className="mt-0.5">{flash.success}</p>
              </div>
            </div>
          )}

          {/* Application List */}
          {applications.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <IconFileText size={32} />
                </div>
                <Heading level={3}>Belum Ada Lamaran Diajukan</Heading>
                <Text size="sm" muted className="mt-1 max-w-md mx-auto">
                  Anda belum pernah mengajukan lamaran ke posisi manapun. Silakan jelajahi lowongan yang sedang dibuka.
                </Text>
                <div className="mt-4">
                  <Button tone="purple" onClick={() => router.visit('/kandidat/lowongan')}>
                    <IconBriefcase size={16} />
                    Lihat Lowongan Kerja
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-3.5">
              {applications.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Stack gap={2} className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Heading level={3} className="text-slate-900 leading-snug">
                          {app.posisi_dilamar}
                        </Heading>
                        <Badge tone={app.status_tone}>{app.status_label}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <IconCalendar size={13} className="text-slate-400" />
                          Diajukan: <strong>{app.applied_at}</strong>
                        </span>
                      </div>
                    </Stack>

                    <Button
                      tone="purple"
                      size="sm"
                      onClick={() => router.visit(`/kandidat/lamaran/${app.no_pendaftaran}`)}
                      className="w-full sm:w-auto shrink-0"
                    >
                      <IconEye size={15} />
                      Detail
                      <IconChevronRight size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Stack>
      </div>
    </AppLayout>
  )
}
