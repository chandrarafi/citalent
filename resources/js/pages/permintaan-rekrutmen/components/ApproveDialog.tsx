import { Dialog } from '@/components/pouf/controls'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Badge } from '@/components/pouf/media'
import type { PermintaanItem } from '../types'

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: PermintaanItem | null
  loading: boolean
  onApprove: (item: PermintaanItem, andPublish: boolean) => void
}

export function ApproveDialog({
  open,
  onOpenChange,
  item,
  loading,
  onApprove,
}: ApproveDialogProps) {
  if (!item) return null

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Persetujuan Permintaan Rekrutmen"
      description="Konfirmasi persetujuan pengajuan dan tentukan langkah publikasi lowongan kerja"
    >
      <Stack gap={4}>
        {/* Info Summary Card */}
          <Stack gap={2}>
            <Row justify="between" align="center">
              <Badge tone="purple">{item.kode_permintaan}</Badge>
              <Badge tone="mint">AKAN DISETUJUI</Badge>
            </Row>
            <Grid cols={2}>
              <Stack gap={1}>
                <Text size="sm" muted>Posisi / Jabatan:</Text>
                <Text><strong>{item.jabatan?.nama_jabatan ?? `Posisi #${item.posisi_id}`}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Departemen:</Text>
                <Text><strong>{item.departement?.deskripsi ?? `Dept #${item.kd_departement}`}</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Jumlah Kebutuhan:</Text>
                <Text><strong>{item.jumlah} Orang</strong></Text>
              </Stack>
              <Stack gap={1}>
                <Text size="sm" muted>Diajukan Oleh:</Text>
                <Text>{item.requester?.name ?? '—'}</Text>
              </Stack>
            </Grid>
          </Stack>



        {/* Action Buttons inside Approval Modal */}
        <Row gap={2} justify="end" wrap={false} className="pt-2">
          <Button
            tone="mint"
            loading={loading}
            onClick={() => onApprove(item, false)}
          >
            ✓ Setujui Saja
          </Button>
          <Button
            tone="purple"
            loading={loading}
            onClick={() => onApprove(item, true)}
          >
            ✓ Setujui & Publikasikan Lowongan ↗
          </Button>
        </Row>
      </Stack>
    </Dialog>
  )
}
