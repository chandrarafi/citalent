import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Badge, Blob } from '@/components/pouf/media'
import { Button } from '@/components/pouf/Button'
import { Dialog } from '@/components/pouf/controls'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart as RPieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  IconStar,
  IconUsers,
  IconHeart,
  IconMessageCircle,
  IconCalendar,
  IconDownload,
  IconArrowUpRight,
  IconCheck,
  IconChevronRight,
  IconExternalLink,
  IconQuote,
  IconListCheck,
  IconSparkles,
} from '@tabler/icons-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Metrics {
  overall_score: number
  overall_delta: string
  response_rate: number
  response_delta: string
  total_responden: number
  total_target: number
  nps_score: string
  nps_delta: string
  nps_category: string
  total_feedback: number
  open_comments_count: number
}

interface TrenItem {
  bulan: string
  skor: number
}

interface AspekItem {
  aspek: string
  skor: number
  color: string
}

interface TopMasukanItem {
  rank: number
  text: string
  persen: number
  color: string
}

interface SentimenItem {
  name: string
  value: number
  count: number
  color: string
}

interface KomentarItem {
  id: number
  text: string
  kandidat: string
  tanggal: string
  tone: 'blue' | 'pink' | 'mint'
}

interface TindakLanjutItem {
  id: number
  judul: string
  status: 'Dalam Proses' | 'Planned' | 'Selesai'
  tone: 'blue' | 'yellow' | 'mint'
}

interface Props {
  metrics: Metrics
  tren_data: TrenItem[]
  aspek_skor: AspekItem[]
  top_masukan: TopMasukanItem[]
  sentimen_data: SentimenItem[]
  contoh_komentar: KomentarItem[]
  tindak_lanjut: TindakLanjutItem[]
  current_periode: string
}

export default function CandidateSatisfactionIndex({
  metrics,
  tren_data,
  aspek_skor,
  top_masukan,
  sentimen_data,
  contoh_komentar,
  tindak_lanjut,
  current_periode,
}: Props) {
  const [periode, setPeriode] = useState(current_periode || 'jan-mar-2025')
  const [trenRange, setTrenRange] = useState('6 Bulan Terakhir')
  const [showSurveyModal, setShowSurveyModal] = useState(false)

  // Fallbacks for resilience
  const m = metrics || {
    overall_score: 4.8,
    overall_delta: '+0,6',
    response_rate: 95,
    response_delta: '+12%',
    total_responden: 247,
    total_target: 260,
    nps_score: '+72',
    nps_delta: '+18',
    nps_category: 'Excellent',
    total_feedback: 247,
    open_comments_count: 198,
  }

  return (
    <AppLayout>
      <Head title="Candidate Satisfaction — CITALENT PT Menara Agung" />

      <Stack gap={5} className="w-full pb-10">
        {/* ─── Top Header & Controls ────────────────────────────────────────── */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-1">
          <Stack gap={1}>
            <Heading level={1} className="flex items-center gap-2.5">
              Candidate Satisfaction
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-[var(--color-purple)]/20 text-[var(--color-ink)] border border-[var(--color-purple)]/30">
                PT Menara Agung
              </span>
            </Heading>
            <Text size="sm" muted>
              Dengarkan pengalaman kandidat, tingkatkan kualitas rekrutmen
            </Text>
          </Stack>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Periode Filter */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-[var(--color-line,#00000015)] shadow-xs">
              <IconCalendar size={18} className="text-[var(--color-purple)]" />
              <span className="text-xs font-bold text-muted">Periode</span>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="text-xs sm:text-sm font-bold text-[var(--color-ink)] bg-transparent border-none focus:outline-hidden cursor-pointer"
              >
                <option value="jan-mar-2025">Jan – Mar 2025</option>
                <option value="apr-jun-2025">Apr – Jun 2025</option>
                <option value="all-2025">Semua Periode 2025</option>
              </select>
            </div>

            {/* Buka Form Survey Kandidat Button */}
            <Button
              tone="purple"
              variant="solid"
              onClick={() => router.visit('/kandidat/survey')}
              className="gap-2"
            >
              <IconExternalLink size={16} />
              <span>Buka Form Survey</span>
            </Button>

            {/* Export Laporan Button */}
            <a
              href="/candidate-satisfaction/export"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-control)] bg-surface text-[var(--color-ink)] font-bold text-xs sm:text-sm border border-[var(--color-line,#00000018)] shadow-clay hover:translate-y-[-1px] transition-all"
            >
              <IconDownload size={16} className="text-[var(--color-blue)]" />
              <span>Export Laporan</span>
            </a>
          </div>
        </div>

        {/* ─── 4 Top KPI Stat Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* 1. Overall Candidate Satisfaction */}
          <Card motion="lift" variant="tight" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Overall Candidate Satisfaction
                </Text>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {String(m.overall_score).replace('.', ',')}
                    <span className="text-lg font-bold text-muted ml-1">/ 5</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <IconArrowUpRight size={12} stroke={3} /> {m.overall_delta}
                  </span>
                </div>
                <Text size="sm" muted className="text-xs">
                  dibanding periode sebelumnya
                </Text>
              </Stack>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-purple)]/25 text-[var(--color-ink)] flex items-center justify-center shrink-0 shadow-xs border border-[var(--color-purple)]/40">
                <IconStar size={24} className="fill-[var(--color-purple)] text-[var(--color-ink)]" />
              </div>
            </div>
          </Card>

          {/* 2. Response Rate */}
          <Card motion="lift" variant="tight" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Response Rate
                </Text>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {m.response_rate}%
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <IconArrowUpRight size={12} stroke={3} /> {m.response_delta}
                  </span>
                </div>
                <Text size="sm" muted className="text-xs font-medium">
                  {m.total_responden} dari {m.total_target} kandidat
                </Text>
              </Stack>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-mint)]/35 text-[var(--color-ink)] flex items-center justify-center shrink-0 shadow-xs border border-[var(--color-mint)]/50">
                <IconUsers size={24} className="text-emerald-700" />
              </div>
            </div>
          </Card>

          {/* 3. Net Promoter Score (NPS) */}
          <Card motion="lift" variant="tight" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Net Promoter Score (NPS)
                </Text>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {m.nps_score}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <IconArrowUpRight size={12} stroke={3} /> {m.nps_delta}
                  </span>
                </div>
                <Text size="sm" muted className="text-xs font-medium">
                  Kategori:{' '}
                  <span className="text-emerald-600 font-bold">{m.nps_category}</span>
                </Text>
              </Stack>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-pink)]/35 text-[var(--color-ink)] flex items-center justify-center shrink-0 shadow-xs border border-[var(--color-pink)]/50">
                <IconHeart size={24} className="fill-rose-500 text-rose-500" />
              </div>
            </div>
          </Card>

          {/* 4. Total Feedback */}
          <Card motion="lift" variant="tight" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Total Feedback
                </Text>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {m.total_feedback}
                  </span>
                </div>
                <Text size="sm" muted className="text-xs font-medium">
                  {m.open_comments_count} komentar terbuka
                </Text>
              </Stack>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-blue)]/35 text-[var(--color-ink)] flex items-center justify-center shrink-0 shadow-xs border border-[var(--color-blue)]/50">
                <IconMessageCircle size={24} className="text-blue-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* ─── Middle Section (3 Columns) ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Col 1: Tren Candidate Satisfaction Score (5 cols) */}
          <Card variant="tight" className="lg:col-span-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line,#0000000f)] mb-4">
              <Stack gap={1}>
                <Heading level={3} className="text-base font-black">
                  Tren Candidate Satisfaction Score
                </Heading>
                <Text size="sm" muted className="text-xs">
                  Pergerakan skor kepuasan rata-rata
                </Text>
              </Stack>
              <div className="px-2.5 py-1 rounded-full bg-surface border border-[var(--color-line,#00000015)] text-xs font-bold text-muted shadow-2xs">
                {trenRange}
              </div>
            </div>

            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={tren_data}
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="bulan"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#71609b', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    domain={[3.0, 5.0]}
                    ticks={[3.0, 3.5, 4.0, 4.5, 5.0]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#71609b', fontSize: 11, fontWeight: 600 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      fontWeight: 'bold',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [
                      `${String(value).replace('.', ',')} / 5.0`,
                      'Skor Kepuasan',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="skor"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#satisfactionGradient)"
                    dot={{
                      r: 5,
                      fill: '#ffffff',
                      stroke: '#3b82f6',
                      strokeWidth: 3,
                    }}
                    activeDot={{ r: 7, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-line,#0000000f)] flex items-center justify-between text-xs text-muted">
              <span>Target minimal: <strong>4.2 / 5.0</strong></span>
              <span className="text-emerald-600 font-bold">Pencapaian: Sangat Baik</span>
            </div>
          </Card>

          {/* Col 2: Rata-rata Skor per Aspek (4 cols) */}
          <Card variant="tight" className="lg:col-span-4 flex flex-col h-full">
            <div className="pb-3 border-b border-[var(--color-line,#0000000f)] mb-3">
              <Heading level={3} className="text-base font-black">
                Rata-rata Skor per Aspek
              </Heading>
              <Text size="sm" muted className="text-xs">
                Evaluasi 7 aspek pengalaman kandidat (Skala 1–5)
              </Text>
            </div>

            <div className="flex flex-col gap-3.5 my-auto">
              {aspek_skor.map((item, idx) => {
                const percent = ((item.skor - 1) / 4) * 100
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--color-ink)] truncate max-w-[70%]">
                        {item.aspek}
                      </span>
                      <span className="font-black text-[var(--color-ink)] px-2 py-0.5 rounded-md bg-black/[0.04] text-[11px] [font-variant-numeric:tabular-nums]">
                        {String(item.skor).replace('.', ',')}
                      </span>
                    </div>

                    {/* Progress Bar with Pill Clay effect */}
                    <div className="h-3 w-full rounded-full bg-black/[0.05] p-0.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${Math.min(100, Math.max(15, percent))}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Col 3: Top 5 Masukan untuk Perbaikan (3 cols) */}
          <Card variant="tight" className="lg:col-span-3 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line,#0000000f)] mb-3">
              <Heading level={3} className="text-base font-black leading-snug">
                Top 5 Masukan untuk Perbaikan
              </Heading>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider bg-black/[0.03] px-2 py-0.5 rounded-full">
                Semua Periode
              </span>
            </div>

            <div className="flex flex-col gap-2.5 my-auto">
              {top_masukan.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-black/[0.02] hover:bg-black/[0.04] border border-[var(--color-line,#0000000d)] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.rank}
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-ink)] truncate">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[var(--color-ink)] shrink-0 px-2 py-0.5 rounded-full bg-white shadow-2xs border border-[var(--color-line,#00000010)]">
                    {item.persen}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ─── Bottom Section (3 Cards: Sentimen, Contoh Komentar, Tindak Lanjut) ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Card 1: Sentimen Komentar Kandidat (4 cols) */}
          {/* Card 1: Sentimen Komentar Kandidat (3 cols) */}
          <Card variant="tight" className="lg:col-span-3 flex flex-col">
            <div className="pb-3 border-b border-[var(--color-line,#0000000f)] mb-3">
              <Heading level={3} className="text-base font-black">
                Sentimen Komentar
              </Heading>
              <Text size="sm" muted className="text-xs">
                Distribusi nada feedback respon terbuka
              </Text>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 my-auto py-1">
              {/* Donut Chart with Centered Readout */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie
                      data={sentimen_data}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={64}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {sentimen_data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-lg font-black text-[var(--color-ink)] leading-none">
                    92%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                    Positif
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-1">
                {sentimen_data.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-bold text-[var(--color-ink)]">
                      {item.name}
                    </span>
                    <span className="text-xs font-black text-muted [font-variant-numeric:tabular-nums]">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 2: Contoh Komentar Kandidat (6 cols) */}
          <Card variant="tight" className="lg:col-span-6 flex flex-col">
            <div className="pb-3 border-b border-[var(--color-line,#0000000f)] mb-3">
              <Heading level={3} className="text-base font-black">
                Contoh Komentar Kandidat
              </Heading>
              <Text size="sm" muted className="text-xs">
                Aspirasi dan masukan langsung dari pelamar seleksi
              </Text>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-auto py-1">
              {contoh_komentar.map((item) => {
                const styles = {
                  blue: {
                    card: 'bg-[#EEF6FF] border-[#CDE2FE]',
                    quote: 'text-[#2563EB]',
                    author: 'text-slate-700',
                    line: 'border-[#BFDBFE]/60',
                  },
                  pink: {
                    card: 'bg-[#FFF0F3] border-[#FDCED7]',
                    quote: 'text-[#E11D48]',
                    author: 'text-slate-700',
                    line: 'border-[#FECDD3]/60',
                  },
                  mint: {
                    card: 'bg-[#EDFAF3] border-[#C3EED9]',
                    quote: 'text-[#059669]',
                    author: 'text-slate-700',
                    line: 'border-[#A7F3D0]/60',
                  },
                }[item.tone] || {
                  card: 'bg-[#EEF6FF] border-[#CDE2FE]',
                  quote: 'text-[#2563EB]',
                  author: 'text-slate-700',
                  line: 'border-[#BFDBFE]/60',
                }

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border ${styles.card} shadow-2xs flex flex-col justify-between hover:shadow-md hover:translate-y-[-2px] transition-all duration-200`}
                  >
                    <div>
                      {/* Typographic Double Quote Icon */}
                      <svg
                        className={`w-5 h-5 mb-2.5 ${styles.quote}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <div className={`mt-3.5 pt-2.5 border-t ${styles.line} flex items-center justify-between text-[11px]`}>
                      <span className={`font-bold ${styles.author}`}>
                        – {item.kandidat}
                      </span>
                      <span className="text-slate-500 font-medium text-[10px]">
                        {item.tanggal}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Card 3: Tindak Lanjut Roadmap (3 cols) */}
          <Card variant="tight" className="lg:col-span-3 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line,#0000000f)] mb-3">
              <div className="flex items-center gap-2">
                <IconListCheck size={18} className="text-[var(--color-purple)]" />
                <Heading level={3} className="text-base font-black">
                  Tindak Lanjut
                </Heading>
              </div>
              <button
                onClick={() => router.visit('/pelamar')}
                className="text-xs font-bold text-[var(--color-purple)] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Lihat Detail <IconChevronRight size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 my-auto">
              {tindak_lanjut.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-black/[0.02] border border-[var(--color-line,#0000000b)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <IconCheck size={13} stroke={3} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-ink)] truncate">
                      {item.judul}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 shadow-2xs ${
                      item.status === 'Dalam Proses'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Brand Stamp */}
            <div className="mt-3 pt-2.5 border-t border-[var(--color-line,#0000000f)] flex items-center justify-between text-[11px] text-muted">
              <span className="font-bold text-[var(--color-ink)]">PT Menara Agung</span>
              <span className="italic">One HEART. for a Better Mobility</span>
            </div>
          </Card>
        </div>
      </Stack>
    </AppLayout>
  )
}
