import { Dialog, Select } from '@/components/pouf/controls'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import type { PublishFormState } from '../types'
import { TIPE_PEKERJAAN_OPTIONS } from '../types'

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: PublishFormState
  setForm: React.Dispatch<React.SetStateAction<PublishFormState>>
  errors: Record<string, string>
  pageErrors?: Record<string, string>
  loading: boolean
  onSubmit: () => void
  onClose: () => void
}

export function PublishDialog({
  open,
  onOpenChange,
  form,
  setForm,
  errors,
  pageErrors,
  loading,
  onSubmit,
  onClose,
}: PublishDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Publikasikan Lowongan Pekerjaan"
      description="Formulir publikasi lowongan kerja untuk pendaftaran kandidat eksternal"
    >
      <Stack gap={4}>
        <Field label="Judul Lowongan Pekerjaan *" error={errors.judul || pageErrors?.judul}>
          {(id, describedBy) => (
            <Input
              id={id}
              describedBy={describedBy}
              value={form.judul}
              onChange={(v) => setForm((f) => ({ ...f, judul: v }))}
              placeholder="contoh: Senior Backend Developer"
            />
          )}
        </Field>

        <Grid cols={2}>
          <Field label="Tipe Pekerjaan *" error={errors.tipe_pekerjaan || pageErrors?.tipe_pekerjaan}>
            {() => (
              <Select
                value={form.tipe_pekerjaan}
                onChange={(v) => setForm((f) => ({ ...f, tipe_pekerjaan: v }))}
                options={TIPE_PEKERJAAN_OPTIONS}
              />
            )}
          </Field>

          <Field label="Lokasi Kerja *" error={errors.lokasi_kerja || pageErrors?.lokasi_kerja}>
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                value={form.lokasi_kerja}
                onChange={(v) => setForm((f) => ({ ...f, lokasi_kerja: v }))}
                placeholder="contoh: Jakarta Selatan / Hybrid"
              />
            )}
          </Field>
        </Grid>

        <Grid cols={2}>
          <Field label="Tanggal Buka *" error={errors.tgl_buka || pageErrors?.tgl_buka}>
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="date"
                value={form.tgl_buka}
                onChange={(v) => setForm((f) => ({ ...f, tgl_buka: v }))}
              />
            )}
          </Field>

          <Field label="Batas Akhir Pendaftaran (Tgl Tutup)" error={errors.tgl_tutup || pageErrors?.tgl_tutup}>
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="date"
                value={form.tgl_tutup}
                onChange={(v) => setForm((f) => ({ ...f, tgl_tutup: v }))}
              />
            )}
          </Field>
        </Grid>

        <Field label="Deskripsi Pekerjaan" error={errors.deskripsi || pageErrors?.deskripsi}>
          {() => (
            <textarea
              className="w-full min-h-[90px] p-3 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] text-[14px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
              value={form.deskripsi}
              onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
              placeholder="Rincian tanggung jawab dan tugas posisi ini..."
            />
          )}
        </Field>

        <Field label="Kualifikasi & Persyaratan" error={errors.kualifikasi || pageErrors?.kualifikasi}>
          {() => (
            <textarea
              className="w-full min-h-[90px] p-3 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] text-[14px] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
              value={form.kualifikasi}
              onChange={(e) => setForm((f) => ({ ...f, kualifikasi: e.target.value }))}
              placeholder="Syarat pendidikan, pengalaman, dan keahlian yang dibutuhkan..."
            />
          )}
        </Field>

        {/* Action buttons */}
        <Row gap={3} justify="end">
          <Button variant="quiet" onClick={onClose}>
            Batal
          </Button>
          <Button loading={loading} tone="purple" onClick={onSubmit}>
            Publikasikan Lowongan & Buat Link Form Pendaftaran
          </Button>
        </Row>
      </Stack>
    </Dialog>
  )
}
