import { useState, useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Controller, useForm } from 'react-hook-form'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Field, Input } from '@/components/pouf/Input'
import { Button } from '@/components/pouf/Button'
import { Separator } from '@/components/pouf/separator'
import {
  IconCheck,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconMail,
  IconLockCheck,
} from '@tabler/icons-react'
import AuthLayout from '@/layouts/AuthLayout'

interface ResetPasswordProps {
  email: string
  userName?: string
  errors?: {
    password?: string
    password_confirmation?: string
  }
}

interface ResetPasswordValues {
  password: string
  password_confirmation: string
}

export default function ResetPassword({
  email,
  userName,
  errors: serverErrors,
}: ResetPasswordProps) {
  const { flash } = usePage<any>().props
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  // Sync server errors
  useEffect(() => {
    if (serverErrors?.password) {
      setError('password', { message: serverErrors.password })
    }
    if (serverErrors?.password_confirmation) {
      setError('password_confirmation', {
        message: serverErrors.password_confirmation,
      })
    }
  }, [serverErrors, setError])

  const newPasswordVal = watch('password')

  const submit = handleSubmit((values) => {
    setLoading(true)
    router.post(
      '/reset-password',
      {
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
      {
        onFinish: () => setLoading(false),
      }
    )
  })

  return (
    <>
      <Head title="Buat Kata Sandi Baru - Citalent" />
      <AuthLayout maxWidth="max-w-[440px]">
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
                    Buat Kata Sandi Baru
                  </Heading>
                  <Text size="sm" muted className="text-center">
                    {userName ? `Halo ${userName}, ` : ''}kode OTP telah terverifikasi. Masukkan kata sandi baru untuk akun Anda.
                  </Text>
                </Stack>
              </Stack>

              {/* Email & OTP Verified Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate">
                  <IconMail size={16} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px] shrink-0">
                  <IconCheck size={13} />
                  OTP Valid
                </span>
              </div>

              {/* Flash Messages */}
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

              <Stack gap={4}>
                {/* Password Baru */}
                <Field label="Password Baru" error={errors.password?.message}>
                  {(id, describedBy) => (
                    <div className="relative w-full">
                      <Controller
                        name="password"
                        control={control}
                        rules={{
                          required: 'Password baru wajib diisi.',
                          minLength: { value: 8, message: 'Minimal 8 karakter.' },
                        }}
                        render={({ field }) => (
                          <Input
                            ref={field.ref}
                            id={id}
                            name={field.name}
                            describedBy={describedBy}
                            type={showPassword ? 'text' : 'password'}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Minimal 8 karakter…"
                            autoComplete="new-password"
                            required
                            invalid={!!errors.password}
                            className="pr-12"
                          />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1.5 rounded-lg flex items-center justify-center focus:outline-none"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {showPassword ? (
                          <IconEyeOff size={20} stroke={1.8} />
                        ) : (
                          <IconEye size={20} stroke={1.8} />
                        )}
                      </button>
                    </div>
                  )}
                </Field>

                {/* Konfirmasi Password Baru */}
                <Field
                  label="Konfirmasi Password Baru"
                  error={errors.password_confirmation?.message}
                >
                  {(id, describedBy) => (
                    <div className="relative w-full">
                      <Controller
                        name="password_confirmation"
                        control={control}
                        rules={{
                          required: 'Konfirmasi password wajib diisi.',
                          validate: (val) =>
                            val === newPasswordVal || 'Konfirmasi password tidak cocok.',
                        }}
                        render={({ field }) => (
                          <Input
                            ref={field.ref}
                            id={id}
                            name={field.name}
                            describedBy={describedBy}
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Ulangi password baru…"
                            autoComplete="new-password"
                            required
                            invalid={!!errors.password_confirmation}
                            className="pr-12"
                          />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1.5 rounded-lg flex items-center justify-center focus:outline-none"
                        tabIndex={-1}
                        aria-label={
                          showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'
                        }
                      >
                        {showConfirmPassword ? (
                          <IconEyeOff size={20} stroke={1.8} />
                        ) : (
                          <IconEye size={20} stroke={1.8} />
                        )}
                      </button>
                    </div>
                  )}
                </Field>

                <div className="pt-2">
                  <Button
                    block
                    tone="primary"
                    type="submit"
                    loading={loading}
                    className="flex items-center justify-center gap-2 font-bold"
                  >
                    <IconLockCheck size={18} />
                    <span>Simpan Kata Sandi Baru ➔</span>
                  </Button>
                </div>
              </Stack>

              <Separator />

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
