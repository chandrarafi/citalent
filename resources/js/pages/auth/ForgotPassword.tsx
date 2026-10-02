import { useState, useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Controller, useForm } from 'react-hook-form'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Field, Input } from '@/components/pouf/Input'
import { Button } from '@/components/pouf/Button'
import { Separator } from '@/components/pouf/separator'
import { IconCheck, IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import AuthLayout from '@/layouts/AuthLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ForgotPasswordValues {
  email: string
}

interface ForgotPasswordProps {
  email?: string
  errors?: { email?: string }
}

export default function ForgotPassword({
  email: initialEmail = '',
  errors: serverErrors,
}: ForgotPasswordProps) {
  const { flash } = usePage<any>().props
  const [loading, setLoading] = useState(false)

  // Ambil email dari prop atau URL search parameter jika ada
  const queryEmail =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('email') || ''
      : ''
  const defaultEmail = initialEmail || queryEmail

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    defaultValues: { email: defaultEmail },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  // Set default email jika berubah dari prop atau query
  useEffect(() => {
    if (defaultEmail) {
      setValue('email', defaultEmail)
    }
  }, [defaultEmail, setValue])

  // Map server-side errors
  useEffect(() => {
    if (serverErrors?.email) {
      setError('email', { message: serverErrors.email })
    }
  }, [serverErrors, setError])

  const submit = handleSubmit((values) => {
    setLoading(true)
    router.post(
      '/forgot-password',
      { email: values.email },
      {
        onFinish: () => setLoading(false),
      }
    )
  })

  return (
    <>
      <Head title="Lupa Kata Sandi - Citalent" />
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
                <Stack gap={1}>
                  <Heading size="md" className="text-center font-bold">
                    Lupa Kata Sandi?
                  </Heading>
                  <Text size="sm" muted className="text-center">
                    Masukkan alamat email akun Anda. Kami akan mengirimkan 6 digit kode OTP untuk mengatur ulang kata sandi.
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
                {/* Email */}
                <Field label="Alamat Email" error={errors.email?.message}>
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

                <Button block tone="primary" type="submit" loading={loading}>
                  Kirim Kode OTP Reset ➔
                </Button>
              </Stack>

              <Separator />

              <Stack gap={2} align="center">
                <Row justify="center" gap={1}>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold dark:text-blue-500 dark:hover:text-blue-600"
                  >
                    <IconArrowLeft size={16} />
                    Kembali ke Halaman Masuk
                  </Link>
                </Row>
                <Row justify="center" gap={1}>
                  <Text size="xs" muted>
                    Belum punya akun kandidat?
                  </Text>
                  <Link
                    href="/register"
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400"
                  >
                    Daftar Sekarang
                  </Link>
                </Row>
              </Stack>
            </Stack>
          </Card>
        </form>
      </AuthLayout>
    </>
  )
}
