import { useState, useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Field, Input } from '@/components/pouf/Input'
import { Button } from '@/components/pouf/Button'
import { Separator } from '@/components/pouf/separator'
import { Blob } from '@/components/pouf/media'
import { IconCheck, IconAlertCircle, IconEye, IconEyeOff } from '@tabler/icons-react'
import AuthLayout from '@/layouts/AuthLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LoginValues {
  email: string
  password: string
}

interface LoginPageProps {
  errors?: { email?: string; password?: string }
}

export default function Login({ errors: serverErrors }: LoginPageProps) {
  const { flash } = usePage<any>().props
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const email = useWatch({ control, name: 'email' })

  // Map server-side errors back to react-hook-form
  useEffect(() => {
    if (serverErrors?.email) {
      setError('email', { message: serverErrors.email })
    }
    if (serverErrors?.password) {
      setError('password', { message: serverErrors.password })
    }
  }, [serverErrors, setError])

  const submit = handleSubmit((values) => {
    setLoading(true)
    router.post(
      '/login',
      { email: values.email, password: values.password },
      { onFinish: () => setLoading(false) },
    )
  })

  return (
    <>
      <Head title="Masuk - Citalent" />
      <AuthLayout maxWidth="max-w-[420px]">
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

              <Stack gap={4}>
                {/* Email */}
                <Field label="Email" error={errors.email?.message}>
                  {(id, describedBy) => (
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: 'Email wajib diisi.',
                        pattern: { value: EMAIL_RE, message: 'Masukkan alamat email yang valid.' },
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
                          placeholder="you@example.com…"
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
                            placeholder="•••••••"
                            autoComplete="current-password"
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

                <Button block type="submit" loading={loading}>
                  Sign in
                </Button>
              </Stack>

              <Separator />
              <Row justify="center" gap={1}>
                <Text size="sm" muted>
                  Belum punya akun kandidat?
                </Text>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400"
                >
                  Daftar Sekarang
                </Link>
              </Row>
            </Stack>
          </Card>
        </form>
      </AuthLayout>
    </>
  )
}
