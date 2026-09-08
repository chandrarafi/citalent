import { Head, router } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge } from '@/components/pouf/media'
import { Separator } from '@/components/pouf/separator'
import type { Tone } from '@/components/pouf/tone'
import {
  IconArrowLeft,
  IconEdit,
  IconPrinter,
} from '@tabler/icons-react'

interface TahapConfig {
  tahap: string
  tahap_key: string
  title: string
  subtitle: string
  route_prefix: string
  param_route_prefix: string
  badge_label: string
  badge_tone: Tone
  allowed_jabatans?: string[] | null
  next_stage_default: string
  next_stage_label: string
}

interface DetailPoint {
  id: number
  yang_dinilai: string
  skor: number
  catatan?: string | null
}

interface GroupedParameter {
  parameter_id: number
  parameter_name: string
  bobot: number
  avg_skor: number
  nilai_100: number
  items: DetailPoint[]
}

interface PelamarInfo {
  id?: number
  no_pendaftaran?: string
  nama_lengkap?: string
  email?: string
  nomor_kontak?: string
  posisi_dilamar?: string
  kd_jabatan?: string
  nama_jabatan?: string
  departemen_nama?: string
  status?: string
}

interface LowonganInfo {
  id?: number
  kode_lowongan?: string
  judul?: string
  departemen_nama?: string
  posisi_nama?: string
  kd_jabatan?: string
}

interface AssessmentDetail {
  id: number
  tanggal_test?: string | null
  total_skor: number
  nilai_akhir: number
  rekomendasi: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
  catatan?: string | null
  status: 'draft' | 'final'
  nama_penguji: string
  created_at?: string | null
  pelamar?: PelamarInfo
  lowongan?: LowonganInfo | null
  grouped_parameters?: GroupedParameter[]
}

interface ExaminerOverview {
  id: number
  nama_penguji: string
  tanggal_test?: string | null
  total_skor: number
  nilai_akhir: number
  rekomendasi: string
  status: string
  is_current: boolean
}

interface Props {
  penilaian: AssessmentDetail
  pelamar?: PelamarInfo
  groupedParameters?: GroupedParameter[]
  allExaminerAssessments?: ExaminerOverview[]
  canEdit?: boolean
  tahapConfig?: TahapConfig
}

const DEFAULT_TAHAP_CONFIG: TahapConfig = {
  tahap: 'skill_test',
  tahap_key: 'skill_test',
  title: 'Penilaian Skill Test',
  subtitle: 'Penilaian uji kompetensi teknis, tes keahlian, dan simulasi kerja kandidat per lowongan.',
  route_prefix: 'penilaian-skill-test',
  param_route_prefix: 'parameter-skill-test',
  badge_label: 'SKILL TEST',
  badge_tone: 'purple',
  next_stage_default: 'interview_hr',
  next_stage_label: 'Interview HR',
}

const SCORE_LABELS: Record<number, { label: string; tone: Tone }> = {
  1: { label: '1 - Sangat Kurang', tone: 'pink' },
  2: { label: '2 - Kurang', tone: 'orange' },
  3: { label: '3 - Cukup', tone: 'yellow' },
  4: { label: '4 - Baik', tone: 'mint' },
  5: { label: '5 - Sangat Baik', tone: 'blue' },
}

const REKOMENDASI_MAP: Record<string, { label: string; tone: Tone; desc: string }> = {
  disarankan: {
    label: 'Disarankan Lolos',
    tone: 'mint',
    desc: 'Kandidat memenuhi seluruh kualifikasi dan kompetensi yang dipersyaratkan pada tahap ini.',
  },
  dipertimbangkan: {
    label: 'Dipertimbangkan',
    tone: 'yellow',
    desc: 'Kandidat memiliki beberapa keahlian yang memadai, namun memerlukan pertimbangan lebih lanjut.',
  },
  tidak_disarankan: {
    label: 'Tidak Disarankan',
    tone: 'pink',
    desc: 'Kandidat belum memenuhi standar minimum kualifikasi atau kompetensi tahap ini.',
  },
}

export default function PenilaianSkillTestShow({
  penilaian,
  pelamar: propPelamar,
  groupedParameters: propGroupedParameters,
  allExaminerAssessments = [],
  canEdit = true,
  tahapConfig = DEFAULT_TAHAP_CONFIG,
}: Props) {
  const pelamar = penilaian.pelamar || propPelamar || {}
  const lowongan = penilaian.lowongan
  const groupedParameters = penilaian.grouped_parameters || propGroupedParameters || []

  const routePrefix = tahapConfig.route_prefix || 'penilaian-skill-test'
  const title = tahapConfig.title || 'Penilaian Skill Test'
  const badgeLabel = tahapConfig.badge_label || 'SKILL TEST'

  const recConfig = REKOMENDASI_MAP[penilaian.rekomendasi] || REKOMENDASI_MAP.dipertimbangkan

  // Calculate overall average if multiple examiners
  const totalExaminers = allExaminerAssessments.length
  const avgAllNilai = totalExaminers > 0
    ? (allExaminerAssessments.reduce((sum, a) => sum + a.nilai_akhir, 0) / totalExaminers).toFixed(1)
    : penilaian.nilai_akhir.toFixed(1)

  return (
    <AppLayout>
      <Head title={`Hasil ${title} - ${pelamar.nama_lengkap ?? 'Kandidat'}`} />

      <Stack gap={5} className="p-6 max-w-[1400px] mx-auto">
        {/* Header Navigation & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <button
              type="button"
              onClick={() => {
                if (lowongan?.id) {
                  router.visit(`/${routePrefix}/lowongan/${lowongan.id}`)
                } else {
                  router.visit(`/${routePrefix}`)
                }
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-700 transition mb-2"
            >
              <IconArrowLeft size={14} /> Kembali ke Rekap Lowongan
            </button>
            <Heading level={1}>Rekap Hasil {title}</Heading>
            <Text size="sm" muted>
              Rincian skor evaluasi kandidat per parameter dan kesimpulan penguji.
            </Text>
          </div>

          <Row gap={2} align="center">
            {canEdit && (
              <Button
                type="button"
                tone="mint"
                onClick={() => router.visit(`/${routePrefix}/${penilaian.id}/edit`)}
              >
                <IconEdit size={16} /> Edit Nilai
              </Button>
            )}
            <Button
              type="button"
              tone="blue"
              onClick={() => window.print()}
            >
              <IconPrinter size={16} /> Cetak Lembar Nilai
            </Button>
          </Row>
        </div>

        {/* Top Summary Card */}
        <Card className="border border-slate-200">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            {/* Candidate & Position */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge tone={tahapConfig.badge_tone || 'purple'} className="font-bold text-xs uppercase">
                  {badgeLabel}
                </Badge>
                <Text size="sm" muted className="font-bold uppercase tracking-wider text-xs">
                  Lembar Hasil Evaluasi
                </Text>
              </div>
              <Heading level={2} className="text-slate-900 text-2xl font-black">
                {pelamar.nama_lengkap || 'Nama Kandidat'}
              </Heading>
              <Text size="sm" muted>
                {lowongan?.posisi_nama || pelamar.nama_jabatan || pelamar.posisi_dilamar} &bull; {lowongan?.departemen_nama || pelamar.departemen_nama || 'General'}
              </Text>
              <div className="text-xs text-slate-500 pt-1">
                No. Pendaftaran: <strong className="text-slate-700">{pelamar.no_pendaftaran || '-'}</strong> &bull; Diuji pada: <strong className="text-slate-700">{penilaian.tanggal_test || '-'}</strong>
              </div>
            </div>

            {/* Score & Recommendation Badges */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-center sm:text-right pr-0 sm:pr-4 sm:border-r border-slate-200">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                  Nilai Akhir
                </span>
                <div className="text-3xl font-black text-slate-900 leading-tight font-mono">
                  {penilaian.nilai_akhir.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Skor: {penilaian.total_skor.toFixed(2)} / 5.00
                </span>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                  Rekomendasi
                </span>
                <Badge tone={recConfig.tone} className="text-sm font-bold">
                  {recConfig.label}
                </Badge>
                <div className="text-[11px] text-slate-500">
                  Penguji: <strong className="text-slate-800">{penilaian.nama_penguji}</strong>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Multi-Examiner Comparison Overview if > 1 examiner */}
        {allExaminerAssessments.length > 1 && (
          <Card className="border border-slate-200 bg-slate-50/50">
            <Stack gap={3}>
              <div className="flex items-center justify-between">
                <div>
                  <Heading level={3} className="text-slate-900 text-base">
                    Perbandingan Penilaian Tim Penguji ({allExaminerAssessments.length} Penguji)
                  </Heading>
                  <Text size="sm" muted>
                    Rata-rata Nilai Keseluruhan: <strong className="text-slate-900 font-mono text-sm">{avgAllNilai} / 100</strong>
                  </Text>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Nama Penguji</th>
                      <th className="py-2.5 px-4 text-center">Tanggal Uji</th>
                      <th className="py-2.5 px-4 text-center">Nilai Akhir</th>
                      <th className="py-2.5 px-4 text-center">Rekomendasi</th>
                      <th className="py-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allExaminerAssessments.map((ex) => (
                      <tr key={ex.id} className={ex.is_current ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-4">
                          <Row gap={2} align="center">
                            <span>{ex.nama_penguji}</span>
                            {ex.is_current && <Badge tone="blue">Sedang Dilihat</Badge>}
                          </Row>
                        </td>
                        <td className="py-2.5 px-4 text-center text-xs text-slate-500">
                          {ex.tanggal_test || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold font-mono">
                          {ex.nilai_akhir.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Badge tone={REKOMENDASI_MAP[ex.rekomendasi]?.tone || 'yellow'}>
                            {REKOMENDASI_MAP[ex.rekomendasi]?.label || ex.rekomendasi}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {!ex.is_current && (
                            <Button
                              size="sm"
                              tone="mint"
                              onClick={() => router.visit(`/${routePrefix}/${ex.id}`)}
                            >
                              Lihat Rekap ↗
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Stack>
          </Card>
        )}

        {/* Detailed Breakdown Tables per Parameter */}
        <Stack gap={4}>
          <Heading level={3}>Rincian Penilaian Tiap Parameter</Heading>

          {groupedParameters.map((paramGroup, pIdx) => (
            <Card key={paramGroup.parameter_id} className="border border-slate-200 overflow-hidden p-0">
              {/* Parameter Header Bar */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Row gap={2} align="center">
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                    {pIdx + 1}
                  </span>
                  <div className="font-extrabold text-slate-900 text-base">
                    {paramGroup.parameter_name}
                  </div>
                  <Badge tone="purple">Bobot: {paramGroup.bobot}%</Badge>
                </Row>

                <Row gap={3} align="center">
                  <div className="text-xs text-slate-600">
                    Rata-rata Skor: <strong className="text-slate-900">{paramGroup.avg_skor.toFixed(2)}</strong> / 5.00
                  </div>
                  <div className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                    Nilai Terbobot: {paramGroup.nilai_100}%
                  </div>
                </Row>
              </div>

              {/* Sub-items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-4 w-[50%]">Poin Yang Dinilai</th>
                      <th className="py-2.5 px-4 w-[20%] text-center">Skor Diperoleh</th>
                      <th className="py-2.5 px-4 w-[30%]">Catatan Penguji</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm bg-white">
                    {paramGroup.items.map((item, dIdx) => {
                      const scoreCfg = SCORE_LABELS[item.skor] || SCORE_LABELS[3]

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <span className="text-purple-600 font-bold mr-2">{dIdx + 1}.</span>
                            {item.yang_dinilai}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge tone={scoreCfg.tone} className="font-bold">
                              {scoreCfg.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {item.catatan || <span className="text-slate-400 italic">Tidak ada catatan</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </Stack>

        {/* Conclusion & Notes Card */}
        <Card className="border border-slate-200">
          <Stack gap={3}>
            <Heading level={3}>Kesimpulan & Catatan Evaluasi Penguji</Heading>

            <Grid cols={3} gap={4}>
              <div className="col-span-2 space-y-2">
                <Text size="sm" muted className="font-bold uppercase tracking-wider">
                  Ulasan Umum Penguji:
                </Text>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {penilaian.catatan || 'Tidak ada catatan kesimpulan tambahan dari penguji.'}
                </div>
              </div>

              <div className="space-y-2">
                <Text size="sm" muted className="font-bold uppercase tracking-wider">
                  Rekomendasi Keputusan:
                </Text>
                <Stack gap={2}>
                  <Badge tone={recConfig.tone} className="self-start font-bold">
                    {recConfig.label}
                  </Badge>
                  <p className="text-xs text-slate-600">
                    {recConfig.desc}
                  </p>
                  <Separator />
                  <div className="text-[11px] text-slate-500">
                    Disahkan oleh: <strong>{penilaian.nama_penguji}</strong><br />
                    Status: <strong>{penilaian.status.toUpperCase()}</strong>
                  </div>
                </Stack>
              </div>
            </Grid>
          </Stack>
        </Card>
      </Stack>
    </AppLayout>
  )
}
