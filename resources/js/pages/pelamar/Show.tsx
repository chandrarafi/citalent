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
  foto_url?: string | null
  cv_url?: string | null
  surat_lamaran_url?: string | null
  status: string
  catatan?: string | null
  lowongan?: {
    id: number
    kode_lowongan: string
    judul: string
    departemen_nama?: string
    posisi_nama?: string
  } | null
  created_at?: string | null
}

interface Props {
  pelamar: PelamarDetail
}

const TIMELINE_STAGES = [
  {
    step: 1,
    key: 'submitted',
    title: 'Submit Lamaran',
    defaultDesc: 'Data pendaftaran & berkas berhasil dikirim',
  },
  {
    step: 2,
    key: 'screening_cv',
    title: 'Screening CV',
    defaultDesc: 'Pemeriksaan berkas & kualifikasi oleh HR',
  },
  {
    step: 3,
    key: 'interview_hr',
    title: 'Interview HR',
    defaultDesc: 'Wawancara awal & background check',
  },
  {
    step: 4,
    key: 'skill_test',
    title: 'Skill Test',
    defaultDesc: 'Uji kompetensi teknis / tes keahlian',
  },
  {
    step: 5,
    key: 'interview_user',
    title: 'Interview User',
    defaultDesc: 'Wawancara dengan calon atasan / User',
  },
  {
    step: 6,
    key: 'final_discussion',
    title: 'Final Discussion',
    defaultDesc: 'Diskusi offering letter & kesepakatan join',
  },
]

const STATUS_SELECT_OPTIONS = [
  { value: 'submitted', label: '1. Submit Lamaran' },
  { value: 'screening_cv', label: '2. Screening CV' },
  { value: 'interview_hr', label: '3. Interview HR' },
  { value: 'skill_test', label: '4. Skill Test' },
  { value: 'interview_user', label: '5. Interview User' },
  { value: 'final_discussion', label: '6. Final Discussion' },
  { value: 'accepted', label: '✓ Lolos / Diterima Bekerja (Accepted)' },
  { value: 'rejected', label: '✗ Ditolak (Rejected)' },
]

const STATUS_TONE: Record<string, Tone> = {
  submitted: 'yellow',
  screening_cv: 'blue',
  interview_hr: 'purple',
  skill_test: 'orange',
  interview_user: 'blue',
  final_discussion: 'mint',
  accepted: 'mint',
  rejected: 'pink',
  review: 'blue',
  interview: 'purple',
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submit Lamaran',
  screening_cv: 'Screening CV',
  interview_hr: 'Interview HR',
  skill_test: 'Skill Test',
  interview_user: 'Interview User',
  final_discussion: 'Final Discussion',
  accepted: 'Diterima Bekerja',
  rejected: 'Ditolak',
  review: 'Screening CV',
  interview: 'Interview HR',
}

export default function Show({ pelamar }: Props) {
  const { flash } = usePage<any>().props

  // Stage dialog modal states
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>(
    pelamar.status === 'review' ? 'screening_cv' : pelamar.status === 'interview' ? 'interview_hr' : pelamar.status
  )
  const [catatanInput, setCatatanInput] = useState<string>(pelamar.catatan || '')
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false)

  // Normalize legacy status
  const normalizedStatus = pelamar.status === 'review' ? 'screening_cv' : pelamar.status === 'interview' ? 'interview_hr' : pelamar.status

  const currentStageIndex = TIMELINE_STAGES.findIndex((s) => s.key === normalizedStatus)
  const isRejected = normalizedStatus === 'rejected'
  const isAccepted = normalizedStatus === 'accepted'

  // Next stage calculation
  const nextStage = !isRejected && !isAccepted && currentStageIndex >= 0 && currentStageIndex < TIMELINE_STAGES.length - 1
    ? TIMELINE_STAGES[currentStageIndex + 1]
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
                Lowongan: <strong>{pelamar.lowongan?.judul ?? '—'}</strong> ({pelamar.lowongan?.kode_lowongan ?? '—'}) &bull; Tanggal Melamar: <strong>{pelamar.created_at ?? '—'}</strong>
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
                {pelamar.foto_url ? (
                  <div className="w-28 h-36 rounded-[14px] overflow-hidden border-2 border-[#a855f7] shadow-sm bg-black/5">
                    <img
                      src={pelamar.foto_url}
                      alt={pelamar.nama_lengkap}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-36 rounded-[14px] border-2 border-dashed border-[var(--color-line)] bg-[var(--color-surface)] flex flex-col items-center justify-center text-center p-2 text-muted">
                    <Blob icon="user" tone="purple" size="sm" />
                    <span className="text-[10px] mt-1 font-semibold">Tanpa Foto</span>
                  </div>
                )}
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
              {pelamar.cv_url ? (
                <Button
                  tone="purple"
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
                  onClick={() => window.open(pelamar.surat_lamaran_url!, '_blank')}
                >
                  Buka Surat Lamaran (PDF) ↗
                </Button>
              )}
            </Row>
          </Stack>
        </Card>

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
                {TIMELINE_STAGES.map((stage, idx) => {
                  const isLast = idx === TIMELINE_STAGES.length - 1
                  let stepState: 'completed' | 'current' | 'upcoming' | 'rejected' = 'upcoming'

                  if (isRejected) {
                    stepState = idx <= (currentStageIndex >= 0 ? currentStageIndex : 0) ? 'rejected' : 'upcoming'
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
                            ? 'border-2 border-red-500 bg-red-50 text-red-600'
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
                                ? 'text-red-700'
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
                            <Badge tone="pink">Ditolak</Badge>
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
                  options={STATUS_SELECT_OPTIONS}
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
    </AppLayout>
  )
}
