import type { Tone } from '@/components/pouf/tone'

export interface DepartementItem {
  id: number
  kd_departement: string
  deskripsi: string
  active?: boolean | string
}

export interface JabatanItem {
  id: number
  kd_departement: string
  kd_jabatan: string
  nama_jabatan: string
  active?: boolean | string
}

export interface LowonganItem {
  id: number
  kode_lowongan: string
  slug: string
  judul: string
  lokasi_kerja: string
  tipe_pekerjaan: string
  deskripsi?: string | null
  kualifikasi?: string | null
  tgl_buka?: string | null
  tgl_tutup?: string | null
  status: string
  share_url: string
}

export interface PermintaanItem {
  id: number
  kode_permintaan: string
  kd_departement: number
  departement?: {
    id: number
    kd_departement: string
    deskripsi: string
  } | null
  posisi_id: number
  jabatan?: {
    id: number
    kd_departement: string
    kd_jabatan: string
    nama_jabatan: string
  } | null
  requester_id?: number | null
  requester?: {
    id: number
    name: string
    email: string
  } | null
  jumlah: number
  tgl_permintaan: string
  target_join: string
  prioritas: 'high' | 'medium' | 'low'
  status_persetujuan: 'pending' | 'disetujui' | 'ditolak' | 'cancel'
  lowongan?: LowonganItem | null
  created_at?: string
}

export interface PermintaanFormState {
  kode_permintaan: string
  kd_departement: string
  posisi_id: string
  jumlah: string
  tgl_permintaan: string
  target_join: string
  prioritas: 'high' | 'medium' | 'low'
  status_persetujuan: 'pending' | 'disetujui' | 'ditolak' | 'cancel'
  [key: string]: any
}

export interface PublishFormState {
  judul: string
  lokasi_kerja: string
  tipe_pekerjaan: string
  deskripsi: string
  kualifikasi: string
  tgl_buka: string
  tgl_tutup: string
  [key: string]: any
}

export const PRIORITAS_OPTIONS = [
  { value: 'high', label: 'High (Tinggi)' },
  { value: 'medium', label: 'Medium (Sedang)' },
  { value: 'low', label: 'Low (Rendah)' },
]

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending (Menunggu)' },
  { value: 'disetujui', label: 'Disetujui' },
  { value: 'ditolak', label: 'Ditolak' },
  { value: 'cancel', label: 'Dibatalkan (Cancel)' },
]

export const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per hal' },
  { value: '10', label: '10 per hal' },
  { value: '25', label: '25 per hal' },
]

export const PRIORITAS_TONE: Record<string, Tone> = {
  high: 'pink',
  medium: 'yellow',
  low: 'blue',
}

export const STATUS_TONE: Record<string, Tone> = {
  pending: 'yellow',
  disetujui: 'mint',
  ditolak: 'pink',
  cancel: 'orange',
}

export const TIPE_PEKERJAAN_OPTIONS = [
  { value: 'Full-time', label: 'Full-time (Penuh Waktu)' },
  { value: 'Contract', label: 'Kontrak (PKWT)' },
  { value: 'Internship', label: 'Magang (Internship)' },
  { value: 'Part-time', label: 'Part-time' },
]

export function generateKodePermintaan(items: PermintaanItem[] = []): string {
  const yearStr = new Date().getFullYear().toString()
  const prefix = `MPR-${yearStr}-`

  const yearSeqs = items
    .map((item) => item.kode_permintaan)
    .filter((code) => Boolean(code && code.startsWith(prefix)))
    .map((code) => {
      const parts = code.split('-')
      const seqStr = parts[parts.length - 1]
      return parseInt(seqStr, 10) || 0
    })

  const nextSeq = (yearSeqs.length ? Math.max(...yearSeqs) : 0) + 1
  const sequence = String(nextSeq).padStart(3, '0')
  return `${prefix}${sequence}`
}

export const getTodayDate = () => new Date().toISOString().slice(0, 10)

export const emptyForm = (items: PermintaanItem[] = []): PermintaanFormState => ({
  kode_permintaan: generateKodePermintaan(items),
  kd_departement: '',
  posisi_id: '',
  jumlah: '1',
  tgl_permintaan: getTodayDate(),
  target_join: '',
  prioritas: 'medium',
  status_persetujuan: 'pending',
})

export const emptyPublishForm = (): PublishFormState => ({
  judul: '',
  lokasi_kerja: 'Kantor Pusat (On-site)',
  tipe_pekerjaan: 'Full-time',
  deskripsi: '',
  kualifikasi: '',
  tgl_buka: getTodayDate(),
  tgl_tutup: '',
})
