import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge, Blob } from '@/components/pouf/media'
import { Confirm, Dialog, Select } from '@/components/pouf/controls'
import { Field, Input } from '@/components/pouf/Input'
import type { Tone } from '@/components/pouf/tone'
import {
  IconCheck,
  IconX,
  IconArrowRight,
  IconAward,
  IconNotes,
  IconFileText,
  IconCalendarEvent,
  IconVideo,
  IconMapPin,
  IconBell,
  IconClock,
  IconExternalLink,
  IconSparkles,
  IconRefresh,
  IconShieldCheck,
} from '@tabler/icons-react'

interface PelamarDetail {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir?: string | null
  jenis_kelamin: 'Laki-laki' | 'Perempuan'
  status_pernikahan: string
  agama: string
  alamat: string
  domisili: string
  nomor_kontak: string
  email: string
  pendidikan_terakhir: string
  nama_institusi: string
  jurusan: string
  tahun_lulus: string
  posisi_dilamar: string
  sumber_informasi?: string | null
  foto_url?: string | null
  cv_url?: string | null
  surat_lamaran_url?: string | null
  has_formulir?: boolean
  formulir_submitted?: boolean
  status: string
  tahap_gagal?: string | null
  catatan?: string | null
  lowongan?: {
    id: number
    kode_lowongan: string
    judul: string
    departemen_nama?: string
    posisi_nama?: string
    kd_jabatan?: string
  } | null
  skill_test_assessment?: {
    id: number
    total_skor: number
    nilai_akhir: number
    rekomendasi: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
    status: 'draft' | 'final'
    tanggal_test?: string | null
    nama_penguji?: string | null
  } | null
  penjadwalan_interviews?: Array<{
    id: number
    tahap: string
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
    status_kehadiran: string
    reminder_sent_at?: string | null
  }>
  ats_screening?: {
    id: number
    divisi: string
    total_skor: number
    rekomendasi: 'sangat_disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
    rekomendasi_label: string
    rekomendasi_tone: Tone
    status_konfirmasi: 'menunggu_konfirmasi' | 'disetujui' | 'ditolak'
    status_konfirmasi_label: string
    status_konfirmasi_tone: Tone
    kriteria_penilaian?: Array<{
      kriteria: string
      kebutuhan: string
      data_kandidat: string
      nilai: number
      bobot_max: number
      status_cocok: boolean
    }>
    cv_parsed_data?: {
      skills?: string[]
      pengalaman_label?: string
      bahasa?: string[]
    }
    catatan_ats?: string | null
    catatan_hr?: string | null
    confirmed_by_name?: string | null
    confirmed_at?: string | null
  } | null
  created_at?: string | null
}

interface Props {
  pelamar: PelamarDetail
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

const STATUS_SELECT_OPTIONS = [
  { value: 'submitted', label: '1. Submit Lamaran' },
  { value: 'screening_cv', label: '2. Screening CV' },
  { value: 'lengkapi_formulir', label: '3. Lengkapi Formulir Lamaran Kerja' },
  { value: 'skill_test', label: '4. Skill Test' },
  { value: 'interview_hr', label: '5. Interview HR' },
  { value: 'interview_user', label: '6. Interview User' },
  { value: 'interview_gm', label: '7. Interview GM' },
  { value: 'final_discussion', label: '8. Final Discussion' },
  { value: 'accepted', label: '✓ Lolos / Diterima Bekerja (Accepted)' },
  { value: 'rejected', label: '✗ Ditolak (Rejected)' },
]

const STATUS_TONE: Record<string, Tone> = {
  submitted: 'yellow',
  screening_cv: 'blue',
  lengkapi_formulir: 'purple',
  interview_hr: 'purple',
  skill_test: 'orange',
  interview_user: 'blue',
  interview_gm: 'purple',
  final_discussion: 'mint',
  accepted: 'mint',
  rejected: 'pink',
  review: 'blue',
  interview: 'purple',
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submit Lamaran',
  screening_cv: 'Screening CV',
  lengkapi_formulir: 'Lengkapi Formulir Lamaran Kerja',
  interview_hr: 'Interview HR',
  skill_test: 'Skill Test',
  interview_user: 'Interview User',
  interview_gm: 'Interview GM',
  final_discussion: 'Final Discussion',
  accepted: 'Diterima Bekerja',
  rejected: 'Ditolak',
  review: 'Screening CV',
  interview: 'Interview HR',
}

export default function Show({ pelamar }: Props) {
  const { flash } = usePage<any>().props

  // Check if position requires skill test (JBT-5, JBT-27, JBT-28, JBT-29, JBT-31, JBT-26)
  const hasSkillTest = pelamar.lowongan?.kd_jabatan
    ? SKILL_TEST_JABATAN_CODES.includes(pelamar.lowongan.kd_jabatan)
    : false

  // Check if position requires interview GM (JBT-6, JBT-37)
  const hasInterviewGm = pelamar.lowongan?.kd_jabatan
    ? INTERVIEW_GM_JABATAN_CODES.includes(pelamar.lowongan.kd_jabatan)
    : false

  // Dynamic active stages
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

  const statusSelectOptions = STATUS_SELECT_OPTIONS.filter((opt) => {
    if (opt.value === 'skill_test') {
      return hasSkillTest
    }
    if (opt.value === 'interview_gm') {
      return hasInterviewGm
    }
    return true
  }).map((opt, idx) => {
    if (opt.value !== 'accepted' && opt.value !== 'rejected') {
      return {
        ...opt,
        label: `${idx + 1}. ${opt.label.replace(/^[0-9]+\.\s*/, '')}`,
      }
    }
    return opt
  })

  // Stage dialog modal states
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>(
    pelamar.status === 'review' ? 'screening_cv' : pelamar.status === 'interview' ? 'interview_hr' : pelamar.status
  )
  const [catatanInput, setCatatanInput] = useState<string>(pelamar.catatan || '')
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false)

  // ATS Screening modal states
  const [atsModalOpen, setAtsModalOpen] = useState(false)
  const [atsDecision, setAtsDecision] = useState<'approve' | 'reject'>('approve')
  const [atsNextStage, setAtsNextStage] = useState('lengkapi_formulir')
  const [atsCatatan, setAtsCatatan] = useState(pelamar.ats_screening?.catatan_hr || '')
  const [isSubmittingAts, setIsSubmittingAts] = useState(false)

  function handleOpenAtsConfirm(decision: 'approve' | 'reject') {
    setAtsDecision(decision)
    setAtsCatatan(
      pelamar.ats_screening?.catatan_hr ||
        (decision === 'approve'
          ? 'Lolos screening otomatis ATS.'
          : 'Kualifikasi belum sesuai kriteria posisi.')
    )
    setAtsModalOpen(true)
  }

  function submitAtsConfirm() {
    setIsSubmittingAts(true)
    router.post(
      `/screening-cv/${pelamar.id}/confirm`,
      {
        keputusan: atsDecision,
        catatan_hr: atsCatatan,
        tahap_berikutnya: atsDecision === 'approve' ? atsNextStage : undefined,
      },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmittingAts(false)
          setAtsModalOpen(false)
        },
      }
    )
  }

  function handleRunAtsSingle() {
    setIsSubmittingAts(true)
    router.post(
      `/screening-cv/${pelamar.id}/run`,
      {},
      {
        preserveScroll: true,
        onFinish: () => setIsSubmittingAts(false),
      }
    )
  }

  // Normalize legacy status
  const normalizedStatus = pelamar.status === 'review' ? 'screening_cv' : pelamar.status === 'interview' ? 'interview_hr' : pelamar.status

  const currentStageIndex = activeStages.findIndex((s) => s.key === normalizedStatus)
  const isRejected = normalizedStatus === 'rejected'
  const isAccepted = normalizedStatus === 'accepted'

  const failedStageKey = isRejected
    ? pelamar.tahap_gagal || (pelamar.skill_test_assessment ? 'skill_test' : (pelamar.has_formulir ? (hasSkillTest ? 'skill_test' : 'screening_cv') : 'submitted'))
    : null
  const failedStageIndex = failedStageKey
    ? activeStages.findIndex((s) => s.key === failedStageKey)
    : -1
  const failedStageObj = failedStageIndex >= 0 ? activeStages[failedStageIndex] : null

  // Next stage calculation based on activeStages
  const nextStage = !isRejected && !isAccepted && currentStageIndex >= 0 && currentStageIndex < activeStages.length - 1
    ? activeStages[currentStageIndex + 1]
    : null

  function handleUpdateStatus(statusToSave: string, notes?: string) {
    setIsSubmittingStatus(true)
    router.put(
      `/pelamar/${pelamar.id}/status`,
      {
        status: statusToSave,
        catatan: notes !== undefined ? notes : catatanInput,
      },
      {
        onFinish: () => {
          setIsSubmittingStatus(false)
          setUpdateModalOpen(false)
        },
      }
    )
  }

  function handleQuickAdvance() {
    if (nextStage) {
      handleUpdateStatus(nextStage.key, catatanInput)
    } else if (normalizedStatus === 'final_discussion') {
      handleUpdateStatus('accepted', catatanInput)
    }
  }

  function destroy() {
    router.delete(`/pelamar/${pelamar.id}`)
  }

  return (
    <AppLayout>
      <Head title={`Detail Pelamar - ${pelamar.nama_lengkap}`} />
      <Stack gap={5}>
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Row gap={2} align="center">
            <Badge tone={STATUS_TONE[pelamar.status] || 'yellow'}>
              STATUS: {STATUS_LABEL[pelamar.status] || pelamar.status.toUpperCase()}
            </Badge>
            <Text size="sm" muted mono>
              No. Registrasi: <strong>{pelamar.no_pendaftaran}</strong>
            </Text>
          </Row>

          <Button
            tone="blue"
            size="sm"
            onClick={() => router.get('/pelamar')}
          >
            ← Kembali ke Daftar Pelamar
          </Button>
        </div>

        {/* Flash Notifications */}
        {(flash as any)?.success && (
          <Card variant="tight">
            <Row gap={2} align="center">
              <Blob icon="ok" tone="mint" size="sm" />
              <Text>{(flash as any).success}</Text>
            </Row>
          </Card>
        )}

        {/* 1. Lowongan yang Dilamar Banner */}
        <Card variant="tight">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
            <Stack gap={1} className="flex-1 min-w-0">
              <Eyebrow>{pelamar.lowongan?.departemen_nama ?? 'Departemen'}</Eyebrow>
              <Heading level={2}>Posisi Dilamar: {pelamar.posisi_dilamar}</Heading>
              <Text size="sm" muted>
                Lowongan: <strong>{pelamar.lowongan?.judul ?? '—'}</strong> ({pelamar.lowongan?.kode_lowongan ?? '—'}) &bull; Tanggal Melamar: <strong>{pelamar.created_at ?? '—'}</strong> &bull; Sumber Informasi: <strong className="text-purple-700">{pelamar.sumber_informasi || 'Website Karir Perusahaan'}</strong>
              </Text>
            </Stack>
            {pelamar.lowongan && (
              <Button
                variant="quiet"
                size="sm"
                tone="purple"
                onClick={() => router.get(`/lowongan/${pelamar.lowongan!.id}`)}
                className="w-full sm:w-auto shrink-0"
              >
                Lihat Detail Lowongan ↗
              </Button>
            )}
          </div>
        </Card>
     
        {/* 3. Data Pribadi Kandidat */}
        <Card>
          <Stack gap={4}>
            <Row gap={2} align="center">
              <Blob icon="user" tone="purple" size="sm" />
              <Heading level={2}>1. Data Pribadi Kandidat</Heading>
            </Row>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Pas Foto Pelamar */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-28 h-36 rounded-[14px] overflow-hidden border-2 border-[#a855f7] shadow-sm bg-black/5">
                  <img
                    src={pelamar.foto_url || '/assets/images/user.png'}
                    alt={pelamar.nama_lengkap}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/user.png'
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-muted mt-1.5">Pas Foto Formal</span>
              </div>

              {/* Data Grid */}
              <div className="flex-1 w-full">
                <Grid cols={2}>
                  <Stack gap={1}>
                    <Text size="sm" muted>Nama Lengkap (Sesuai KTP):</Text>
                    <Text><strong>{pelamar.nama_lengkap}</strong></Text>
                  </Stack>
                  <Stack gap={1}>
                    <Text size="sm" muted>Tempat, Tanggal Lahir:</Text>
                    <Text>{pelamar.tempat_lahir}, {pelamar.tanggal_lahir ?? '—'}</Text>
                  </Stack>
                  <Stack gap={1}>
                    <Text size="sm" muted>Jenis Kelamin:</Text>
                    <Text>{pelamar.jenis_kelamin}</Text>
                  </Stack>
                  <Stack gap={1}>
                    <Text size="sm" muted>Status Pernikahan & Agama:</Text>
                    <Text>{pelamar.status_pernikahan} &bull; {pelamar.agama}</Text>
                  </Stack>
                  <Stack gap={1}>
                    <Text size="sm" muted>Nomor WhatsApp / HP Aktif:</Text>
                    <Text mono><strong>{pelamar.nomor_kontak}</strong></Text>
                  </Stack>
                  <Stack gap={1}>
                    <Text size="sm" muted>Email Aktif:</Text>
                    <Text mono><strong>{pelamar.email}</strong></Text>
                  </Stack>
                  <Stack gap={1}>
                    <Text size="sm" muted>Kota Domisili Saat Ini:</Text>
                    <Text>{pelamar.domisili}</Text>
                  </Stack>
                  <Stack gap={1}>
                    <Text size="sm" muted>Alamat Lengkap KTP:</Text>
                    <Text>{pelamar.alamat}</Text>
                  </Stack>
                </Grid>
              </div>
            </div>
          </Stack>
        </Card>

        {/* 4. Riwayat Pendidikan */}
        <Card>
          <Stack gap={4}>
            <Row gap={2} align="center">
              <Blob icon="target" tone="blue" size="sm" />
              <Heading level={2}>2. Riwayat Pendidikan Terakhir</Heading>
            </Row>

            <Grid cols={2}>
              <Stack gap={1}>
                <Text size="sm" muted>Jenjang Pendidikan:</Text>
                <Text><strong>{pelamar.pendidikan_terakhir}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Nama Institusi / Universitas / Sekolah:</Text>
                <Text><strong>{pelamar.nama_institusi}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Jurusan:</Text>
                <Text>{pelamar.jurusan}</Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Tahun Kelulusan:</Text>
                <Text mono>{pelamar.tahun_lulus}</Text>
              </Stack>
            </Grid>
          </Stack>
        </Card>

        {/* 5. Dokumen & Berkas Lamaran */}
        <Card>
          <Stack gap={4}>
            <Row gap={2} align="center">
              <Blob icon="database" tone="mint" size="sm" />
              <Heading level={2}>3. Dokumen & Berkas Lamaran</Heading>
            </Row>

            <Row gap={3} wrap={true}>
              <Button
                tone="mint"
                onClick={() => router.visit(`/pelamar/${pelamar.id}/formulir`)}
              >
                <IconFileText size={16} />
                {pelamar.formulir_submitted
                  ? 'Lihat Formulir Lamaran Kerja (Lengkap) ↗'
                  : 'Buka Formulir Lamaran Kerja ↗'}
              </Button>

              {pelamar.cv_url ? (
                <Button
                  tone="purple"
                  variant="quiet"
                  onClick={() => window.open(pelamar.cv_url!, '_blank')}
                >
                  Buka & Unduh CV Pelamar (PDF) ↗
                </Button>
              ) : (
                <Badge tone="pink">Berkas CV Tidak Ditemukan</Badge>
              )}

              {pelamar.surat_lamaran_url && (
                <Button
                  tone="mint"
                  variant="quiet"
                  onClick={() => window.open(pelamar.surat_lamaran_url!, '_blank')}
                >
                  Buka Surat Lamaran (PDF) ↗
                </Button>
              )}
            </Row>
          </Stack>
        </Card>

        {/* 4. Hasil Screening Otomatis ATS & Konfirmasi HR */}
        {pelamar.ats_screening ? (
          <Card>
            <Stack gap={4}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--color-line)]">
                <Row gap={2} align="center">
                  <Blob icon="target" tone="purple" size="sm" />
                  <div>
                    <Row gap={2} align="center">
                      <Heading level={2}>4. Hasil Screening Otomatis ATS (Applicant Tracking System)</Heading>
                      <Badge tone="purple">Divisi {pelamar.ats_screening.divisi}</Badge>
                    </Row>
                    <Text size="sm" muted>
                      Evaluasi pencocokan berkas & kriteria otomatis berbasis ATS dengan konfirmasi keputusan oleh HR.
                    </Text>
                  </div>
                </Row>

                <Row gap={2} align="center" wrap={true}>
                  <Button
                    size="sm"
                    variant="quiet"
                    tone="blue"
                    onClick={handleRunAtsSingle}
                    disabled={isSubmittingAts}
                  >
                    <IconRefresh size={13} className="mr-1" />
                    Screening Ulang ATS
                  </Button>
                </Row>
              </div>

              {/* ATS Metric Highlight */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                pelamar.ats_screening.rekomendasi === 'sangat_disarankan'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : pelamar.ats_screening.rekomendasi === 'dipertimbangkan'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={pelamar.ats_screening.rekomendasi_tone}>
                      {pelamar.ats_screening.rekomendasi_label}
                    </Badge>
                    <Badge tone={pelamar.ats_screening.status_konfirmasi_tone}>
                      {pelamar.ats_screening.status_konfirmasi_label}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {pelamar.ats_screening.catatan_ats}
                  </div>
                  {pelamar.ats_screening.confirmed_at && (
                    <div className="text-xs text-slate-500">
                      Dikonfirmasi oleh: <strong>{pelamar.ats_screening.confirmed_by_name || 'HR'}</strong> pada {pelamar.ats_screening.confirmed_at}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-center sm:text-right bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Skor ATS</div>
                  <div className="text-3xl font-black font-mono text-purple-700">
                    {pelamar.ats_screening.total_skor.toFixed(0)} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Kriteria Breakdown Table */}
              {pelamar.ats_screening.kriteria_penilaian && pelamar.ats_screening.kriteria_penilaian.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Kriteria</th>
                        <th className="py-2.5 px-3">Kebutuhan Posisi</th>
                        <th className="py-2.5 px-3">Data Kandidat</th>
                        <th className="py-2.5 px-3 text-right">Nilai / Bobot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pelamar.ats_screening.kriteria_penilaian.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {item.status_cocok ? (
                                <IconCheck size={14} className="text-emerald-600 shrink-0" stroke={3} />
                              ) : (
                                <IconX size={14} className="text-rose-500 shrink-0" stroke={3} />
                              )}
                              <span>{item.kriteria}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{item.kebutuhan}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{item.data_kandidat}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                            <span className={item.status_cocok ? 'text-emerald-700' : 'text-slate-500'}>
                              {item.nilai}
                            </span>{' '}
                            / {item.bobot_max}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Action bar for HR confirmation */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-purple-900">
                    <IconShieldCheck size={16} />
                    <span>Konfirmasi Hasil Screening oleh HR</span>
                  </div>
                  <div className="text-xs text-purple-700 mt-0.5">
                    {pelamar.ats_screening.status_konfirmasi === 'menunggu_konfirmasi'
                      ? 'Hasil otomatis membutuhkan konfirmasi Anda sebelum kandidat dapat dilanjutkan ke tahap seleksi berikutnya.'
                      : `Status saat ini: ${pelamar.ats_screening.status_konfirmasi_label}. Anda tetap dapat memperbarui konfirmasi kapan saja.`}
                  </div>
                </div>

                <Row gap={2} align="center" wrap={true}>
                  <Button
                    tone="mint"
                    size="sm"
                    disabled={isSubmittingAts}
                    onClick={() => handleOpenAtsConfirm('approve')}
                  >
                    <IconCheck size={14} className="mr-1" />
                    Konfirmasi Lolos ➔
                  </Button>
                  <Button
                    tone="pink"
                    size="sm"
                    disabled={isSubmittingAts}
                    onClick={() => handleOpenAtsConfirm('reject')}
                  >
                    <IconX size={14} className="mr-1" />
                    Konfirmasi Ditolak
                  </Button>
                </Row>
              </div>
            </Stack>
          </Card>
        ) : (
          <Card variant="tight">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Blob icon="target" tone="purple" size="sm" />
                <div>
                  <div className="font-bold text-sm text-slate-800">Screening Otomatis ATS Belum Dijalankan</div>
                  <div className="text-xs text-slate-500">Jalankan evaluasi kriteria dan pembobotan skor CV untuk kandidat ini.</div>
                </div>
              </div>
              <Button
                tone="purple"
                size="sm"
                onClick={handleRunAtsSingle}
                disabled={isSubmittingAts}
              >
                <IconRefresh size={14} className="mr-1" />
                Jalankan Auto-Screening ATS Sekarang
              </Button>
            </div>
          </Card>
        )}

        {/* 2. Timeline Tahapan Rekrutmen (Vertical Stepper Style) */}
        <Card>
          <Stack gap={4}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 ">
              <Row gap={2} align="center">
                <Blob icon="target" tone="mint" size="sm" />
                <div>
                  <Heading level={2}>Tahapan Rekrutmen</Heading>
                  <Text size="sm" muted>
                    Perkembangan proses seleksi kandidat secara berurutan.
                  </Text>
                </div>
              </Row>

              <Row gap={2} align="center" wrap={true}>
                {nextStage && (
                  <Button
                    tone="mint"
                    size="sm"
                    disabled={isSubmittingStatus}
                    onClick={handleQuickAdvance}
                  >
                    <span>Lanjutkan ke {nextStage.title} ➔</span>
                  </Button>
                )}

                {normalizedStatus === 'final_discussion' && (
                  <Button
                    tone="mint"
                    size="sm"
                    disabled={isSubmittingStatus}
                    onClick={() => handleUpdateStatus('accepted')}
                  >
                    <IconAward size={14} />
                    <span>Terima Bekerja (Accepted) ✓</span>
                  </Button>
                )}

                <Button
                  tone="blue"
                  size="sm"
                  onClick={() => {
                    setSelectedStatus(normalizedStatus)
                    setCatatanInput(pelamar.catatan || '')
                    setUpdateModalOpen(true)
                  }}
                >
                  Perbarui Tahapan
                </Button>
              </Row>
            </div>

            {/* Vertical Timeline List (Image reference style) */}
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

                      {/* Circle Node (Icon / Checkmark / Outline) */}
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

                      {/* Text Column (Title & Subtitle/Timestamp) */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`text-sm font-semibold tracking-tight ${
                              stepState === 'current'
                                ? 'text-emerald-800 font-bold'
                                : stepState === 'completed'
                                ? 'text-[#18181b]'
                                : stepState === 'rejected'
                                ? 'text-red-700 font-bold'
                                : 'text-[#71717a]'
                            }`}
                          >
                            {stage.title}
                          </span>

                          {stepState === 'current' && (
                            <Badge tone="mint">Sedang Berlangsung</Badge>
                          )}
                          {stepState === 'completed' && (
                            <Badge tone="mint">Selesai</Badge>
                          )}
                          {stepState === 'rejected' && (
                            <Badge tone="pink">Gagal di Tahap Ini</Badge>
                          )}
                        </div>

                        <div className="text-xs text-[#71717a] mt-0.5 font-medium">
                          {stage.key === 'submitted' && pelamar.created_at ? (
                            <span className="font-mono">{pelamar.created_at}</span>
                          ) : stepState === 'completed' ? (
                            <span className="text-emerald-700">Tahapan telah diselesaikan</span>
                          ) : stepState === 'current' ? (
                            <span className="text-emerald-600">{stage.defaultDesc}</span>
                          ) : (
                            <span className="text-[#a1a1aa]">Pending</span>
                          )}
                        </div>

                        {stage.key === 'lengkapi_formulir' && (pelamar.has_formulir || stepState === 'current' || stepState === 'completed') && (
                          <div className="mt-2">
                            <Button
                              tone="mint"
                              size="sm"
                              onClick={() => router.visit(`/pelamar/${pelamar.id}/formulir`)}
                            >
                              <IconFileText size={14} />
                              {pelamar.formulir_submitted
                                ? 'Tinjau Formulir Lamaran Kandidat'
                                : 'Lihat Status Formulir Lamaran'}
                            </Button>
                          </div>
                        )}

                        {/* Interview Stage Detail & Actions */}
                        {['interview_hr', 'interview_user', 'interview_gm'].includes(stage.key) && (() => {
                          const sched = pelamar.penjadwalan_interviews?.find((s) => s.tahap === stage.key)
                          if (sched) {
                            return (
                              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <IconCalendarEvent size={15} className="text-purple-600" />
                                    <span>{sched.tanggal_formatted}</span>
                                    <span className="text-slate-400">•</span>
                                    <IconClock size={14} className="text-slate-400" />
                                    <span>{sched.waktu_formatted}</span>
                                  </div>
                                  <Badge tone={sched.status_kehadiran === 'attended' ? 'mint' : sched.status_kehadiran === 'not_attended' ? 'pink' : 'blue'}>
                                    {sched.status_kehadiran === 'attended' ? 'Hadir' : sched.status_kehadiran === 'not_attended' ? 'Tidak Hadir' : 'Dijadwalkan'}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-2 text-slate-600">
                                  {sched.tipe_interview === 'online' ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                        <IconVideo size={13} />
                                        Online Meeting:
                                      </span>
                                      {sched.link_meeting && (
                                        <a
                                          href={sched.link_meeting}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                                        >
                                          Buka Link Meet <IconExternalLink size={12} />
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-slate-700">
                                      <IconMapPin size={13} className="text-emerald-600" />
                                      <span>Lokasi: {sched.lokasi || 'Kantor Pusat'}</span>
                                    </div>
                                  )}
                                </div>

                                {sched.pewawancara_nama && (
                                  <div className="text-slate-500">
                                    Pewawancara: <span className="font-semibold text-slate-700">{sched.pewawancara_nama}</span>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                  <div className="text-[11px] text-slate-400">
                                    {sched.reminder_sent_at ? (
                                      <span>Reminder terkirim: {sched.reminder_sent_at}</span>
                                    ) : (
                                      <span>Belum dikirim reminder</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="quiet"
                                      tone="purple"
                                      className="h-7 text-xs px-2"
                                      onClick={() => {
                                        router.post(`/penjadwalan-interview/${sched.id}/send-reminder`, {}, {
                                          preserveScroll: true,
                                        })
                                      }}
                                    >
                                      <IconBell size={13} className="mr-1" />
                                      Kirim Reminder
                                    </Button>
                                    <Button
                                      size="sm"
                                      tone="blue"
                                      className="h-7 text-xs px-2"
                                      onClick={() => router.visit('/penjadwalan-interview?search=' + encodeURIComponent(pelamar.nama_lengkap))}
                                    >
                                      Kelola di Jadwal
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          }

                          if (stepState === 'current') {
                            return (
                              <div className="mt-2.5">
                                <Button
                                  size="sm"
                                  tone="purple"
                                  onClick={() =>
                                    router.visit(
                                      `/penjadwalan-interview/create?pelamar_id=${pelamar.id}&tahap=${stage.key}`
                                    )
                                  }
                                >
                                  <IconCalendarEvent size={14} className="mr-1" />
                                  Jadwalkan Wawancara ({stage.title})
                                </Button>
                              </div>
                            )
                          }

                          return null
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recruiter Notes / Catatan Stage Info */}
            <div className="p-3.5 rounded-[12px] bg-[var(--color-surface)] ">
              <Row justify="between" align="center" wrap={true} gap={2}>
                <div className="flex items-center gap-2">
                  <IconNotes size={16} className="text-[#7c3aed]" />
                  <Text size="sm">
                    <strong>Catatan Rekrutmen:</strong>{' '}
                    <span className={pelamar.catatan ? 'text-[var(--color-ink)]' : 'text-muted italic'}>
                      {pelamar.catatan || 'Belum ada catatan khusus untuk tahapan ini.'}
                    </span>
                  </Text>
                </div>

                <Button
                  variant="quiet"
                  tone="purple"
                  size="sm"
                  onClick={() => {
                    setSelectedStatus(normalizedStatus)
                    setCatatanInput(pelamar.catatan || '')
                    setUpdateModalOpen(true)
                  }}
                  className="py-0.5 px-2 text-xs ml-auto"
                >
                  Edit Catatan
                </Button>
              </Row>
            </div>
          </Stack>
        </Card>

        {/* Bottom Actions: Delete Candidate */}
        <Card variant="tight">
          <Row justify="between" align="center">
            <Confirm
              title={`Hapus Data Pelamar "${pelamar.nama_lengkap}"?`}
              body="Seluruh data lamaran dan berkas PDF CV/Surat lamaran akan dihapus secara permanen dari server."
              confirmLabel="Hapus Data Pelamar"
              cancelLabel="Batalkan"
              tone="orange"
              onConfirm={destroy}
            >
              <Button tone="pink">
                Hapus Data Pelamar
              </Button>
            </Confirm>

            <Button onClick={() => router.get('/pelamar')}>
              Kembali ke Daftar
            </Button>
          </Row>
        </Card>
      </Stack>

      {/* Dialog Modal: Perbarui Tahapan Seleksi & Catatan */}
      {updateModalOpen && (
        <Dialog
          open={updateModalOpen}
          onOpenChange={(open) => setUpdateModalOpen(open)}
          title="Perbarui Tahapan Seleksi Kandidat"
          description={`Pilih tahapan seleksi terbaru untuk ${pelamar.nama_lengkap}.`}
          size="md"
        >
          <Stack gap={4}>
            <Field label="Tahapan Seleksi">
              {() => (
                <Select
                  value={selectedStatus}
                  onChange={(v) => setSelectedStatus(v)}
                  options={statusSelectOptions}
                />
              )}
            </Field>

            <Field label="Catatan / Feedback Tahapan (Opsional)">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={catatanInput}
                  onChange={(v) => setCatatanInput(v)}
                  placeholder="contoh: Lolos tes teknis dengan nilai 85, lanjut interview user pada hari Kamis..."
                />
              )}
            </Field>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-line)]">
              <Button
                variant="quiet"
                tone="pink"
                size="sm"
                disabled={isSubmittingStatus}
                onClick={() => handleUpdateStatus('rejected')}
              >
                Tolak Lamaran (Rejected)
              </Button>

              <Row gap={2} align="center">
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => setUpdateModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  tone="purple"
                  size="sm"
                  disabled={isSubmittingStatus}
                  onClick={() => handleUpdateStatus(selectedStatus)}
                >
                  {isSubmittingStatus ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </Row>
            </div>
          </Stack>
        </Dialog>
      )}

      {/* Dialog Modal: Konfirmasi Hasil Screening ATS */}
      {atsModalOpen && (
        <Dialog
          open={atsModalOpen}
          onOpenChange={(open) => setAtsModalOpen(open)}
          title="Konfirmasi Hasil Screening ATS"
          description={`Terapkan keputusan HR atas hasil screening otomatis untuk ${pelamar.nama_lengkap}.`}
          size="md"
        >
          <Stack gap={4}>
            <div className={`p-3.5 rounded-xl border ${
              atsDecision === 'approve'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="font-bold text-sm">
                {atsDecision === 'approve'
                  ? '✓ Kandidat Dinyatakan LOLOS Screening CV'
                  : '✗ Kandidat Dinyatakan DITOLAK (Gagal Screening)'}
              </div>
              <div className="text-xs mt-1 opacity-80">
                Skor ATS:{' '}
                <strong>
                  {pelamar.ats_screening?.total_skor.toFixed(0) || 0} / 100
                </strong>{' '}
                ({pelamar.ats_screening?.rekomendasi_label || '-'})
              </div>
            </div>

            {atsDecision === 'approve' && (
              <Field label="Tahapan Seleksi Lanjutan">
                {() => (
                  <Select
                    value={atsNextStage}
                    onChange={(v) => setAtsNextStage(v)}
                    options={[
                      { value: 'lengkapi_formulir', label: '1. Lengkapi Formulir Lamaran Kerja' },
                      { value: 'skill_test', label: '2. Skill Test / Uji Kompetensi' },
                      { value: 'interview_hr', label: '3. Interview HR' },
                    ]}
                  />
                )}
              </Field>
            )}

            <Field label="Catatan / Feedback Tambahan HR (Opsional)">
              {(id, describedBy) => (
                <Input
                  id={id}
                  describedBy={describedBy}
                  value={atsCatatan}
                  onChange={(v) => setAtsCatatan(v)}
                  placeholder="Catatan verifikasi berkas oleh HR..."
                />
              )}
            </Field>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-line)]">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setAtsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                tone={atsDecision === 'approve' ? 'mint' : 'pink'}
                disabled={isSubmittingAts}
                onClick={submitAtsConfirm}
              >
                {isSubmittingAts
                  ? 'Menyimpan...'
                  : atsDecision === 'approve'
                  ? 'Konfirmasi Loloskan ➔'
                  : 'Konfirmasi Ditolak ✗'}
              </Button>
            </div>
          </Stack>
        </Dialog>
      )}
    </AppLayout>
  )
}
