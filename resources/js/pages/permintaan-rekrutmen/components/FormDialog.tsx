import { useMemo } from 'react'
import { Dialog, Select } from '@/components/pouf/controls'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Button } from '@/components/pouf/Button'
import { Field, Input } from '@/components/pouf/Input'
import type { DepartementItem, JabatanItem, PermintaanItem, PermintaanFormState } from '../types'
import { PRIORITAS_OPTIONS } from '../types'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: PermintaanItem | null
  form: PermintaanFormState
  setForm: React.Dispatch<React.SetStateAction<PermintaanFormState>>
  departements: DepartementItem[]
  jabatans: JabatanItem[]
  errors: Record<string, string>
  pageErrors?: Record<string, string>
  loading: boolean
  onSubmit: () => void
  onClose: () => void
}

export function FormDialog({
  open,
  onOpenChange,
  editing,
  form,
  setForm,
  departements,
  jabatans,
  errors,
  pageErrors,
  loading,
  onSubmit,
  onClose,
}: FormDialogProps) {
  // Filter positions based on selected department in form
  const filteredJabatansForForm = useMemo(() => {
    if (!form.kd_departement) return jabatans
    const dept = departements.find((d) => String(d.id) === String(form.kd_departement))
    if (!dept) return jabatans
    return jabatans.filter((j) => j.kd_departement === dept.kd_departement)
  }, [form.kd_departement, departements, jabatans])

  function handleDepartementChange(deptId: string) {
    const selectedDept = departements.find((d) => String(d.id) === String(deptId))
    const firstJabatan = selectedDept
      ? jabatans.find((j) => j.kd_departement === selectedDept.kd_departement)
      : undefined

    setForm((f) => ({
      ...f,
      kd_departement: deptId,
      posisi_id: firstJabatan ? String(firstJabatan.id) : (jabatans[0] ? String(jabatans[0].id) : ''),
    }))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={editing ? `Edit Permintaan: ${editing.kode_permintaan}` : 'Buat Permintaan Rekrutmen'}
      description="Isi rincian pengajuan kebutuhan penambahan tenaga kerja baru"
    >
      <Stack gap={4}>
        <Field
          label="Kode Permintaan"
          error={errors.kode_permintaan || pageErrors?.kode_permintaan}
        >
          {(id, describedBy) => (
            <Input
              id={id}
              describedBy={describedBy}
              value={form.kode_permintaan}
              onChange={() => {}}
              disabled
              mono
            />
          )}
        </Field>

        <Grid cols={2}>
          <Field
            label="Departemen"
            error={errors.kd_departement || pageErrors?.kd_departement}
          >
            {() => (
              <Select
                value={form.kd_departement}
                onChange={handleDepartementChange}
                options={departements.map((d) => ({
                  value: String(d.id),
                  label: d.deskripsi,
                }))}
              />
            )}
          </Field>

          <Field
            label="Posisi / Jabatan"
            error={errors.posisi_id || pageErrors?.posisi_id}
          >
            {() => (
              <Select
                value={form.posisi_id}
                onChange={(v) => setForm((f) => ({ ...f, posisi_id: v }))}
                options={filteredJabatansForForm.map((j) => ({
                  value: String(j.id),
                  label: j.nama_jabatan,
                }))}
              />
            )}
          </Field>
        </Grid>

        <Grid cols={3}>
          <Field
            label="Jumlah (Orang)"
            error={errors.jumlah || pageErrors?.jumlah}
          >
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="number"
                min="1"
                value={form.jumlah}
                onChange={(v) => setForm((f) => ({ ...f, jumlah: v }))}
                mono
              />
            )}
          </Field>

          <Field
            label="Tgl Permintaan"
            error={errors.tgl_permintaan || pageErrors?.tgl_permintaan}
          >
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="date"
                value={form.tgl_permintaan}
                onChange={(v) => setForm((f) => ({ ...f, tgl_permintaan: v }))}
              />
            )}
          </Field>

          <Field
            label="Target Join"
            error={errors.target_join || pageErrors?.target_join}
          >
            {(id, describedBy) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="date"
                value={form.target_join}
                onChange={(v) => setForm((f) => ({ ...f, target_join: v }))}
              />
            )}
          </Field>
        </Grid>

        <Field
          label="Prioritas Kebutuhan"
          error={errors.prioritas || pageErrors?.prioritas}
        >
          {() => (
            <Select
              value={form.prioritas}
              onChange={(v) => setForm((f) => ({ ...f, prioritas: v as any }))}
              options={PRIORITAS_OPTIONS}
            />
          )}
        </Field>

        {/* Dialog Action Buttons */}
        <Row gap={3} justify="end">
          <Button variant="quiet" onClick={onClose}>
            Batal
          </Button>
          <Button loading={loading} onClick={onSubmit}>
            {editing ? 'Simpan Perubahan' : 'Kirim Permintaan'}
          </Button>
        </Row>
      </Stack>
    </Dialog>
  )
}
