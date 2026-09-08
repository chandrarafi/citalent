import { Head, router } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge, Blob } from '@/components/pouf/media'
import { Separator } from '@/components/pouf/separator'
import type { Tone } from '@/components/pouf/tone'
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconBriefcase,
  IconAlertCircle,
  IconAward,
  IconFileText,

} from '@tabler/icons-react'

interface ApplicationDetail {
  id: number
  no_pendaftaran: string
  posisi_dilamar: string
  nama_lengkap: string
  email: string
  nomor_kontak: string
  tempat_lahir?: string | null
  tanggal_lahir?: string | null
  jenis_kelamin?: string | null
  status_pernikahan?: string | null
  agama?: string | null
  alamat?: string | null
  domisili?: string | null
  pendidikan_terakhir?: string | null
  nama_institusi?: string | null
  jurusan?: string | null
  tahun_lulus?: string | null
  cv_url?: string | null
  foto_url?: string | null
  surat_lamaran_url?: string | null
  departement_nama: string
  kd_jabatan: string
  lokasi_kerja: string
  tipe_pekerjaan: string
  status: string
  tahap_gagal?: string | null
  status_label: string
  status_tone: Tone
  step: number
  catatan?: string | null
  applied_at: string
  formulir_submitted?: boolean
  has_formulir?: boolean
  lowongan?: {
    id: number
    kode_lowongan: string
    judul: string
    slug: string
  } | null
}

interface Props {
  application: ApplicationDetail
}

const SKILL_TEST_JABATAN_CODES = ['JBT-5', 'JBT-27', 'JBT-28', 'JBT-29', 'JBT-31', 'JBT-26']
const INTERVIEW_GM_JABATAN_CODES = ['JBT-6', 'JBT-37']

const TIMELINE_STAGES = [
  {
    key: 'submitted',
    title: 'Submit Lamaran',
    defaultDesc: 'Data pendaftaran & berkas berhasil dikirim',
  },
  {
    key: 'screening_cv',
    title: 'Screening CV',
    defaultDesc: 'Pemeriksaan berkas & kualifikasi oleh HR',
  },
  {
    key: 'lengkapi_formulir',
    title: 'Lengkapi Formulir Lamaran Kerja',
    defaultDesc: 'Kandidat melengkapi formulir data diri dan berkas lamaran kerja',
  },
  {
    key: 'skill_test',
    title: 'Skill Test',
    defaultDesc: 'Uji kompetensi teknis / tes keahlian',
  },
  {
    key: 'interview_hr',
    title: 'Interview HR',
    defaultDesc: 'Wawancara awal & background check',
  },
  {
    key: 'interview_user',
    title: 'Interview User',
    defaultDesc: 'Wawancara dengan calon atasan / User',
  },
  {
    key: 'interview_gm',
    title: 'Interview GM',
    defaultDesc: 'Wawancara dengan General Manager (GM)',
  },
  {
    key: 'final_discussion',
    title: 'Final Discussion',
    defaultDesc: 'Diskusi offering letter & kesepakatan join',
  },
]

export default function LamaranDetail({ application }: Props) {
  const hasSkillTest = application.kd_jabatan
    ? SKILL_TEST_JABATAN_CODES.includes(application.kd_jabatan)
    : false

  const hasInterviewGm = application.kd_jabatan
    ? INTERVIEW_GM_JABATAN_CODES.includes(application.kd_jabatan)
    : false

  const activeStages = TIMELINE_STAGES.filter((stage) => {
    if (stage.key === 'skill_test') {
      return hasSkillTest
    }
    if (stage.key === 'interview_gm') {
      return hasInterviewGm
    }
    return true
  }).map((stage, idx) => ({
    ...stage,
    step: idx + 1,
  }))

  const normalizedStatus = application.status === 'review'
    ? 'screening_cv'
    : application.status === 'interview'
    ? 'interview_hr'
    : application.status

  const currentStageIndex = activeStages.findIndex((s) => s.key === normalizedStatus)
  const isRejected = normalizedStatus === 'rejected'
  const isAccepted = normalizedStatus === 'accepted'

  const failedStageKey = isRejected
    ? application.tahap_gagal || (application.has_formulir ? (hasSkillTest ? 'skill_test' : 'screening_cv') : 'submitted')
    : null
  const failedStageIndex = failedStageKey
    ? activeStages.findIndex((s) => s.key === failedStageKey)
    : -1
  const failedStageObj = failedStageIndex >= 0 ? activeStages[failedStageIndex] : null

  return (
    <AppLayout>
      <Head title={`Detail Lamaran - ${application.posisi_dilamar}`} />

      <div className="max-w-4xl mx-auto pb-16 pt-1 sm:pt-2">
        <Stack gap={5}>
          {/* Back Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

            <Badge tone={application.status_tone}>
              STATUS: {application.status_label.toUpperCase()}
            </Badge>

              <Button
            tone="blue"
              size="sm"
              onClick={() => router.visit('/kandidat/lamaran')}
            >
              <IconArrowLeft size={16} />
              Kembali ke Riwayat Lamaran
            </Button>

          </div>

          {/* 1. Banner Info Posisi Dilamar */}
          <Card variant="tight">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
              <Stack gap={1} className="flex-1 min-w-0">
                <Heading level={2} className="text-purple-950 font-black text-xl">
                  {application.posisi_dilamar}
                </Heading>
                <Text size="sm" muted>
                  Diajukan pada: <strong>{application.applied_at}</strong>
                </Text>
              </Stack>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                {(normalizedStatus === 'lengkapi_formulir' || application.has_formulir) && (
                  <Button
                    tone={normalizedStatus === 'lengkapi_formulir' && !application.formulir_submitted ? 'mint' : 'purple'}
                    size="sm"
                    onClick={() => router.visit(`/kandidat/lamaran/${application.no_pendaftaran}/formulir`)}
                  >
                    <IconFileText size={16} />
                    {application.formulir_submitted
                      ? 'Lihat Formulir Lamaran'
                      : 'Lengkapi Formulir Lamaran Kerja'}
                  </Button>
                )}

                {application.lowongan && (
                  <Button
                    size="sm"
                    tone="mint"
                    onClick={() => router.visit('/kandidat/lowongan')}
                  >
                    <IconBriefcase size={15} />
                    Lihat Lowongan Lain
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Action Alert for Lengkapi Formulir Stage */}
          {normalizedStatus === 'lengkapi_formulir' && (
            <div className="p-5 rounded-2xl bg-purple-50 border-2 border-purple-300 text-purple-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <IconFileText size={22} />
                </div>
                <div>
                  <span className="font-black text-base text-purple-950 block">
                    Tahap 3: Lengkapi Formulir Lamaran Kerja
                  </span>
                  <p className="text-xs sm:text-sm text-purple-800 mt-1 leading-relaxed">
                    {application.formulir_submitted
                      ? 'Formulir lamaran kerja Anda telah terkirim. Anda dapat meninjau atau memperbarui data kembali jika diperlukan.'
                      : 'Silakan isi Formulir Lamaran Kerja resmi PT. Menara Agung secara lengkap untuk melanjutkan ke tahapan seleksi berikutnya.'}
                  </p>
                </div>
              </div>

              <Button
                tone={application.formulir_submitted ? 'purple' : 'mint'}
                size="md"
                onClick={() => router.visit(`/kandidat/lamaran/${application.no_pendaftaran}/formulir`)}
                className="w-full sm:w-auto shrink-0 font-bold shadow-sm"
              >
                <IconFileText size={18} />
                {application.formulir_submitted ? 'Tinjau Formulir Lamaran' : 'Isi Formulir Sekarang →'}
              </Button>
            </div>
          )}

          {/* 2. Timeline Tahapan Rekrutmen (Vertical Stepper Style - identical to Admin) */}
          <Card>
            <Stack gap={4}>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Blob icon="target" tone="mint" size="sm" />
                <div>
                  <Heading level={2} className="text-base font-bold text-slate-900">
                    Tahapan Rekrutmen
                  </Heading>
                  <Text size="sm" muted>
                    Perkembangan proses seleksi lamaran Anda secara berurutan.
                  </Text>
                </div>
              </div>

              {/* Status Diterima Alert */}
              {isAccepted && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
                  <IconAward size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-base block text-emerald-950">Selamat! Anda telah dinyatakan Diterima Bekerja.</span>
                    <p className="text-emerald-800 mt-1 leading-relaxed">
                      Tim HR kami akan segera menghubungi Anda untuk tahap penandatanganan offering letter dan perjanjian kerja.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Ditolak Alert */}
              {isRejected && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
                  <IconAlertCircle size={24} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-base block text-rose-950">
                      Lamaran Tidak Dapat Dilanjutkan {failedStageObj ? `(Gagal pada Tahap: ${failedStageObj.title})` : ''}
                    </span>
                    <p className="text-rose-800 mt-1 leading-relaxed">
                      {application.catatan
                        ? application.catatan
                        : 'Terima kasih atas partisipasi dan antusiasme Anda. Saat ini kualifikasi belum sesuai dengan kriteria yang dibutuhkan pada tahapan ini.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Vertical Stepper List */}
              <div className="py-2 pl-2 sm:pl-4">
                <div className="flex flex-col">
                  {activeStages.map((stage, idx) => {
                    const isLast = idx === activeStages.length - 1
                    let stepState: 'completed' | 'current' | 'upcoming' | 'rejected' = 'upcoming'

                    if (isRejected) {
                      const targetFailedIdx = failedStageIndex >= 0 ? failedStageIndex : 0
                      if (idx < targetFailedIdx) {
                        stepState = 'completed'
                      } else if (idx === targetFailedIdx) {
                        stepState = 'rejected'
                      } else {
                        stepState = 'upcoming'
                      }
                    } else if (isAccepted) {
                      stepState = 'completed'
                    } else if (currentStageIndex >= 0) {
                      if (idx < currentStageIndex) stepState = 'completed'
                      else if (idx === currentStageIndex) stepState = 'current'
                      else stepState = 'upcoming'
                    } else {
                      if (idx === 0) stepState = 'current'
                    }

                    const isFormulirStep = stage.key === 'lengkapi_formulir'
                    const canClickForm = isFormulirStep && (stepState === 'current' || stepState === 'completed' || application.has_formulir)

                    return (
                      <div key={stage.key} className="relative flex items-start gap-4 pb-7 last:pb-0">
                        {/* Vertical Connecting Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-[13px] top-6 bottom-0 w-[2px] ${
                              stepState === 'completed'
                                ? 'bg-emerald-500'
                                : 'bg-[#e4e4e7]'
                            }`}
                          />
                        )}

                        {/* Circle Node */}
                        <div
                          className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            stepState === 'completed'
                              ? 'border-2 border-emerald-600 bg-emerald-600 text-white shadow-xs'
                              : stepState === 'current'
                              ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100 shadow-xs'
                              : stepState === 'rejected'
                              ? 'border-2 border-red-500 bg-red-50 text-red-600 ring-4 ring-red-100 shadow-xs'
                              : 'border-2 border-[#d4d4d8] bg-white text-transparent'
                          }`}
                        >
                          {stepState === 'completed' ? (
                            <IconCheck size={14} stroke={3} />
                          ) : stepState === 'current' ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          ) : stepState === 'rejected' ? (
                            <IconX size={14} stroke={3} />
                          ) : (
                            <span className="w-2 h-2" />
                          )}
                        </div>

                        {/* Text Column */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-semibold tracking-tight ${
                                stepState === 'current'
                                  ? 'text-emerald-800 font-bold'
                                  : stepState === 'completed'
                                  ? 'text-slate-900'
                                  : stepState === 'rejected'
                                  ? 'text-red-700 font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stage.step}. {stage.title}
                            </span>

                            {stepState === 'current' && !isRejected && !isAccepted && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Sedang Berlangsung
                              </span>
                            )}
                            {stepState === 'completed' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                                ✓ Selesai
                              </span>
                            )}
                            {stepState === 'rejected' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                ✕ Gagal di Tahap Ini
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {stage.defaultDesc}
                          </p>

                          {/* Interactive Button for Lengkapi Formulir step */}
                          {canClickForm && (
                            <div className="mt-2.5">
                              <Button
                                tone={stepState === 'current' && !application.formulir_submitted ? 'mint' : 'purple'}
                                size="sm"
                                onClick={() => router.visit(`/kandidat/lamaran/${application.no_pendaftaran}/formulir`)}
                              >
                                <IconFileText size={15} />
                                {application.formulir_submitted
                                  ? 'Lihat Formulir Lamaran'
                                  : 'Isi Formulir Lamaran Kerja'}
                              </Button>
                            </div>
                          )}

                          {/* HR Notes on active stage */}
                          {stepState === 'current' && application.catatan && (
                            <div className="mt-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                              <IconAlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Catatan dari Tim Rekrutmen:</span>
                                <p className="mt-0.5 leading-relaxed">{application.catatan}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Stack>
          </Card>

          {/* 3. Data Pribadi Kandidat */}
          <Card>
            <Stack gap={4}>
              <Row gap={2} align="center">
                <Blob icon="user" tone="purple" size="sm" />
                <Heading level={2} className="text-base font-bold text-slate-900">
                  Data Pribadi & Kontak
                </Heading>
              </Row>

              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Pas Foto Formal */}
                {application.foto_url && (
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-purple-300 shadow-xs bg-black/5">
                      <img
                        src={application.foto_url}
                        alt={application.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1">Pas Foto</span>
                  </div>
                )}

                {/* Data Grid */}
                <div className="flex-1 w-full">
                  <Grid cols={2}>
                    <Stack gap={1}>
                      <Text size="sm" muted>Nama Lengkap:</Text>
                      <Text><strong>{application.nama_lengkap}</strong></Text>
                    </Stack>
                    <Stack gap={1}>
                      <Text size="sm" muted>Nomor WhatsApp / Kontak:</Text>
                      <Text mono><strong>{application.nomor_kontak}</strong></Text>
                    </Stack>
                    <Stack gap={1}>
                      <Text size="sm" muted>Email Aktif:</Text>
                      <Text mono><strong>{application.email}</strong></Text>
                    </Stack>
                    <Stack gap={1}>
                      <Text size="sm" muted>Tempat, Tgl Lahir:</Text>
                      <Text>{application.tempat_lahir || '—'}, {application.tanggal_lahir || '—'}</Text>
                    </Stack>
                    <Stack gap={1}>
                      <Text size="sm" muted>Kota Domisili:</Text>
                      <Text>{application.domisili || '—'}</Text>
                    </Stack>
                    <Stack gap={1}>
                      <Text size="sm" muted>Alamat KTP:</Text>
                      <Text>{application.alamat || '—'}</Text>
                    </Stack>
                  </Grid>
                </div>
              </div>
            </Stack>
          </Card>

          {/* 4. Riwayat Pendidikan & Dokumen */}
          <Card>
            <Stack gap={4}>
              <Row gap={2} align="center">
                <Blob icon="database" tone="blue" size="sm" />
                <Heading level={2} className="text-base font-bold text-slate-900">
                  Pendidikan & Berkas Lamaran
                </Heading>
              </Row>

              <Grid cols={2}>
                <Stack gap={1}>
                  <Text size="sm" muted>Pendidikan Terakhir:</Text>
                  <Text><strong>{application.pendidikan_terakhir || '—'}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Nama Institusi / Kampus:</Text>
                  <Text><strong>{application.nama_institusi || '—'}</strong></Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Jurusan:</Text>
                  <Text>{application.jurusan || '—'}</Text>
                </Stack>
                <Stack gap={1}>
                  <Text size="sm" muted>Tahun Kelulusan:</Text>
                  <Text mono>{application.tahun_lulus || '—'}</Text>
                </Stack>
              </Grid>

              <Separator />

              <div className="flex flex-wrap items-center gap-3">
                {(normalizedStatus === 'lengkapi_formulir' || application.has_formulir) && (
                  <Button
                    tone="mint"
                    size="sm"
                    onClick={() => router.visit(`/kandidat/lamaran/${application.no_pendaftaran}/formulir`)}
                  >
                    <IconFileText size={15} />
                    {application.formulir_submitted
                      ? 'Lihat Formulir Lamaran Kerja ↗'
                      : 'Lengkapi Formulir Lamaran Kerja'}
                  </Button>
                )}

                {application.cv_url ? (
                  <Button
                    tone="purple"
                    variant="quiet"
                    size="sm"
                    onClick={() => window.open(application.cv_url!, '_blank')}
                  >
                    <IconFileText size={15} />
                    Lihat Dokumen CV (PDF) ↗
                  </Button>
                ) : (
                  <Badge tone="pink">Dokumen CV Tidak Ditemukan</Badge>
                )}

                {application.surat_lamaran_url && (
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => window.open(application.surat_lamaran_url!, '_blank')}
                  >
                    <IconFileText size={15} />
                    Lihat Surat Lamaran (PDF) ↗
                  </Button>
                )}
              </div>
            </Stack>
          </Card>
        </Stack>
      </div>
    </AppLayout>
  )
}
