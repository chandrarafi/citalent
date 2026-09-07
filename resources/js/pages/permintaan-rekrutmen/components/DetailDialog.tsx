import { Dialog, Confirm } from '@/components/pouf/controls'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Input } from '@/components/pouf/Input'
import { Badge, Blob } from '@/components/pouf/media'
import type { PermintaanItem } from '../types'
import { PRIORITAS_TONE, STATUS_TONE } from '../types'

interface DetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: PermintaanItem | null
  isHrOrAdmin: boolean
  loading: boolean
  copiedLink: boolean
  onCopyLink: (url: string) => void
  onReject: (item: PermintaanItem) => void
  onApproveClick: () => void
  onOpenPublish: (item: PermintaanItem) => void
}

export function DetailDialog({
  open,
  onOpenChange,
  item,
  isHrOrAdmin,
  loading,
  copiedLink,
  onCopyLink,
  onReject,
  onApproveClick,
  onOpenPublish,
}: DetailDialogProps) {
  if (!item) return null

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title=""
      description="Detail informasi kebutuhan tenaga kerja dan status persetujuan"
    >
      <Stack gap={5}>
        {/* Top Badge & Status Summary */}
        <Row justify="between" align="center">
          <Row gap={2} align="center">
            <Badge tone="purple">{item.kode_permintaan}</Badge>
            <Badge tone={PRIORITAS_TONE[item.prioritas] || 'yellow'}>
              PRIORITAS {item.prioritas.toUpperCase()}
            </Badge>
          </Row>
          <Badge tone={STATUS_TONE[item.status_persetujuan] || 'yellow'}>
            STATUS: {item.status_persetujuan.toUpperCase()}
          </Badge>
        </Row>

        {/* Info Grid */}
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
            <Text size="sm" muted>Diajukan Oleh (Requester):</Text>
            <Text><strong>{item.requester?.name ?? '—'}</strong> ({item.requester?.email ?? ''})</Text>
          </Stack>
          <Stack gap={1}>
            <Text size="sm" muted>Tanggal Permintaan:</Text>
            <Text mono>{item.tgl_permintaan}</Text>
          </Stack>
          <Stack gap={1}>
            <Text size="sm" muted>Target Masuk (Join):</Text>
            <Text mono><strong>{item.target_join}</strong></Text>
          </Stack>
        </Grid>

        {/* Published Vacancy Link Section if Lowongan exists */}
        {item.lowongan ? (
            <Stack gap={3}>
              <div className="bg-[var(--color-surface)] p-3 rounded-[12px] ">
                <Stack gap={2}>
                  <Text size="sm" muted>URL Pendaftaran Kandidat (Dapat Dibagikan ke Publik):</Text>
                  <Row gap={2} align="center">
                    <Input
                      value={item.lowongan.share_url}
                      onChange={() => {}}
                      readOnly
                      mono
                    />
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => onCopyLink(item.lowongan!.share_url)}
                    >
                      {copiedLink ? '✓ Tersalin!' : 'Salin URL'}
                    </Button>
                    <Button
                      size="sm"
                      tone="purple"
                      onClick={() => window.open(item.lowongan!.share_url, '_blank')}
                    >
                      Buka Form ↗
                    </Button>
                  </Row>
                </Stack>
              </div>
            </Stack>
        ) : item.status_persetujuan === 'disetujui' && isHrOrAdmin ? (
          <Card variant="tight">
            <Row justify="between" align="center">
              <Stack gap={1}>
                <Heading level={2}>Permintaan Disetujui</Heading>
                <Text size="sm" muted>
                  Permintaan telah disetujui. Publikasikan lowongan agar kandidat dapat mendaftar.
                </Text>
              </Stack>
              <Button tone="purple" onClick={() => onOpenPublish(item)}>
                Publikasikan Lowongan ↗
              </Button>
            </Row>
          </Card>
        ) : null}

        {/* Approval / Rejection Actions for HR & Super Admin (2 buttons: Tolak & Setujui) */}
        {isHrOrAdmin && item.status_persetujuan === 'pending' && (
          <div className="pt-3">
            <Row justify="between" align="center">
              {/* Reject Confirm */}
              <Confirm
                title={`Tolak Permintaan "${item.kode_permintaan}"?`}
                body="Status permintaan akan diubah menjadi Ditolak."
                confirmLabel="Tolak Permintaan"
                cancelLabel="Batalkan"
                tone="orange"
                onConfirm={() => onReject(item)}
              >
                <Button tone="pink" loading={loading}>
                  ✕ Tolak Permintaan
                </Button>
              </Confirm>

              {/* Approve Button (Opens Dedicated Modal) */}
              <Button
                tone="mint"
                loading={loading}
                onClick={onApproveClick}
              >
                ✓ Setujui Permintaan
              </Button>
            </Row>
          </div>
        )}
      </Stack>
    </Dialog>
  )
}
