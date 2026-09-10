import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import {
  IconStar,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconClock,
  IconHome,
  IconArrowRight,
  IconQuote,
  IconChartBar,
  IconSparkles,
} from '@tabler/icons-react'

interface Props {
  user?: {
    id: number
    name: string
    email: string
    role?: string
  } | null
  pelamar?: {
    id: number
    no_pendaftaran: string
    posisi_dilamar: string
    status: string
    tahap: string
  } | null
  already_submitted?: boolean
  last_survey?: {
    created_at: string
    skor_rata_rata: number
  } | null
  perusahaan?: string
}

interface QuestionConfig {
  id: string
  category: string
  question: string
  type: 'rating' | 'text'
  minLabel?: string
  maxLabel?: string
  placeholder?: string
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: 'q1_kemudahan_daftar',
    category: '1. Kemudahan Proses Pendaftaran',
    question: 'Seberapa mudah proses pendaftaran lowongan yang Anda ikuti?',
    type: 'rating',
    minLabel: 'Sangat Sulit',
    maxLabel: 'Sangat Mudah',
  },
  {
    id: 'q2_kejelasan_info',
    category: '2. Kejelasan Informasi',
    question: 'Informasi mengenai jadwal, tahapan seleksi, dan persyaratan mudah dipahami.',
    type: 'rating',
    minLabel: 'Sangat Tidak Setuju',
    maxLabel: 'Sangat Setuju',
  },
  {
    id: 'q3_kecepatan_proses',
    category: '3. Kecepatan Proses Rekrutmen',
    question: 'Menurut Anda, proses rekrutmen berjalan dengan cepat dan sesuai harapan.',
    type: 'rating',
    minLabel: 'Sangat Tidak Setuju',
    maxLabel: 'Sangat Setuju',
  },
  {
    id: 'q4_kemudahan_data',
    category: '4. Kemudahan Pengisian Data',
    question: 'Proses pengisian data dan dokumen pelamar mudah dilakukan.',
    type: 'rating',
    minLabel: 'Sangat Tidak Setuju',
    maxLabel: 'Sangat Setuju',
  },
  {
    id: 'q5_pengalaman_skill_test',
    category: '5. Pengalaman Saat Skill Test',
    question: 'Saya merasa proses Skill Test berjalan dengan baik dan terorganisir.',
    type: 'rating',
    minLabel: 'Sangat Tidak Setuju',
    maxLabel: 'Sangat Setuju',
  },
  {
    id: 'q6_profesionalisme_hr',
    category: '6. Profesionalisme Tim HR',
    question: 'Tim HR memberikan pelayanan yang ramah, jelas, dan profesional.',
    type: 'rating',
    minLabel: 'Sangat Tidak Setuju',
    maxLabel: 'Sangat Setuju',
  },
  {
    id: 'q7_kepuasan_keseluruhan',
    category: '7. Kepuasan Keseluruhan',
    question: 'Secara keseluruhan, saya puas dengan proses rekrutmen PT Menara Agung.',
    type: 'rating',
    minLabel: 'Sangat Tidak Puas',
    maxLabel: 'Sangat Puas',
  },
  {
    id: 'q8_hal_disukai',
    category: 'Pertanyaan Terbuka',
    question: 'Apa yang paling Anda sukai dari proses rekrutmen ini?',
    type: 'text',
    placeholder: 'Tuliskan jawaban singkat Anda di sini...',
  },
  {
    id: 'q9_hal_diperbaiki',
    category: 'Pertanyaan Terbuka',
    question: 'Apa yang perlu diperbaiki dari proses rekrutmen ini?',
    type: 'text',
    placeholder: 'Tuliskan saran perbaikan singkat Anda di sini...',
  },
]

export default function CandidateSurveyPage({
  user,
  pelamar,
  already_submitted = false,
  last_survey,
  perusahaan = 'PT Menara Agung',
}: Props) {
  // Stepper state: 'welcome' | 'survey' | 'completed'
  const [screen, setScreen] = useState<'welcome' | 'survey' | 'completed'>(
    already_submitted ? 'completed' : 'welcome'
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Survey responses form state
  const [formData, setFormData] = useState<Record<string, any>>({
    q1_kemudahan_daftar: 5,
    q2_kejelasan_info: 5,
    q3_kecepatan_proses: 5,
    q4_kemudahan_data: 5,
    q5_pengalaman_skill_test: 5,
    q6_profesionalisme_hr: 5,
    q7_kepuasan_keseluruhan: 5,
    q8_hal_disukai: '',
    q9_hal_diperbaiki: '',
    nama_kandidat: user?.name || '',
    email_kandidat: user?.email || '',
    posisi: pelamar?.posisi_dilamar || '',
  })

  const currentQ = QUESTIONS[currentIndex]

  function handleRatingChange(id: string, val: number) {
    setFormData((prev) => ({ ...prev, [id]: val }))
  }

  function handleTextChange(id: string, val: string) {
    setFormData((prev) => ({ ...prev, [id]: val }))
  }

  function handleNext() {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      submitSurvey()
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  function submitSurvey() {
    setIsSubmitting(true)
    router.post('/kandidat/survey', formData, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false)
        setScreen('completed')
      },
      onError: () => {
        setIsSubmitting(false)
        setScreen('completed')
      },
    })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg,#D4F6FF)] text-[var(--color-ink)] flex flex-col justify-between p-4 sm:p-8 font-sans">
      <Head title="Survey Kepuasan Rekrutmen — CITALENT" />

      {/* ─── Top Brand Header ────────────────────────────────────────── */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <span className="font-black text-base sm:text-lg tracking-tight text-[var(--color-ink)]">
            CITALENT
          </span>
          <span className="text-[11px] font-bold text-muted px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-[var(--color-line,#00000010)]">
            Survey Kepuasan Rekrutmen
          </span>
        </div>

        {/* Stepper Header Pills */}
        <div className="flex items-center gap-2">
          {/* Step 1: Isi Survey */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              screen === 'completed'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-blue-600 text-white shadow-xs'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              {screen === 'completed' ? '✓' : '1'}
            </span>
            <span>Isi Survey</span>
          </div>

          <div className="w-5 h-[2px] bg-black/10 dark:bg-white/10" />

          {/* Step 2: Selesai */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              screen === 'completed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-black/[0.05] text-muted'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Selesai</span>
          </div>
        </div>
      </header>

      {/* ─── Main Content Body ───────────────────────────────────────── */}
      <main className="max-w-4xl w-full mx-auto my-auto py-6">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* SCREEN 1: WELCOME SCREEN                                       */}
        {/* ───────────────────────────────────────────────────────────── */}
        {screen === 'welcome' && (
          <Card
            motion="lift"
            variant="default"
            className="border border-[var(--color-line,#00000018)] shadow-clay backdrop-blur-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-2 sm:p-6">
              {/* Illustration Left Column */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                <div className="relative w-full max-w-[270px] aspect-square rounded-3xl overflow-hidden shadow-clay border-4 border-white/90 dark:border-white/10 bg-white">
                  <img
                    src="/assets/images/candidate-survey-illustration.jpg"
                    alt="Kandidat Menyelesaikan Skill Test"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  {/* Floating badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/95 backdrop-blur-md text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-md border border-white/50">
                    <IconCheck size={14} stroke={3} />
                    <span>Skill Test Selesai</span>
                  </div>
                </div>
              </div>

              {/* Text & Action Right Column */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {/* Candidate Account Info Card */}
                {user && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/[0.06] shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-purple)]/25 text-[var(--color-ink)] flex items-center justify-center font-black text-sm border border-[var(--color-purple)]/40 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-[var(--color-ink)] truncate">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Akun Kandidat
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-muted truncate">
                        {pelamar ? `${pelamar.posisi_dilamar} • No. Reg: ${pelamar.no_pendaftaran}` : user.email}
                      </span>
                    </div>
                  </div>
                )}

                <Heading level={1} className="text-2xl sm:text-3xl font-black leading-tight text-[var(--color-ink)]">
                  Terima kasih telah menyelesaikan Skill Test!
                </Heading>

                <Text className="text-muted text-sm sm:text-base leading-relaxed">
                  Kami sangat menghargai waktu dan usaha Anda. Mohon luangkan waktu 1 menit untuk mengisi survey kepuasan kandidat guna membantu kami meningkatkan kualitas proses rekrutmen di {perusahaan}.
                </Text>

                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Button
                    tone="blue"
                    size="lg"
                    onClick={() => setScreen('survey')}
                    className="px-6 py-3 font-bold gap-2 text-sm sm:text-base shadow-clay"
                  >
                    <span>Mulai Survey</span>
                    <IconArrowRight size={18} />
                  </Button>

                  <div className="flex items-center gap-1.5 text-xs text-muted font-bold">
                    <IconClock size={16} />
                    <span>Hanya membutuhkan ±1 menit</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SCREEN 2: SURVEY QUESTIONNAIRE (Step 2)                       */}
        {/* ───────────────────────────────────────────────────────────── */}
        {screen === 'survey' && (
          <Card
            motion="lift"
            variant="default"
            className="border border-[var(--color-line,#00000018)] shadow-clay flex flex-col gap-6"
          >
            {/* Survey Header with Progress */}
            <div className="flex flex-col gap-2 pb-4 border-b border-[var(--color-line,#00000012)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-purple)]">
                  Candidate Satisfaction Survey
                </span>
                <span className="text-xs font-bold text-muted bg-black/[0.04] px-2.5 py-0.5 rounded-full [font-variant-numeric:tabular-nums]">
                  Pertanyaan {currentIndex + 1} dari {QUESTIONS.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 shadow-xs"
                  style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card Box */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/[0.05] shadow-2xs flex flex-col gap-6">
              <Stack gap={1}>
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  {currentQ.category}
                </span>
                <Heading level={2} className="text-lg sm:text-xl font-black text-[var(--color-ink)] leading-snug">
                  {currentQ.question}
                </Heading>
              </Stack>

              {/* RATING QUESTIONS (1 to 5) */}
              {currentQ.type === 'rating' && (
                <div className="flex flex-col gap-5 py-4">
                  {/* 1 - 5 Buttons with Stars */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-4">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = formData[currentQ.id] === val
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleRatingChange(currentQ.id, val)}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-clay scale-105'
                              : 'bg-surface hover:bg-black/[0.03] text-[var(--color-ink)] border-[var(--color-line,#00000015)] shadow-xs'
                          }`}
                        >
                          <IconStar
                            size={26}
                            className={
                              isSelected
                                ? 'fill-white text-white'
                                : 'text-amber-400 hover:fill-amber-400/40'
                            }
                          />
                          <span className="text-base sm:text-xl font-black mt-1.5 [font-variant-numeric:tabular-nums]">
                            {val}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Scale Labels: Min and Max */}
                  <div className="flex items-center justify-between px-1 text-xs font-bold text-muted">
                    <span className="bg-black/[0.03] px-2.5 py-1 rounded-md">
                      {currentQ.minLabel}
                    </span>
                    <span className="bg-black/[0.03] px-2.5 py-1 rounded-md">
                      {currentQ.maxLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* TEXT QUESTIONS (Open Comments) */}
              {currentQ.type === 'text' && (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={4}
                    value={formData[currentQ.id]}
                    onChange={(e) => handleTextChange(currentQ.id, e.target.value)}
                    placeholder={currentQ.placeholder}
                    className="w-full p-4 text-sm rounded-2xl bg-surface border border-[var(--color-line,#00000015)] shadow-xs focus:outline-hidden focus:border-[var(--color-purple)] transition-all resize-none text-[var(--color-ink)]"
                  />
                  <span className="text-[11px] text-muted italic text-right">
                    Jawaban singkat opsional
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Footer Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="quiet"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="gap-1.5 font-bold"
              >
                <IconChevronLeft size={18} />
                <span>Kembali</span>
              </Button>

              <Button
                tone="blue"
                size="md"
                onClick={handleNext}
                disabled={isSubmitting}
                className="gap-1.5 font-bold px-6 shadow-clay"
              >
                <span>
                  {currentIndex === QUESTIONS.length - 1 ? 'Kirim Survey' : 'Selanjutnya'}
                </span>
                <IconChevronRight size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SCREEN 3: COMPLETION / THANK YOU (Step 3)                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {screen === 'completed' && (
          <Card
            motion="lift"
            variant="default"
            className="border border-[var(--color-line,#00000018)] shadow-clay"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-2 sm:p-6">
              {/* Left Column: Success & Action */}
              <div className="md:col-span-7 flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                {/* Green Checkmark Circle */}
                <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-white animate-bounce-short">
                  <IconCheck size={42} stroke={3.5} />
                </div>

                <Heading level={1} className="text-3xl font-black text-[var(--color-ink)]">
                  Terima Kasih!
                </Heading>

                <Text className="text-muted text-sm sm:text-base leading-relaxed">
                  {already_submitted && last_survey
                    ? `Anda telah mengisi survey kepuasan ini pada ${last_survey.created_at}. Masukan Anda sangat berarti bagi kami untuk terus meningkatkan pengalaman kandidat.`
                    : 'Survey Anda telah berhasil dikirim. Masukan Anda sangat berarti bagi kami untuk terus meningkatkan pengalaman kandidat.'}
                </Text>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Button
                    tone="blue"
                    onClick={() =>
                      router.visit(user?.role === 'kandidat' ? '/kandidat/lamaran' : '/')
                    }
                    className="gap-2 font-bold px-5 py-2.5 shadow-clay"
                  >
                    <IconHome size={18} />
                    <span>
                      {user?.role === 'kandidat'
                        ? 'Kembali ke Riwayat Lamaran'
                        : 'Kembali ke Dashboard'}
                    </span>
                  </Button>

                  {already_submitted && (
                    <Button
                      variant="quiet"
                      onClick={() => setScreen('survey')}
                      className="gap-2 font-bold"
                    >
                      <IconStar size={18} />
                      <span>Isi Ulang Survey</span>
                    </Button>
                  )}

                  {user?.role !== 'kandidat' && (
                    <Button
                      variant="quiet"
                      onClick={() => router.visit('/candidate-satisfaction')}
                      className="gap-2 font-bold"
                    >
                      <IconChartBar size={18} />
                      <span>Lihat Rekap Feedback</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column: Quote Card */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/60 shadow-xs flex flex-col gap-3">
                  <IconQuote size={28} className="text-blue-500" />
                  <p className="text-sm font-semibold italic text-[var(--color-ink)] leading-relaxed">
                    &ldquo;Setiap masukan membantu kami menjadi lebih baik.&rdquo;
                  </p>
                  <div className="pt-2 border-t border-blue-200/50 flex flex-col">
                    <span className="text-xs font-black text-[var(--color-ink)]">
                      {perusahaan}
                    </span>
                    <span className="text-[11px] text-muted">Tim Human Resources</span>
                  </div>
                </div>

                {/* Slogan */}
                <div className="text-center sm:text-right pr-2">
                  <span className="text-xs font-black italic tracking-wide text-blue-800 dark:text-blue-300">
                    People Ideas for a Better Tomorrow
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* ─── Footer Brand ────────────────────────────────────────────── */}
      <footer className="max-w-4xl w-full mx-auto flex items-center justify-between text-xs text-muted py-2">
        <span>© 2026 CITALENT — PT Menara Agung</span>
        <span className="font-semibold text-red-600">One HEART. for a Better Mobility</span>
      </footer>
    </div>
  )
}
