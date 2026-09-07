import { Grid } from '@/components/pouf/layout'
import { Stat } from '@/components/pouf/readout'

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    disetujui: number
    totalKebutuhan: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <Grid cols={4}>
      <Stat
        label="Total Pengajuan"
        value={String(stats.total)}
        icon="database"
        tone="purple"
      />
      <Stat
        label="Menunggu Persetujuan"
        value={String(stats.pending)}
        icon="clock"
        tone="yellow"
      />
      <Stat
        label="Telah Disetujui"
        value={String(stats.disetujui)}
        icon="ok"
        tone="mint"
      />
      <Stat
        label="Total Kebutuhan Orang"
        value={`${stats.totalKebutuhan} Orang`}
        icon="user"
        tone="blue"
      />
    </Grid>
  )
}
