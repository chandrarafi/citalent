import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { Controller, useForm } from 'react-hook-form'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Field, Input } from '@/components/pouf/Input'
import { Button } from '@/components/pouf/Button'
import { Separator } from '@/components/pouf/separator'
import { Blob } from '@/components/pouf/media'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

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
      <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-[var(--bg)]">
        <div className="w-full max-w-[480px]">
          <form onSubmit={submit} noValidate>
            <Card>
              <Stack gap={5}>
                <Stack gap={3}>
                  <Blob icon="users" tone="mint" />
                  <Stack gap={1}>
                    <Heading level={2}>Daftar Akun Kandidat</Heading>
                    <Text size="sm" muted>
                      Buat akun kandidat untuk melamar lowongan dan ikuti proses seleksi.
                    </Text>
                  </Stack>
                </Stack>

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
                      <Row gap={2} wrap={false}>
                        <div style={{ flex: 1, minWidth: 0 }}>
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
                              />
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="quiet"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </Button>
                      </Row>
                    )}
                  </Field>

                  {/* Konfirmasi Password */}
                  <Field
                    label="Konfirmasi Password"
                    error={errors.password_confirmation?.message}
                  >
                    {(id, describedBy) => (
                      <Row gap={2} wrap={false}>
                        <div style={{ flex: 1, minWidth: 0 }}>
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
                              />
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="quiet"
                          onClick={() => setShowPasswordConfirm((s) => !s)}
                        >
                          {showPasswordConfirm ? 'Hide' : 'Show'}
                        </Button>
                      </Row>
                    )}
                  </Field>

                  <div className="pt-2">
                    <Button block tone="mint" type="submit" loading={loading}>
                      Daftar
                    </Button>
                  </div>
                </Stack>

                <Separator />
                <Row justify="center" gap={1}>
                  <Text size="sm" muted>
                    Sudah memiliki akun?
                  </Text>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    Masuk di sini
                  </Link>
                </Row>
              </Stack>
            </Card>
          </form>
        </div>
      </div>
    </>
  )
}
