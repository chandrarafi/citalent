import { useState, useEffect, useRef } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { useForm } from 'react-hook-form'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Separator } from '@/components/pouf/separator'
import {
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconArrowLeft,
  IconMail,
  IconShieldCheck,
} from '@tabler/icons-react'
import AuthLayout from '@/layouts/AuthLayout'

interface VerifyResetOtpProps {
  email: string
  userName?: string
  errors?: { otp?: string; email?: string }
}

interface FormValues {
  otp: string
}

export default function VerifyResetOtp({
  email,
  userName,
  errors: serverErrors,
}: VerifyResetOtpProps) {
  const { flash } = usePage<any>().props
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const {
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { otp: '' },
    mode: 'onSubmit',
  })

  // Set server-side errors
  useEffect(() => {
    if (serverErrors?.otp) {
      setError('otp', { message: serverErrors.otp })
    }
  }, [serverErrors, setError])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus()
  }, [])

  const updateOtpValue = (newDigits: string[]) => {
    setDigits(newDigits)
    const combined = newDigits.join('')
    setValue('otp', combined, { shouldValidate: combined.length === 6 })
  }

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, '')
    const newDigits = [...digits]

    if (clean.length === 0) {
      newDigits[index] = ''
      updateOtpValue(newDigits)
      return
    }

    if (clean.length === 1) {
      newDigits[index] = clean
      updateOtpValue(newDigits)
      if (index < 5) {
        inputRefs[index + 1].current?.focus()
      }
    } else {
      const chars = clean.split('')
      let targetIdx = index
      for (let i = 0; i < chars.length && targetIdx < 6; i++, targetIdx++) {
        newDigits[targetIdx] = chars[i]
      }
      updateOtpValue(newDigits)
      const nextFocus = Math.min(index + chars.length, 5)
      inputRefs[nextFocus].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        updateOtpValue(newDigits)
        inputRefs[index - 1].current?.focus()
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        updateOtpValue(newDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs[index - 1].current?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      inputRefs[index + 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, 6)
    if (!pastedData) return

    const newDigits = [...digits]
    const chars = pastedData.split('')
    chars.forEach((char, idx) => {
      if (idx < 6) newDigits[idx] = char
    })
    updateOtpValue(newDigits)
    const nextFocus = Math.min(chars.length, 5)
    inputRefs[nextFocus].current?.focus()
  }

  const submit = handleSubmit(() => {
    const otpCode = digits.join('')
    if (otpCode.length < 6) {
      setError('otp', { message: 'Silakan lengkapi 6 digit kode OTP.' })
      return
    }

    setLoading(true)
    router.post(
      '/forgot-password/verify-otp',
      {
        email,
        otp: otpCode,
      },
      {
        onFinish: () => setLoading(false),
      }
    )
  })

  const handleResendOtp = () => {
    if (countdown > 0 || resending) return

    setResending(true)
    router.post(
      '/forgot-password/resend-otp',
      { email },
      {
        onFinish: () => {
          setResending(false)
          setCountdown(60)
          setDigits(['', '', '', '', '', ''])
          inputRefs[0].current?.focus()
        },
      }
    )
  }

  return (
    <>
      <Head title="Verifikasi OTP Lupa Kata Sandi - Citalent" />
      <AuthLayout maxWidth="max-w-[460px]">
        <form onSubmit={submit} noValidate>
          <Card>
            <Stack gap={5}>
              {/* Header */}
              <Stack gap={3}>
                <img
                  src="/assets/images/logo-red-1.png"
                  alt="Logo"
                  width={270}
                  className="mx-auto"
                />
                <Stack gap={1}>
                  <Heading size="md" className="text-center font-bold">
                    Verifikasi Kode OTP
                  </Heading>
                  <Text size="sm" muted className="text-center">
                    {userName ? `Halo ${userName}, ` : ''}kami telah mengirimkan 6 digit kode OTP ke email Anda untuk reset kata sandi.
                  </Text>
                </Stack>
              </Stack>



              {/* Flash Alerts */}
              {flash?.success && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  <IconCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{flash.success}</span>
                </div>
              )}

              {flash?.error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                  <IconAlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{flash.error}</span>
                </div>
              )}

              {flash?.info && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-sm">
                  <IconAlertCircle size={18} className="text-sky-600 shrink-0 mt-0.5" />
                  <span>{flash.info}</span>
                </div>
              )}

              {/* OTP 6-Digit Inputs */}
              <Stack gap={3}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                    Masukkan 6 Digit Kode OTP
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={inputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-bold font-mono rounded-xl border bg-white shadow-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.otp
                            ? 'border-red-500 focus:ring-red-400 text-red-600'
                            : digit
                            ? 'border-emerald-500 bg-emerald-50/40 text-slate-900 focus:ring-emerald-400'
                            : 'border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-emerald-400'
                        }`}
                      />
                    ))}
                  </div>

                  {errors.otp?.message && (
                    <p className="mt-2 text-center text-xs font-semibold text-red-600">
                      {errors.otp.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    block
                    tone="primary"
                    type="submit"
                    loading={loading}
                    className="font-bold"
                  >
                    Verifikasi Kode OTP ➔
                  </Button>
                </div>
              </Stack>

              {/* Resend Section */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resending}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    countdown > 0 || resending
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-sky-600 hover:text-sky-700 hover:underline cursor-pointer'
                  }`}
                >
                  <IconRefresh size={14} className={resending ? 'animate-spin' : ''} />
                  {resending
                    ? 'Mengirim ulang kode OTP…'
                    : countdown > 0
                    ? `Kirim ulang kode OTP (${countdown}s)`
                    : 'Kirim Ulang Kode OTP'}
                </button>
              </div>

              <Separator />

              {/* Back to Login */}
              <Row justify="center" gap={1}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <IconArrowLeft size={16} />
                  Kembali ke Halaman Masuk
                </Link>
              </Row>
            </Stack>
          </Card>
        </form>
      </AuthLayout>
    </>
  )
}
