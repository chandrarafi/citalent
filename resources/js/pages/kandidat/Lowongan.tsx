import { useState, useEffect } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge, Blob } from '@/components/pouf/media'
import { Input } from '@/components/pouf/Input'
import { Select, Dialog } from '@/components/pouf/controls'
import { Separator } from '@/components/pouf/separator'
import {
  IconSearch,
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconAlertCircle,
  IconEye,
  IconSend,
} from '@tabler/icons-react'

interface Posisi {
  id: number
  kd_jabatan: string
  nama_jabatan: string
}

interface LowonganItem {
  id: number
  kode_lowongan: string
  slug: string
  judul: string
  posisi_nama: string
  posisi_id?: number | null
  kd_jabatan: string
  departement_nama: string
  kd_departement: string
  jumlah_dibutuhkan: number
  lokasi_kerja: string
  tipe_pekerjaan: string
  deskripsi?: string | null
  kualifikasi?: string | null
  tgl_buka?: string | null
  tgl_tutup?: string | null
  tgl_tutup_formatted: string
  is_closed: boolean
  status: string
}

interface AppliedInfo {
  id: number
  no_pendaftaran: string
  status: string
  created_at?: string | null
}

interface CandidateProfile {
  nama_lengkap: string
  email: string
  nomor_kontak: string
  pendidikan_terakhir: string
  nama_institusi: string
  jurusan: string
  foto_url?: string | null
  cv_url?: string | null
  surat_lamaran_url?: string | null
}

interface Props {
  lowongans: LowonganItem[]
  appliedMap: Record<number, AppliedInfo>
  isProfileComplete: boolean
  candidateProfile?: CandidateProfile | null
  posisis: Posisi[]
  filters: {
    keyword?: string
    posisi_id?: string
  }
}

export default function Lowongan({
  lowongans,
  appliedMap,
  isProfileComplete,
  candidateProfile,
  posisis,
  filters,
}: Props) {
  const { flash } = usePage<any>().props

  // Search & Filter State
  const [keyword, setKeyword] = useState(filters.keyword || '')
  const [posisiId, setPosisiId] = useState(filters.posisi_id || '')

  // Success Alert Modal State
  const [successModal, setSuccessModal] = useState<string | null>(flash?.success || null)

  useEffect(() => {
    if (flash?.success) {
      setSuccessModal(flash.success)
    }
  }, [flash?.success])

  // Selected for Detail Modal
  const [detailModal, setDetailModal] = useState<{
    open: boolean
    lowongan: LowonganItem | null
  }>({
    open: false,
    lowongan: null,
  })

  // Selected for Apply Modal
  const [applyModal, setApplyModal] = useState<{
    open: boolean
    lowongan: LowonganItem | null
    agreed: boolean
    submitting: boolean
  }>({
    open: false,
    lowongan: null,
    agreed: false,
    submitting: false,
  })

  function handleFilter() {
    router.get(
      '/kandidat/lowongan',
      {
        keyword: keyword || undefined,
        posisi_id: posisiId || undefined,
      },
      { preserveState: true, replace: true },
    )
  }

  function handleReset() {
    setKeyword('')
    setPosisiId('')
    router.get('/kandidat/lowongan', {}, { preserveState: true, replace: true })
  }

  function handleApplyConfirm() {
    if (!applyModal.lowongan) return
    setApplyModal((prev) => ({ ...prev, submitting: true }))

    router.post(
      `/kandidat/lowongan/${applyModal.lowongan.id}/apply`,
      {},
      {
        onFinish: () => {
          setApplyModal({ open: false, lowongan: null, agreed: false, submitting: false })
        },
      },
    )
  }

  const posisiOptions = [
    { value: '', label: 'Semua Posisi' },
    ...posisis.map((p) => ({ value: String(p.id), label: p.nama_jabatan })),
  ]

  const totalApplied = Object.keys(appliedMap).length

  return (
    <AppLayout>
      <Head title="Lowongan Pekerjaan Tersedia - Citalent" />

      <div className="max-w-6xl mx-auto pb-16 pt-1 sm:pt-2">
        <Stack gap={5}>

          {/* Flash Error Message */}
          {flash?.error && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <IconAlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Perhatian</p>
                <p className="mt-0.5">{flash.error}</p>
              </div>
            </div>
          )}


          {/* Search & Filter Bar */}
          <Card>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <Input
                  value={keyword}
                  onChange={setKeyword}
                  placeholder="Cari judul posisi, departemen, keahlian..."
                />
              </div>

              <div className="w-full md:w-56">
                <Select
                  value={posisiId}
                  options={posisiOptions}
                  onChange={setPosisiId}
                  placeholder="Pilih Posisi"
                />
              </div>


              <div className="flex items-center gap-2">
                <Button tone="purple" onClick={handleFilter}>
                  <IconSearch size={16} />
                  Cari
                </Button>
                {(keyword || posisiId) && (
                  <Button variant="quiet" onClick={handleReset}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Job Vacancies List */}
          {lowongans.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <IconBriefcase size={32} />
                </div>
                <Heading level={3}>Tidak Ada Lowongan Ditemukan</Heading>
                <Text size="sm" muted className="mt-1 max-w-md mx-auto">
                  Saat ini belum ada lowongan kerja yang sesuai dengan kata kunci atau filter pencarian Anda.
                </Text>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowongans.map((job) => {
                const isApplied = Boolean(appliedMap[job.id])
                const appliedData = appliedMap[job.id]

                return (
                  <Card key={job.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                    <Stack gap={4}>
                      {/* Top Row: Title & Badges */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Heading level={3} className="text-slate-900 leading-snug">
                            {job.posisi_nama}
                          </Heading>
                          {isApplied && (
                            <Badge tone="mint">✓ Sudah Dilamar</Badge>
                          )}
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="mint">{job.departement_nama}</Badge>
                      </div>

                      {/* Job Snippet */}
                      {job.deskripsi && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {job.deskripsi.replace(/<[^>]+>/g, '')}
                        </p>
                      )}

                      <Separator />

                      {/* Bottom Info & Action */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <IconCalendar size={15} className="text-slate-400 shrink-0" />
                          <span>Batas: <strong>{job.tgl_tutup_formatted}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                          tone='blue'
                            size="sm"
                            onClick={() => setDetailModal({ open: true, lowongan: job })}
                          >
                            <IconEye size={15} />
                            Detail
                          </Button>

                          {isApplied ? (
                            <Button
                              tone="mint"
                              size="sm"
                              onClick={() => router.visit('/kandidat/lamaran')}
                            >
                              <IconCheck size={15} />
                              Lihat Status
                            </Button>
                          ) : (
                            <Button
                              tone="purple"
                              size="sm"
                              onClick={() => {
                                if (!isProfileComplete) {
                                  router.visit('/kandidat/profil')
                                } else {
                                  setApplyModal({ open: true, lowongan: job, agreed: false, submitting: false })
                                }
                              }}
                            >
                              <IconSend size={15} />
                              Lamar
                            </Button>
                          )}
                        </div>
                      </div>
                    </Stack>
                  </Card>
                )
              })}
            </div>
          )}
        </Stack>
      </div>

      {/* Detail Lowongan Modal */}
      <Dialog
        open={detailModal.open}
        onOpenChange={(open) => !open && setDetailModal({ open: false, lowongan: null })}
        title={detailModal.lowongan?.posisi_nama || 'Detail Lowongan'}
      >
        {detailModal.lowongan && (
          <Stack gap={4}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="mint">{detailModal.lowongan.departement_nama}</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <span>Batas Akhir Lamaran:</span>
              <strong className="text-slate-800">{detailModal.lowongan.tgl_tutup_formatted}</strong>
            </div>

            {/* Deskripsi Pekerjaan */}
            {detailModal.lowongan.deskripsi && (
              <div>
                <Heading level={3} className="text-sm font-bold text-slate-800 mb-1.5">
                  Deskripsi Tanggung Jawab
                </Heading>
                <div
                  className="text-xs text-slate-600 space-y-1.5 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100"
                  dangerouslySetInnerHTML={{ __html: detailModal.lowongan.deskripsi }}
                />
              </div>
            )}

            {/* Kualifikasi */}
            {detailModal.lowongan.kualifikasi && (
              <div>
                <Heading level={3} className="text-sm font-bold text-slate-800 mb-1.5">
                  Kualifikasi & Persyaratan
                </Heading>
                <div
                  className="text-xs text-slate-600 space-y-1.5 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100"
                  dangerouslySetInnerHTML={{ __html: detailModal.lowongan.kualifikasi }}
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between gap-3">
              <Button
              tone='pink'
                onClick={() => setDetailModal({ open: false, lowongan: null })}
              >
                Tutup
              </Button>

              {appliedMap[detailModal.lowongan.id] ? (
                <Button
                  tone="mint"
                  onClick={() => router.visit('/kandidat/lamaran')}
                >
                  <IconCheck size={16} />
                  Lihat Riwayat Lamaran
                </Button>
              ) : (
                <Button
                  tone="purple"
                  onClick={() => {
                    const job = detailModal.lowongan
                    setDetailModal({ open: false, lowongan: null })
                    if (!isProfileComplete) {
                      router.visit('/kandidat/profil')
                    } else if (job) {
                      setApplyModal({ open: true, lowongan: job, agreed: false, submitting: false })
                    }
                  }}
                >
                  <IconSend size={16} />
                  Lamar Posisi Ini
                </Button>
              )}
            </div>
          </Stack>
        )}
      </Dialog>

      {/* Apply Confirmation Modal */}
      <Dialog
        open={applyModal.open}
        onOpenChange={(open) => !open && setApplyModal({ open: false, lowongan: null, agreed: false, submitting: false })}
        title="Konfirmasi Pengajuan Lamaran"
      >
        {applyModal.lowongan && candidateProfile && (
          <Stack gap={4}>
            <div className="p-3.5 rounded-xl ">
              <Text size="sm" muted>Posisi yang dilamar:</Text>
              <Heading level={3} className=" mt-0.5">
                {applyModal.lowongan.posisi_nama}
              </Heading>

            </div>

            <div>

              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{candidateProfile.nama_lengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-900">{candidateProfile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">No. WhatsApp:</span>
                  <span className="font-bold text-slate-900">{candidateProfile.nomor_kontak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pendidikan:</span>
                  <span className="font-bold text-slate-900">
                    {candidateProfile.pendidikan_terakhir} - {candidateProfile.nama_institusi}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Dokumen CV:</span>
                  {candidateProfile.cv_url ? (
                    <span className="font-semibold text-emerald-700">✓ Dokumen Terlampir</span>
                  ) : (
                    <span className="text-red-500">Belum diunggah</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pas Foto:</span>
                  {candidateProfile.foto_url ? (
                    <span className="font-semibold text-emerald-700">✓ Pas Foto Terlampir</span>
                  ) : (
                    <span className="text-red-500">Belum diunggah</span>
                  )}
                </div>
              </div>
            </div>

            {/* Checkbox Persetujuan */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyModal.agreed}
                onChange={(e) => setApplyModal((prev) => ({ ...prev, agreed: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-600 leading-normal">
                Saya menyatakan bahwa seluruh data profil dan dokumen yang terlampir adalah benar, valid, dan saya bersedia mengikuti proses tahapan seleksi rekrutmen.
              </span>
            </label>

            <Separator />

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="quiet"
                onClick={() => setApplyModal({ open: false, lowongan: null, agreed: false, submitting: false })}
              >
                Batal
              </Button>
              <Button
                tone="purple"
                disabled={!applyModal.agreed || applyModal.submitting}
                loading={applyModal.submitting}
                onClick={handleApplyConfirm}
              >
                <IconSend size={16} />
                Kirim Lamaran Sekarang
              </Button>
            </div>
          </Stack>
        )}
      </Dialog>

      {/* Animated Success Alert Dialog */}
      <Dialog
        open={Boolean(successModal)}
        onOpenChange={(open) => !open && setSuccessModal(null)}
        title=""
      >
        <div className="text-center py-5 px-3">
          {/* Animated Success Icon */}
          <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-200/60 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <IconCheck size={40} strokeWidth={2.5} className="animate-bounce" />
            </div>
          </div>

          <Heading level={2} className="text-slate-900 text-xl font-black mb-2">
            Berhasil!
          </Heading>

          <Text size="sm" muted className="max-w-sm mx-auto leading-relaxed text-slate-600 mb-6">
            {successModal}
          </Text>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              variant="quiet"
              className="w-full sm:w-auto"
              onClick={() => setSuccessModal(null)}
            >
              Tutup
            </Button>
            <Button
              tone="purple"
              className="w-full sm:w-auto"
              onClick={() => {
                setSuccessModal(null)
                router.visit('/kandidat/lamaran')
              }}
            >
              <IconBriefcase size={16} />
              Lihat Status Lamaran
            </Button>
          </div>
        </div>
      </Dialog>
    </AppLayout>
  )
}
