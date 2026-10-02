import { useState, useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Controller, useForm } from 'react-hook-form'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Field, Input } from '@/components/pouf/Input'
import { Button } from '@/components/pouf/Button'
import { Separator } from '@/components/pouf/separator'
import { Dialog } from '@/components/pouf/controls'
import {
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconCheck,
  IconBuilding,
  IconArrowRight,
  IconKey,
} from '@tabler/icons-react'
import AuthLayout from '@/layouts/AuthLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+() -]{9,20}$/

interface RegisterValues {
  [key: string]: any
  name: string
  phone: string
  email: string
  password: string
  password_confirmation: string
}

interface RegisterPageProps {
  errors?: Partial<Record<string, string>>
}

export default function Register({ errors: serverErrors }: RegisterPageProps) {
  const { flash } = usePage<any>().props
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showRegisteredModal, setShowRegisteredModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  // Pop up validasi jika email sudah terdaftar & data tersimpan di Menara Agung
  useEffect(() => {
    if (flash?.already_registered_email) {
      setRegisteredEmail(flash.already_registered_email)
      setShowRegisteredModal(true)
    } else if (
      serverErrors?.email &&
      (serverErrors.email.toLowerCase().includes('menara agung') ||
        serverErrors.email.toLowerCase().includes('pernah melamar'))
    ) {
      setRegisteredEmail(watch('email') || '')
      setShowRegisteredModal(true)
    }
  }, [flash?.already_registered_email, serverErrors?.email])

  // Map server-side errors
  if (serverErrors) {
    Object.entries(serverErrors).forEach(([key, val]) => {
      if (val && !errors[key]) {
        setError(key, { message: val })
      }
    })
  }

  const passwordVal = watch('password')

  const submit = handleSubmit((values) => {
    setLoading(true)
    router.post(
      '/register',
      values,
      {
        onFinish: () => setLoading(false),
      }
    )
  })

  return (
    <>
      <Head title="Pendaftaran Akun Kandidat - Citalent" />
      <AuthLayout maxWidth="max-w-[480px]">
        <form onSubmit={submit} noValidate>
            <Card>
              <Stack gap={5}>
                <Stack gap={3}>
                  <img
                    src="/assets/images/logo-red-1.png"
                    alt="Logo"
                    width={270}
                    className="mx-auto"
                  />
                  <Stack gap={1}>
                    <Text size="sm" muted>
                      Buat akun kandidat untuk melamar lowongan dan ikuti proses seleksi.
                    </Text>
                  </Stack>
                </Stack>

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
                  {/* Nama Lengkap */}
                  <Field label="Nama Lengkap" error={errors.name?.message}>
                    {(id, describedBy) => (
                      <Controller
                        name="name"
                        control={control}
                        rules={{
                          required: 'Nama lengkap wajib diisi.',
                          minLength: { value: 3, message: 'Minimal 3 karakter.' },
                        }}
                        render={({ field }) => (
                          <Input
                            ref={field.ref}
                            id={id}
                            name={field.name}
                            describedBy={describedBy}
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Contoh: Rafi Chandra"
                            autoComplete="name"
                            required
                            invalid={!!errors.name}
                          />
                        )}
                      />
                    )}
                  </Field>

                  {/* No HP / WhatsApp */}
                  <Field label="No. HP / WhatsApp" error={errors.phone?.message}>
                    {(id, describedBy) => (
                      <Controller
                        name="phone"
                        control={control}
                        rules={{
                          required: 'Nomor HP / WhatsApp wajib diisi.',
                          pattern: {
                            value: PHONE_RE,
                            message: 'Format nomor HP tidak valid (contoh: 081234567890).',
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            ref={field.ref}
                            id={id}
                            name={field.name}
                            describedBy={describedBy}
                            type="tel"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="081234567890"
                            autoComplete="tel"
                            inputMode="tel"
                            required
                            invalid={!!errors.phone}
                          />
                        )}
                      />
                    )}
                  </Field>

                  {/* Email */}
                  <Field label="Alamat Email" error={errors.email?.message}>
                    {(id, describedBy) => (
                      <Controller
                        name="email"
                        control={control}
                        rules={{
                          required: 'Email wajib diisi.',
                          pattern: {
                            value: EMAIL_RE,
                            message: 'Masukkan alamat email yang valid.',
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            ref={field.ref}
                            id={id}
                            name={field.name}
                            describedBy={describedBy}
                            type="email"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="you@example.com"
                            autoComplete="email"
                            inputMode="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            invalid={!!errors.email}
                          />
                        )}
                      />
                    )}
                  </Field>

                  {/* Password */}
                  <Field label="Password" error={errors.password?.message}>
                    {(id, describedBy) => (
                      <div className="relative w-full">
                        <Controller
                          name="password"
                          control={control}
                          rules={{
                            required: 'Password wajib diisi.',
                            minLength: { value: 8, message: 'Password minimal 8 karakter.' },
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

                  {/* Konfirmasi Password */}
                  <Field
                    label="Konfirmasi Password"
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
                              val === passwordVal || 'Konfirmasi password tidak sama.',
                          }}
                          render={({ field }) => (
                            <Input
                              ref={field.ref}
                              id={id}
                              name={field.name}
                              describedBy={describedBy}
                              type={showPasswordConfirm ? 'text' : 'password'}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Ulangi password…"
                              autoComplete="new-password"
                              required
                              invalid={!!errors.password_confirmation}
                              className="pr-12"
                            />
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm((s) => !s)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1.5 rounded-lg flex items-center justify-center focus:outline-none"
                          tabIndex={-1}
                          aria-label={showPasswordConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {showPasswordConfirm ? (
                            <IconEyeOff size={20} stroke={1.8} />
                          ) : (
                            <IconEye size={20} stroke={1.8} />
                          )}
                        </button>
                      </div>
                    )}
                  </Field>

                  <div className="pt-2">
                    <Button block tone="mint" type="submit" loading={loading}>
                      Daftar
                    </Button>
                  </div>
                </Stack>

                <Separator />
                <Stack gap={2} align="center">
                  <Row justify="center" gap={1}>
                    <Text size="sm" muted>
                      Sudah memiliki akun?
                    </Text>
                    <Link
                      href={watch('email') ? `/login?email=${encodeURIComponent(watch('email'))}` : '/login'}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      Masuk di sini
                    </Link>
                  </Row>
                  <Row justify="center" gap={1}>
                    <Text size="xs" muted>
                      Lupa kata sandi akun Anda?
                    </Text>
                    <Link
                      href={watch('email') ? `/forgot-password?email=${encodeURIComponent(watch('email'))}` : '/forgot-password'}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Reset Password
                    </Link>
                  </Row>
                </Stack>
              </Stack>
            </Card>
          </form>

        {/* Pop Up Validasi Email Sudah Pernah Melamar di Menara Agung */}
        <Dialog
          open={showRegisteredModal}
          onOpenChange={setShowRegisteredModal}
          size="md"
          title="Data Anda Sudah Tersimpan"
          description="Pemberitahuan Akun Pelamar PT. Menara Agung"
        >
          <Stack gap={4} className="py-1">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-amber-500">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider">
                  Email Terdaftar
                </div>
                <div className="text-sm font-semibold break-all ">
                  {registeredEmail || watch('email')}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm  leading-relaxed">
              <p>
                Email ini sudah terdaftar karena <strong>Anda sudah pernah melamar pekerjaan dan data Anda sudah tersimpan di PT. Menara Agung</strong>.
              </p>
              <p className="text-xs ">
                Anda tidak perlu membuat akun baru. Silakan langsung masuk menggunakan password akun Anda, atau atur ulang kata sandi bila Anda lupa password.
              </p>
            </div>

            <Separator />

            <Stack gap={2}>
              <Button
                block
                tone="mint"
                onClick={() => {
                  const targetEmail = registeredEmail || watch('email') || ''
                  router.visit(
                    targetEmail ? `/login?email=${encodeURIComponent(targetEmail)}` : '/login'
                  )
                }}
                className="flex items-center justify-center gap-2 font-bold cursor-pointer"
              >
                <span>Masuk ke Akun Sekarang</span>
                <IconArrowRight size={18} />
              </Button>

              <Button
                block
                tone="pink"
                onClick={() => {
                  const targetEmail = registeredEmail || watch('email') || ''
                  router.visit(
                    targetEmail
                      ? `/forgot-password?email=${encodeURIComponent(targetEmail)}`
                      : '/forgot-password'
                  )
                }}
                className="flex items-center justify-center gap-2 font-bold text-xs cursor-pointer"
              >
                <IconKey size={16} />
                <span>Lupa Kata Sandi? Reset Password</span>
              </Button>

              <Button
                block
                tone="blue"
                size="sm"
                onClick={() => setShowRegisteredModal(false)}
                className="cursor-pointer mt-1"
              >
                Tutup & Gunakan Email Lain
              </Button>
            </Stack>
          </Stack>
        </Dialog>
      </AuthLayout>
    </>
  )
}
