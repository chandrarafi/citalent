import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Badge, Blob } from '@/components/pouf/media'
import { Button } from '@/components/pouf/Button'
import { Select } from '@/components/pouf/controls'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart as RPieChart,
  Pie,
  Cell,
  LineChart as RLineChart,
  RadarChart as RRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import {
  IconUsers,
  IconBriefcase,
  IconClock,
  IconUserCheck,
  IconSearch,
  IconCalendar,
  IconCode,
  IconChartBar,
  IconSettings,
  IconFileText,
  IconBox,
  IconChevronRight,
  IconArrowUpRight,
  IconArrowDownRight,
} from '@tabler/icons-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Props {
  metrics?: {
    total_kandidat: number
    kandidat_growth: number
    posisi_dibuka: number
    proses_berjalan: number
    kandidat_diterima: number
  }
  tren_rekrutmen?: Array<{
    bulan: string
    kandidat: number
    diterima: number
    posisi: number
  }>
  sumber_kandidat?: Array<{
    name: string
    value: number
    count: number
    color: string
  }>
  rekrutmen_aktif?: Array<{
    id: number
    posisi: string
    kode: string
    terisi: number
    target: number
    persen: number
    tone: 'blue' | 'mint' | 'orange' | 'purple' | 'pink'
    color: string
  }>
  tahapan_funnel?: Array<{
    label: string
    count: number
    persen: number
    color: string
  }>
  time_to_hire?: Array<{
    bulan: string
    hari: number
  }>
  radar_penilaian?: Array<{
    subjek: string
    kandidat: number
    standar: number
    fullMark: number
  }>
  top_kandidat?: Array<{
    no: number
    nama: string
    posisi: string
    total_nilai: number
    status: string
    tone: 'mint' | 'blue' | 'yellow'
  }>
  peminat_terbanyak?: Array<{
    posisi: string
    jumlah: number
    max: number
  }>
  jadwal_interview?: Array<{
    id: number
    jam: string
    nama: string
    posisi: string
    tahap: string
    avatar: string
  }>
  current_date?: string
}

const ICON_MAP: Record<number, any> = {
  0: IconCode,
  1: IconChartBar,
  2: IconSettings,
  3: IconFileText,
  4: IconBox,
}

export default function DashboardPage({
  metrics,
  tren_rekrutmen,
  sumber_kandidat,
  rekrutmen_aktif,
  tahapan_funnel,
  time_to_hire,
  radar_penilaian,
  top_kandidat,
  peminat_terbanyak,
  jadwal_interview,
  current_date,
}: Props) {
  const { auth } = usePage<any>().props
  const [tahunTren, setTahunTren] = useState('2026')
  const [tahunSumber, setTahunSumber] = useState('2026')
  const [tahunTimeToHire, setTahunTimeToHire] = useState('2026')
  const [posisiRadar, setPosisiRadar] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const userName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'HR Team'

  // Data bindings with sensible fallbacks
  const stats = {
    total_kandidat: metrics?.total_kandidat ?? 842,
    kandidat_growth: metrics?.kandidat_growth ?? 18,
    posisi_dibuka: metrics?.posisi_dibuka ?? 12,
    proses_berjalan: metrics?.proses_berjalan ?? 6,
    kandidat_diterima: metrics?.kandidat_diterima ?? 24,
  }

  const trenData = tren_rekrutmen && tren_rekrutmen.length > 0 ? tren_rekrutmen : [
    { bulan: 'Jan', kandidat: 125, diterima: 12, posisi: 65 },
    { bulan: 'Feb', kandidat: 155, diterima: 18, posisi: 78 },
    { bulan: 'Mar', kandidat: 158, diterima: 22, posisi: 95 },
    { bulan: 'Apr', kandidat: 188, diterima: 25, posisi: 102 },
    { bulan: 'Mei', kandidat: 165, diterima: 20, posisi: 88 },
    { bulan: 'Jun', kandidat: 170, diterima: 22, posisi: 95 },
    { bulan: 'Jul', kandidat: 184, diterima: 28, posisi: 105 },
    { bulan: 'Ags', kandidat: 180, diterima: 26, posisi: 100 },
    { bulan: 'Sep', kandidat: 164, diterima: 24, posisi: 92 },
    { bulan: 'Okt', kandidat: 186, diterima: 30, posisi: 110 },
    { bulan: 'Nov', kandidat: 208, diterima: 38, posisi: 128 },
    { bulan: 'Des', kandidat: 175, diterima: 24, posisi: 92 },
  ]

  const PALETTE_COLORS = [
    '#3b82f6', // Biru
    '#10b981', // Hijau Emerald
    '#f59e0b', // Kuning Emas / Amber
    '#8b5cf6', // Ungu
    '#ec4899', // Pink
    '#06b6d4', // Cyan / Biru Laut
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#e11d48', // Merah Rose
  ]

  const rawSumber = sumber_kandidat && sumber_kandidat.length > 0 ? sumber_kandidat : [
    { name: 'Internal Employee', value: 38, count: 320, color: '#3b82f6' },
    { name: 'Job Portal (JobStreet, dll)', value: 22, count: 185, color: '#10b981' },
    { name: 'Website Astra Motor', value: 18, count: 152, color: '#f59e0b' },
    { name: 'Referral', value: 12, count: 101, color: '#8b5cf6' },
    { name: 'Universitas', value: 6, count: 51, color: '#ec4899' },
    { name: 'Lainnya', value: 4, count: 33, color: '#06b6d4' },
  ]

  const sumberData = rawSumber.map((s, idx) => ({
    ...s,
    color: s.color || PALETTE_COLORS[idx % PALETTE_COLORS.length],
  }))

  const activeVacancies = rekrutmen_aktif && rekrutmen_aktif.length > 0 ? rekrutmen_aktif : [
    { id: 1, posisi: 'IT Programmer', kode: 'AM/2026/001', terisi: 35, target: 50, persen: 70, tone: 'blue' as const, color: '#3b82f6' },
    { id: 2, posisi: 'Marketing SPV', kode: 'AM/2026/002', terisi: 28, target: 30, persen: 93, tone: 'mint' as const, color: '#10b981' },
    { id: 3, posisi: 'Service Advisor', kode: 'AM/2026/003', terisi: 14, target: 20, persen: 70, tone: 'orange' as const, color: '#f97316' },
    { id: 4, posisi: 'Admin Dealer', kode: 'AM/2026/004', terisi: 42, target: 50, persen: 84, tone: 'purple' as const, color: '#a855f7' },
    { id: 5, posisi: 'Part Staff', kode: 'AM/2026/005', terisi: 18, target: 25, persen: 72, tone: 'pink' as const, color: '#ec4899' },
  ]

  const funnelData = tahapan_funnel && tahapan_funnel.length > 0 ? tahapan_funnel : [
    { label: 'Lamar', count: 842, persen: 100, color: '#2563eb' },
    { label: 'Screening CV', count: 612, persen: 73, color: '#38bdf8' },
    { label: 'Interview HR', count: 384, persen: 46, color: '#34d399' },
    { label: 'Interview User', count: 216, persen: 26, color: '#fbbf24' },
    { label: 'Offering', count: 48, persen: 6, color: '#fb923c' },
    { label: 'Diterima', count: 24, persen: 3, color: '#f43f5e' },
  ]

  const hireTrend = time_to_hire && time_to_hire.length > 0 ? time_to_hire : [
    { bulan: 'Jan', hari: 27 },
    { bulan: 'Feb', hari: 20 },
    { bulan: 'Mar', hari: 20 },
    { bulan: 'Apr', hari: 16 },
    { bulan: 'Mei', hari: 15 },
    { bulan: 'Jun', hari: 14 },
    { bulan: 'Jul', hari: 12 },
    { bulan: 'Ags', hari: 9 },
  ]

  const radarData = radar_penilaian && radar_penilaian.length > 0 ? radar_penilaian : [
    { subjek: 'Kompetensi Teknis', kandidat: 85, standar: 75, fullMark: 100 },
    { subjek: 'Komunikasi', kandidat: 78, standar: 80, fullMark: 100 },
    { subjek: 'Problem Solving', kandidat: 72, standar: 70, fullMark: 100 },
    { subjek: 'Sikap Kerja', kandidat: 88, standar: 80, fullMark: 100 },
    { subjek: 'Potensi & Learning Agility', kandidat: 80, standar: 75, fullMark: 100 },
  ]

  const topCandidates = top_kandidat && top_kandidat.length > 0 ? top_kandidat : [
    { no: 1, nama: 'Andi Pratama', posisi: 'IT Programmer', total_nilai: 92, status: 'Rekomendasi', tone: 'mint' as const },
    { no: 2, nama: 'Siti Nurhaliza', posisi: 'Marketing SPV', total_nilai: 90, status: 'Rekomendasi', tone: 'mint' as const },
    { no: 3, nama: 'Budi Santoso', posisi: 'Service Advisor', total_nilai: 88, status: 'Dipertimbangkan', tone: 'blue' as const },
    { no: 4, nama: 'Rina Aprilia', posisi: 'Admin Dealer', total_nilai: 87, status: 'Dipertimbangkan', tone: 'blue' as const },
    { no: 5, nama: 'Yusuf Hidayat', posisi: 'Part Staff', total_nilai: 85, status: 'Proses Lanjut', tone: 'yellow' as const },
  ]

  const popularPositions = peminat_terbanyak && peminat_terbanyak.length > 0 ? peminat_terbanyak : [
    { posisi: 'Admin Dealer', jumlah: 142, max: 150 },
    { posisi: 'IT Programmer', jumlah: 128, max: 150 },
    { posisi: 'Marketing SPV', jumlah: 96, max: 150 },
    { posisi: 'Service Advisor', jumlah: 88, max: 150 },
    { posisi: 'Part Staff', jumlah: 76, max: 150 },
  ]

  const interviewSchedules = jadwal_interview && jadwal_interview.length > 0 ? jadwal_interview : [
    { id: 1, jam: '08.00', nama: 'Ahmad Rizky', posisi: 'IT Programmer', tahap: 'Interview HR', avatar: '/assets/images/user.png' },
    { id: 2, jam: '10.00', nama: 'Nadia Putri', posisi: 'Marketing SPV', tahap: 'Interview User', avatar: '/assets/images/user.png' },
    { id: 3, jam: '13.00', nama: 'Dimas Saputra', posisi: 'Service Advisor', tahap: 'Interview HR', avatar: '/assets/images/user.png' },
    { id: 4, jam: '15.00', nama: 'Laily Rahma', posisi: 'Admin Dealer', tahap: 'Interview User', avatar: '/assets/images/user.png' },
  ]

  return (
    <AppLayout>
      <Head title="Dashboard Rekrutmen & Talenta" />

      <Stack gap={5} className="w-full">
        {/* ─── Top Header & Search Bar ────────────────────────────────────────── */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-1">
          <Stack gap={1}>
            <Heading level={1} className="flex items-center gap-2">
              Selamat Pagi, {userName}! <span>👋</span>
            </Heading>
            <Text size="sm" muted>
              Bersama kita menemukan talenta terbaik untuk masa depan Astra Motor
            </Text>
          </Stack>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kandidat, posisi, atau nomor..."
                className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-full bg-surface border border-[var(--color-line,#00000015)] shadow-xs focus:outline-hidden focus:border-[var(--color-purple)] transition-all"
              />
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
            </div>

            {/* Date Pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface border border-[var(--color-line,#00000015)] shadow-xs text-xs font-semibold text-[var(--color-ink)] shrink-0">
              <IconCalendar size={16} className="text-[var(--color-purple)]" />
              <span>{current_date || 'Selasa, 8 September 2026'}</span>
            </div>
          </div>
        </div>

        {/* ─── Top 4 KPI Readout Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Kandidat */}
          <Card motion="lift" variant="tight">
            <Row justify="between" align="center" wrap={false}>
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Total Kandidat
                </Text>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {stats.total_kandidat}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    <IconArrowUpRight size={14} /> {stats.kandidat_growth}%
                  </span>
                </div>
                <Text size="sm" muted className="text-xs">
                  dari periode sebelumnya
                </Text>
              </Stack>
              <Blob icon="users" tone="blue" size="sm" />
            </Row>
          </Card>

          {/* Card 2: Posisi Dibuka */}
          <Card motion="lift" variant="tight">
            <Row justify="between" align="center" wrap={false}>
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Posisi Dibuka
                </Text>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {stats.posisi_dibuka}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    <IconArrowUpRight size={14} /> 33%
                  </span>
                </div>
                <Text size="sm" muted className="text-xs">
                  dari periode sebelumnya
                </Text>
              </Stack>
              <Blob icon="target" tone="mint" size="sm" />
            </Row>
          </Card>

          {/* Card 3: Proses Berjalan */}
          <Card motion="lift" variant="tight">
            <Row justify="between" align="center" wrap={false}>
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Proses Berjalan
                </Text>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {stats.proses_berjalan}
                  </span>
                  <span className="text-xs font-bold text-rose-500 flex items-center">
                    <IconArrowDownRight size={14} /> 25%
                  </span>
                </div>
                <Text size="sm" muted className="text-xs">
                  dari periode sebelumnya
                </Text>
              </Stack>
              <Blob icon="clock" tone="pink" size="sm" />
            </Row>
          </Card>

          {/* Card 4: Kandidat Diterima */}
          <Card motion="lift" variant="tight">
            <Row justify="between" align="center" wrap={false}>
              <Stack gap={1}>
                <Text size="sm" muted className="text-xs font-extrabold tracking-wider uppercase">
                  Kandidat Diterima
                </Text>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                    {stats.kandidat_diterima}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    <IconArrowUpRight size={14} /> 41%
                  </span>
                </div>
                <Text size="sm" muted className="text-xs">
                  dari periode sebelumnya
                </Text>
              </Stack>
              <Blob icon="ok" tone="purple" size="sm" />
            </Row>
          </Card>
        </div>

        {/* ─── ROW 1: Tren Rekrutmen (7 cols) & Sumber Kandidat (5 cols) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-stretch">
          {/* Tren Rekrutmen Chart (7 cols) */}
          <Card className="lg:col-span-7">
            <Stack gap={4}>
              <Row justify="between" align="center">
                <Heading level={3}>Tren Rekrutmen 2025 - 2026</Heading>
                <div className="w-32">
                  <Select
                    value={tahunTren}
                    onChange={setTahunTren}
                    options={[
                      { value: '2026', label: 'Tahun 2026' },
                      { value: '2025', label: 'Tahun 2025' },
                    ]}
                  />
                </div>
              </Row>

              {/* Chart Legends */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                  <span>Jumlah Kandidat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>Kandidat Diterima</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                  <span>Posisi Dibuka</span>
                </div>
              </div>

              {/* Composed Chart */}
              <div className="w-full h-64 -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trenData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={30} />
                    <RechartsTooltip />
                    <Bar dataKey="diterima" name="Kandidat Diterima" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                    <Line type="monotone" dataKey="kandidat" name="Jumlah Kandidat" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="posisi" name="Posisi Dibuka" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Stack>
          </Card>

          {/* Sumber Kandidat Donut (5 cols) - Wide & Spacious */}
          <Card className="lg:col-span-5 flex flex-col justify-between">
            <Stack gap={3} className="h-full justify-between">
              <Row justify="between" align="center">
                <Heading level={3}>Sumber Kandidat</Heading>
                <div className="w-32">
                  <Select
                    value={tahunSumber}
                    onChange={setTahunSumber}
                    options={[
                      { value: '2026', label: 'Tahun 2026' },
                      { value: '2025', label: 'Tahun 2025' },
                    ]}
                  />
                </div>
              </Row>

              <div className="relative w-full h-48 flex items-center justify-center my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <RechartsTooltip />
                    <Pie
                      data={sumberData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {sumberData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RPieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-[var(--color-ink)] leading-none">
                    {stats.total_kandidat}
                  </span>
                  <span className="text-xs text-muted font-medium mt-0.5">Kandidat</span>
                </div>
              </div>

              {/* Slices Legend List with room for full text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1 border-t border-[var(--color-line,#0000000a)]">
                {sumberData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-muted text-xs font-medium" title={item.name}>
                      {item.name}
                    </span>
                    <span className="font-bold text-xs ml-auto shrink-0 pl-1">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </Stack>
          </Card>
        </div>

        {/* ─── ROW 2: Tahapan Funnel, Time to Hire, & Radar Penilaian ──────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Tahapan Kandidat Funnel */}
          <Card>
            <Stack gap={3}>
              <Heading level={3}>Tahapan Kandidat</Heading>
              <div className="flex flex-col gap-2.5 pt-1">
                {funnelData.map((t) => (
                  <div key={t.label} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold">{t.label}</span>
                      <span className="text-muted font-medium">
                        <strong className="text-[var(--color-ink)]">{t.count}</strong> ({t.persen}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${t.persen}%`,
                          backgroundColor: t.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Stack>
          </Card>

          {/* Time to Hire */}
          <Card>
            <Stack gap={3}>
              <Row justify="between" align="center">
                <Heading level={3}>Time to Hire</Heading>
                <div className="w-28">
                  <Select
                    value={tahunTimeToHire}
                    onChange={setTahunTimeToHire}
                    options={[
                      { value: '2026', label: 'Tahun 2026' },
                      { value: '2025', label: 'Tahun 2025' },
                    ]}
                  />
                </div>
              </Row>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-extrabold text-[var(--color-ink)]">18 hari</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <IconArrowDownRight size={14} /> 40%
                </span>
              </div>
              <Text size="sm" muted className="text-xs">dari periode sebelumnya</Text>

              {/* Sparkline chart */}
              <div className="w-full h-32 -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={hireTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={25} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="hari" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            </Stack>
          </Card>

          {/* Kinerja Penilaian Kandidat Radar */}
          <Card>
            <Stack gap={3}>
              <Row justify="between" align="center">
                <Heading level={3}>Kinerja Penilaian</Heading>
                <div className="w-32">
                  <Select
                    value={posisiRadar}
                    onChange={setPosisiRadar}
                    options={[
                      { value: 'all', label: 'Semua Posisi' },
                      { value: 'it', label: 'IT Programmer' },
                      { value: 'mkt', label: 'Marketing SPV' },
                    ]}
                  />
                </div>
              </Row>

              <div className="w-full h-44 -my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RRadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subjek" tick={{ fontSize: 9, fill: 'var(--color-muted)' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Rata-rata Kandidat" dataKey="kandidat" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                    <Radar name="Standar Posisi" dataKey="standar" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} strokeDasharray="3 3" />
                    <RechartsTooltip />
                  </RRadarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex justify-center items-center gap-4 text-[11px] text-muted pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                  <span>Rata-rata Kandidat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7] border border-dashed border-[#a855f7]" />
                  <span>Standar Posisi</span>
                </div>
              </div>
            </Stack>
          </Card>
        </div>

        {/* ─── ROW 3: Detail Rekrutmen, Kandidat & Jadwal (Bottom 2-Columns) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
          {/* ════ LEFT COLUMN (7 cols): Top 5 Kandidat & Rekrutmen Aktif ══════ */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Top 5 Kandidat Terbaik */}
            <Card>
              <Stack gap={4}>
                <Row justify="between" align="center">
                  <Heading level={3}>Kandidat Terbaik (Top 5)</Heading>
                  <Button
                    variant="quiet"
                    tone="purple"
                    size="sm"
                    onClick={() => router.get('/pelamar')}
                  >
                    Lihat Semua ↗
                  </Button>
                </Row>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--color-line,#00000010)] text-muted font-semibold">
                        <th className="py-2 pr-2">No</th>
                        <th className="py-2 pr-3">Nama Kandidat</th>
                        <th className="py-2 pr-3">Posisi</th>
                        <th className="py-2 pr-3 text-center">Total Nilai</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-line,#0000000a)]">
                      {topCandidates.map((k) => (
                        <tr key={k.no} className="hover:bg-black/[0.02] transition-colors">
                          <td className="py-2.5 pr-2 font-mono text-muted">{k.no}</td>
                          <td className="py-2.5 pr-3 font-semibold text-[var(--color-ink)]">
                            <Row gap={2} align="center" wrap={false}>
                              <div className="w-6 h-6 rounded-full bg-[var(--color-purple)]/20 text-[var(--color-ink)] flex items-center justify-center shrink-0 font-bold text-[10px]">
                                {k.nama.charAt(0)}
                              </div>
                              <span className="truncate">{k.nama}</span>
                            </Row>
                          </td>
                          <td className="py-2.5 pr-3 text-muted">{k.posisi}</td>
                          <td className="py-2.5 pr-3 text-center font-bold text-blue-600">
                            {k.total_nilai}
                          </td>
                          <td className="py-2.5 text-right">
                            <Badge tone={k.tone}>{k.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Stack>
            </Card>

            {/* Rekrutmen Aktif Card (Moved here) */}
            <Card>
              <Stack gap={4}>
                <Row justify="between" align="center">
                  <Heading level={3}>Rekrutmen Aktif</Heading>
                  <Button
                    tone="blue"
                    size="sm"
                    onClick={() => router.get('/lowongan')}
                  >
                    Lihat Semua ↗
                  </Button>
                </Row>

                <div className="flex flex-col gap-3.5">
                  {activeVacancies.map((r, i) => {
                    const IconComponent = ICON_MAP[i % 5] || IconCode
                    return (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-2xl bg-surface border border-[var(--color-line,#0000000f)] shadow-2xs hover:border-[var(--color-purple)] transition-all cursor-pointer"
                        onClick={() => router.get('/lowongan')}
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs"
                              style={{ backgroundColor: r.color }}
                            >
                              <IconComponent size={18} />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-bold text-sm text-[var(--color-ink,#0f172a)] truncate leading-tight">
                                {r.posisi}
                              </span>
                              <span className="text-xs text-[var(--color-muted,#64748b)] font-mono truncate leading-tight mt-0.5">
                                {r.kode}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <span className="font-bold text-xs text-[var(--color-ink,#0f172a)]">
                              {r.terisi} / {r.target}
                            </span>
                            <span className="font-extrabold text-emerald-600 text-xs mt-0.5">
                              {r.persen}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-black/5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${r.persen}%`,
                              backgroundColor: r.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Stack>
            </Card>
          </div>

          {/* ════ RIGHT COLUMN (5 cols): Jadwal Interview & Peminat Terbanyak ═ */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Jadwal Interview Hari Ini Card */}
            <Card>
              <Stack gap={4}>
                <Row justify="between" align="center">
                  <Heading level={3}>Jadwal Interview Hari Ini</Heading>
                  <Button
                    variant="quiet"
                    tone="purple"
                    size="sm"
                    onClick={() => router.get('/pelamar')}
                  >
                    Lihat Semua ↗
                  </Button>
                </Row>

                <div className="flex flex-col gap-3">
                  {interviewSchedules.map((j) => (
                    <div
                      key={j.id}
                      className="p-2.5 rounded-2xl bg-surface border border-[var(--color-line,#0000000f)] shadow-2xs hover:shadow-xs transition-all"
                    >
                      <Row gap={2} align="center" justify="between" wrap={false}>
                        <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs shrink-0 font-mono">
                          {j.jam}
                        </div>

                        <Row gap={2} align="center" wrap={false} className="min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--color-line)] shrink-0 bg-black/5">
                            <img
                              src={j.avatar}
                              alt={j.nama}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/user.png'
                              }}
                            />
                          </div>
                          <Stack gap={1} className="min-w-0">
                            <Text size="sm" className="font-bold truncate leading-tight">
                              {j.nama}
                            </Text>
                            <Text size="sm" muted truncate className="leading-tight text-xs">
                              {j.posisi} &bull; <span className="text-purple-600 font-semibold">{j.tahap}</span>
                            </Text>
                          </Stack>
                        </Row>

                        <Button
                          size="sm"
                          tone="blue"
                          onClick={() => router.get('/pelamar')}
                        >
                          Mulai
                        </Button>
                      </Row>
                    </div>
                  ))}
                </div>
              </Stack>
            </Card>

            {/* Posisi dengan Peminat Terbanyak */}
            <Card>
              <Stack gap={4}>
                <Row justify="between" align="center">
                  <Heading level={3}>Peminat Terbanyak</Heading>
                  <Button
                    variant="quiet"
                    tone="purple"
                    size="sm"
                    onClick={() => router.get('/lowongan')}
                  >
                    Lihat Semua ↗
                  </Button>
                </Row>

                <div className="flex flex-col gap-3 pt-1">
                  {popularPositions.map((p) => {
                    const persen = Math.round((p.jumlah / Math.max(1, p.max)) * 100)
                    return (
                      <div key={p.posisi} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[var(--color-ink)]">{p.posisi}</span>
                          <span className="font-bold text-blue-600">{p.jumlah}</span>
                        </div>
                        <div className="w-full h-3.5 bg-black/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
                            style={{ width: `${persen}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Stack>
            </Card>
          </div>
        </div>
      </Stack>
    </AppLayout>
  )
}
