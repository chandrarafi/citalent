import { useState, useMemo, Fragment } from 'react'
import { Head, router } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge } from '@/components/pouf/media'
import { toast } from '@/components/pouf/toaster'
import type { Tone } from '@/components/pouf/tone'
import {
  IconArrowLeft,
  IconCheck,
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

interface DetailParameter {
  id: number
  yang_dinilai: string
  urutan: number
}

interface ParameterItem {
  id: number
  parameter: string
  bobot: number
  urutan: number
  details: DetailParameter[]
}

interface PelamarInfo {
  id: number
  no_pendaftaran: string
  nama_lengkap: string
  email: string
  nomor_kontak: string
  posisi_dilamar: string
  kd_jabatan?: string
  nama_jabatan: string
  departement: string
}

interface ExistingAssessment {
  id: number
  tanggal_test: string
  nama_penguji: string
  rekomendasi: 'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'
  catatan?: string | null
  status: 'draft' | 'final'
  scores?: {
    parameter_skill_test_id: number
    detail_parameter_skill_test_id: number
    skor: number
    catatan?: string
  }[]
  scores_map?: Record<number, { skor: number; catatan: string }>
}

interface Props {
  pelamar: PelamarInfo
  parameters: ParameterItem[]
  existingAssessment?: ExistingAssessment | null
  currentUser: {
    id: number
    name: string
  }
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

const SCORE_LABELS: Record<number, { title: string; desc: string; color: string; activeBg: string; activeBorder: string; activeText: string }> = {
  1: { title: '1', desc: 'Sangat Kurang', color: 'text-red-600', activeBg: 'bg-red-500', activeBorder: 'border-red-500', activeText: 'text-white' },
  2: { title: '2', desc: 'Kurang', color: 'text-orange-600', activeBg: 'bg-orange-500', activeBorder: 'border-orange-500', activeText: 'text-white' },
  3: { title: '3', desc: 'Cukup', color: 'text-amber-600', activeBg: 'bg-amber-500', activeBorder: 'border-amber-500', activeText: 'text-white' },
  4: { title: '4', desc: 'Baik', color: 'text-emerald-600', activeBg: 'bg-emerald-500', activeBorder: 'border-emerald-500', activeText: 'text-white' },
  5: { title: '5', desc: 'Sangat Baik', color: 'text-blue-600', activeBg: 'bg-blue-600', activeBorder: 'border-blue-600', activeText: 'text-white' },
}

export default function PenilaianSkillTestForm({
  pelamar,
  parameters = [],
  existingAssessment,
  currentUser,
  tahapConfig = DEFAULT_TAHAP_CONFIG,
}: Props) {
  const isEditing = Boolean(existingAssessment)
  const routePrefix = tahapConfig.route_prefix || 'penilaian-skill-test'
  const title = tahapConfig.title || 'Penilaian Skill Test'
  const badgeLabel = tahapConfig.badge_label || 'SKILL TEST'

  // Initialize scores map
  const initialScores: Record<number, { skor: number; catatan: string }> = {}
  parameters.forEach((param) => {
    param.details.forEach((d) => {
      const fromMap = existingAssessment?.scores_map?.[d.id]
      const fromArray = existingAssessment?.scores?.find(
        (s) => s.detail_parameter_skill_test_id === d.id
      )
      const existing = fromMap || fromArray
      initialScores[d.id] = {
        skor: existing ? existing.skor : 3, // Default 3 (Cukup)
        catatan: existing ? (existing.catatan || '') : '',
      }
    })
  })

  const [scores, setScores] = useState<Record<number, { skor: number; catatan: string }>>(initialScores)
  const [tanggalTest, setTanggalTest] = useState(
    existingAssessment?.tanggal_test || new Date().toISOString().split('T')[0]
  )
  const [namaPenguji, setNamaPenguji] = useState(
    existingAssessment?.nama_penguji || currentUser.name
  )
  const [rekomendasi, setRekomendasi] = useState<'disarankan' | 'dipertimbangkan' | 'tidak_disarankan'>(
    existingAssessment?.rekomendasi || 'dipertimbangkan'
  )
  const [catatanUmum, setCatatanUmum] = useState(existingAssessment?.catatan || '')
  const [submitting, setSubmitting] = useState(false)

  // Calculate live weighted score
  const calculation = useMemo(() => {
    let totalWeightedScore = 0

    const paramBreakdowns = parameters.map((param) => {
      const detailScores = param.details.map((d) => scores[d.id]?.skor ?? 3)
      const count = detailScores.length || 1
      const sum = detailScores.reduce((a, b) => a + b, 0)
      const avg = sum / count
      const weighted = avg * (param.bobot / 100)
      totalWeightedScore += weighted

      return {
        id: param.id,
        parameter: param.parameter,
        bobot: param.bobot,
        avg: avg,
        weighted: weighted,
      }
    })

    const totalSkor = Math.round(totalWeightedScore * 100) / 100
    const nilaiAkhir = Math.round(((totalSkor / 5) * 100) * 100) / 100

    return {
      paramBreakdowns,
      totalSkor,
      nilaiAkhir,
    }
  }, [parameters, scores])

  function handleScoreChange(detailId: number, newScore: number) {
    setScores((prev) => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        skor: newScore,
      },
    }))
  }

  function handleNoteChange(detailId: number, note: string) {
    setScores((prev) => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        catatan: note,
      },
    }))
  }

  function handleSubmit(targetStatus: 'draft' | 'final') {
    setSubmitting(true)

    // Build payload
    const formattedScores: {
      parameter_skill_test_id: number
      detail_parameter_skill_test_id: number
      skor: number
      catatan?: string
    }[] = []

    parameters.forEach((param) => {
      param.details.forEach((d) => {
        const item = scores[d.id]
        formattedScores.push({
          parameter_skill_test_id: param.id,
          detail_parameter_skill_test_id: d.id,
          skor: item?.skor ?? 3,
          catatan: item?.catatan || undefined,
        })
      })
    })

    const payload = {
      tanggal_test: tanggalTest,
      nama_penguji: namaPenguji,
      rekomendasi: rekomendasi,
      catatan: catatanUmum || undefined,
      status: targetStatus,
      scores: formattedScores,
      jenis_tahap: tahapConfig.tahap,
    }

    if (isEditing && existingAssessment) {
      router.put(`/${routePrefix}/${existingAssessment.id}`, payload, {
        onFinish: () => setSubmitting(false),
        onSuccess: () => {
          toast.success(`Penilaian ${badgeLabel} berhasil diperbarui.`)
        },
        onError: () => {
          toast.error('Gagal memperbarui penilaian. Periksa form kembali.')
        },
      })
    } else {
      router.post(`/pelamar/${pelamar.id}/${routePrefix}`, payload, {
        onFinish: () => setSubmitting(false),
        onSuccess: () => {
          toast.success(`Penilaian ${badgeLabel} berhasil disimpan.`)
        },
        onError: () => {
          toast.error('Gagal menyimpan penilaian. Periksa form kembali.')
        },
      })
    }
  }

  return (
    <AppLayout>
      <Head title={`Form ${title} - ${pelamar.nama_lengkap}`} />

      <Stack gap={5} className="p-6 max-w-[1400px] mx-auto">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-700 transition mb-2"
            >
              <IconArrowLeft size={14} /> Kembali
            </button>
            <Heading level={1}>Form {title}</Heading>
            <Text size="sm" muted>
              Evaluasi kompetensi kandidat dengan memberikan skor radio button 1 - 5 pada masing-masing kriteria.
            </Text>
          </div>

          <Row gap={2} align="center">
            <Button
              type="button"
              tone="pink"
              onClick={() => window.history.back()}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              tone="blue"
              onClick={() => handleSubmit('draft')}
              loading={submitting}
            >
              Simpan Draft
            </Button>
            <Button
              type="button"
              tone="purple"
              onClick={() => handleSubmit('final')}
              loading={submitting}
            >
              <IconCheck size={16} /> Simpan Nilai Final
            </Button>
          </Row>
        </div>

        {/* Candidate Summary Info Card */}
        <Card className="border border-slate-200">
          <Grid cols={4} gap={4}>
            <div className="sm:col-span-2">
              <Text size="sm" muted>Nama Kandidat / Pelamar</Text>
              <Heading level={3} className="text-slate-900 mt-0.5">
                {pelamar.nama_lengkap}
              </Heading>
              <Text size="sm" muted className="mt-0.5">
                No. Pendaftaran: <strong>{pelamar.no_pendaftaran}</strong> &bull; Posisi: <strong>{pelamar.nama_jabatan}</strong>
              </Text>
            </div>

            <div>
              <Text size="sm" muted>Tahap Evaluasi</Text>
              <div className="mt-1">
                <Badge tone={tahapConfig.badge_tone || 'purple'} className="font-bold text-xs">
                  {badgeLabel}
                </Badge>
              </div>
            </div>

            <div>
              <Text size="sm" muted>Penguji & Tanggal Uji</Text>
              <div className="font-semibold text-slate-800 mt-0.5">
                {namaPenguji}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {tanggalTest}
              </div>
            </div>
          </Grid>
        </Card>

        {/* Score Calculation Summary Card */}
        <Card className="border border-slate-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Primary Scores */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div>
                <Text size="sm" muted className="font-bold uppercase tracking-wider text-[11px]">
                  Nilai Akhir
                </Text>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {calculation.nilaiAkhir.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200 hidden sm:block" />

              <div>
                <Text size="sm" muted className="font-bold uppercase tracking-wider text-[11px]">
                  Skor Rata-Rata Terbobot
                </Text>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono">
                    {calculation.totalSkor.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
                </div>
              </div>
            </div>

            {/* Parameter Breakdown Badges */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {calculation.paramBreakdowns.map((pb) => (
                <div
                  key={pb.id}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 min-w-[120px]"
                >
                  <div className="text-[11px] font-semibold text-slate-600 truncate max-w-[130px]">
                    {pb.parameter}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {pb.avg.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ 5</span>
                    </span>
                    <Badge tone="blue" className="text-[10px] px-1.5 py-0 font-bold">
                      {pb.bobot}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Interactive Parameter Assessment Form Table */}
        <Card className="border border-slate-200 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[760px]">
              <thead>
                <tr className="bg-[#1e40af] text-white text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 w-[32%]">Parameter & Poin Pengujian</th>
                  <th className="py-3.5 px-4 w-[42%] text-center">Pemberian Skor (Skala 1 - 5)</th>
                  <th className="py-3.5 px-4 w-[26%]">Catatan Penguji (Opsional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {parameters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      Belum ada parameter {badgeLabel} yang dikonfigurasi untuk posisi {pelamar.nama_jabatan}.
                    </td>
                  </tr>
                ) : (
                  parameters.map((param, pIdx) => {
                    const paramCalc = calculation.paramBreakdowns.find((p) => p.id === param.id)

                    return (
                      <Fragment key={param.id}>
                        {/* Parameter Section Header Row */}
                        <tr className="bg-slate-100/90 border-t-2 border-b border-slate-200">
                          <td colSpan={3} className="py-2.5 px-4">
                            <div className="flex items-center justify-between">
                              <Row gap={2} align="center">
                                <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                                  {pIdx + 1}
                                </span>
                                <span className="font-bold text-slate-900 text-sm sm:text-base">
                                  {param.parameter}
                                </span>
                                <Badge tone="blue">Bobot: {param.bobot}%</Badge>
                              </Row>

                              <div className="text-xs font-bold text-slate-700">
                                Rata-rata Skor: <span className="text-blue-800 font-extrabold">{paramCalc?.avg.toFixed(2) || '0.00'}</span> / 5.00
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Detail Items Scoring Rows */}
                        {param.details.map((detail, dIdx) => {
                          const currentScore = scores[detail.id]?.skor ?? 3
                          const currentNote = scores[detail.id]?.catatan ?? ''

                          return (
                            <tr key={detail.id} className="hover:bg-slate-50/70 transition">
                              {/* Detail Point Text */}
                              <td className="py-3.5 px-4 align-middle">
                                <div className="flex items-start gap-2">
                                  <span className="text-purple-600 font-bold text-sm shrink-0 mt-0.5">
                                    {dIdx + 1}.
                                  </span>
                                  <span className="font-semibold text-slate-800 text-sm leading-snug">
                                    {detail.yang_dinilai}
                                  </span>
                                </div>
                              </td>

                              {/* Radio Button 1 - 5 Scoring Component */}
                              <td className="py-3.5 px-4 align-middle">
                                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                  {[1, 2, 3, 4, 5].map((val) => {
                                    const isSelected = currentScore === val
                                    const cfg = SCORE_LABELS[val]

                                    return (
                                      <label
                                        key={val}
                                        onClick={() => handleScoreChange(detail.id, val)}
                                        className={`flex flex-col items-center justify-center cursor-pointer transition-all select-none rounded-xl py-1.5 px-2 sm:px-3 border text-center flex-1 max-w-[68px] ${
                                          isSelected
                                            ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeText} shadow-sm font-bold`
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                        }`}
                                        title={`${val} - ${cfg.desc}`}
                                      >
                                        <input
                                          type="radio"
                                          name={`score_${detail.id}`}
                                          value={val}
                                          checked={isSelected}
                                          onChange={() => handleScoreChange(detail.id, val)}
                                          className="sr-only"
                                        />
                                        <span className="font-extrabold text-sm leading-none">
                                          {val}
                                        </span>
                                        <span className={`text-[10px] font-semibold mt-0.5 truncate w-full ${
                                          isSelected ? 'text-white' : 'text-slate-500'
                                        }`}>
                                          {cfg.desc}
                                        </span>
                                      </label>
                                    )
                                  })}
                                </div>
                              </td>

                              {/* Optional Notes for this criteria */}
                              <td className="py-3.5 px-4 align-middle">
                                <input
                                  type="text"
                                  value={currentNote}
                                  onChange={(e) => handleNoteChange(detail.id, e.target.value)}
                                  placeholder="Catatan poin ini..."
                                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded-lg text-slate-800 transition outline-none"
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Evaluation Summary & Recommendations */}
        <Card className="border border-slate-200">
          <Stack gap={4}>
            <Heading level={3}>Kesimpulan & Rekomendasi Penguji</Heading>

            <Grid cols={3} gap={4}>
              {/* Tanggal Test */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tanggal Pelaksanaan Test <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalTest}
                  onChange={(e) => setTanggalTest(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg outline-none font-semibold text-slate-800"
                  required
                />
              </div>

              {/* Nama Penguji */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Penguji / Asesor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaPenguji}
                  onChange={(e) => setNamaPenguji(e.target.value)}
                  placeholder="Nama penguji / HR"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg outline-none font-semibold text-slate-800"
                  required
                />
              </div>

              {/* Rekomendasi Kelulusan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rekomendasi Hasil {badgeLabel} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['disarankan', 'dipertimbangkan', 'tidak_disarankan'] as const).map((rec) => {
                    const isSel = rekomendasi === rec
                    const cfg = {
                      disarankan: { label: 'Disarankan', activeBg: 'bg-emerald-600 text-white' },
                      dipertimbangkan: { label: 'Dipertimbangkan', activeBg: 'bg-amber-500 text-white' },
                      tidak_disarankan: { label: 'Tidak Disarankan', activeBg: 'bg-red-600 text-white' },
                    }[rec]

                    return (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => setRekomendasi(rec)}
                        className={`px-2 py-2 text-xs font-bold rounded-lg border transition text-center ${
                          isSel ? cfg.activeBg : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </Grid>

            {/* Catatan Kesimpulan Umum */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catatan / Kesimpulan Umum Penguji
              </label>
              <textarea
                rows={3}
                value={catatanUmum}
                onChange={(e) => setCatatanUmum(e.target.value)}
                placeholder={`Tuliskan ulasan kelebihan, kekurangan, atau catatan penting terkait hasil evaluasi ${badgeLabel} kandidat...`}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg outline-none text-slate-800 font-medium"
              />
            </div>

            {/* Bottom Actions */}
            <Row justify="end" gap={2} className="pt-3 border-t border-slate-100">
              <Button
                type="button"
                tone="pink"
                onClick={() => window.history.back()}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                tone="blue"
                onClick={() => handleSubmit('draft')}
                loading={submitting}
              >
                Simpan Sebagai Draft
              </Button>
              <Button
                type="button"
                tone="purple"
                onClick={() => handleSubmit('final')}
                loading={submitting}
              >
                <IconCheck size={16} /> Simpan Penilaian Final
              </Button>
            </Row>
          </Stack>
        </Card>
      </Stack>
    </AppLayout>
  )
}
