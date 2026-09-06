import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Card } from '@/components/pouf/surface'
import { Stack, Row } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Field, Input } from '@/components/pouf/Input'
import { Button } from '@/components/pouf/Button'
import { Separator } from '@/components/pouf/separator'
import { Blob } from '@/components/pouf/media'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LoginValues {
  email: string
  password: string
}

interface LoginPageProps {
  errors?: { email?: string }
}

export default function Login({ errors: serverErrors }: LoginPageProps) {
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
  if (serverErrors?.email && !errors.email) {
    setError('email', { message: serverErrors.email })
  }

  const submit = handleSubmit((values) => {
    setLoading(true)
    router.post(
      '/login',
      { email: values.email, password: values.password },
      { onFinish: () => setLoading(false) },
    )
  })

  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 24,
        background: 'var(--color-background)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <form onSubmit={submit} noValidate>
          <Card>
            <Stack gap={5}>
              <Stack gap={3}>
                <Blob icon="lock" tone="purple" />
                <Stack gap={1}>
                  <Heading level={2}>Welcome back</Heading>
                  <Text size="sm" muted>
                    Sign in to your HR App account.
                  </Text>
                </Stack>
              </Stack>

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
                    <Row gap={2} wrap={false}>
                      <div style={{ flex: 1, minWidth: 0 }}>
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
                              placeholder="••••••••…"
                              autoComplete="current-password"
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

                <Button block type="submit" loading={loading}>
                  Sign in
                </Button>
              </Stack>

              <Separator />
              <Row justify="center">
                <Text size="sm" muted>
                  HR Management System
                </Text>
              </Row>
            </Stack>
          </Card>
        </form>
      </div>
    </div>
  )
}
