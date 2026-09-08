import { useState, useMemo } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import { AppLayout } from '@/layouts/AppLayout'
import { Card } from '@/components/pouf/surface'
import { Stack, Row, Grid } from '@/components/pouf/layout'
import { Heading, Text, Eyebrow } from '@/components/pouf/text'
import { Button } from '@/components/pouf/Button'
import { Input } from '@/components/pouf/Input'
import { Badge, Blob, Dot } from '@/components/pouf/media'
import { Select, Dialog, Confirm } from '@/components/pouf/controls'
import { Separator } from '@/components/pouf/separator'
import { toast } from '@/components/pouf/toaster'
import {
  IconPlus,
  IconTrash,
  IconX,
  IconEdit,
  IconCheck,
  IconAlertTriangle,
  IconDeviceDesktop,
} from '@tabler/icons-react'

interface DetailItem {
  id?: number
  yang_dinilai: string
  urutan?: number
}

interface ParameterItem {
  id?: number
  kd_jabatan: string
  parameter: string
  bobot: number
  icon?: string
  urutan: number
  active: boolean
  yang_dinilai: DetailItem[]
}

interface PositionGroup {
  kd_jabatan: string
  nama_jabatan: string
  departement: string
  total_bobot: number
  total_parameters: number
  total_items_dinilai: number
  parameters: ParameterItem[]
}

interface JabatanOption {
  id: number
  kd_jabatan: string
  nama_jabatan: string
  departement: string
}

interface TahapConfig {
  tahap: string
  title: string
  subtitle: string
  route_prefix: string
  permission?: string
  allowed_jabatans?: string[] | null
}

interface Props {
  positions: PositionGroup[]
  jabatans: JabatanOption[]
  selectedKdJabatan?: string | null
  tahapConfig?: TahapConfig
}

interface FormParameterItem {
  id?: number
  parameter: string
  bobot: number | string
  urutan: number
  active: boolean
  yang_dinilai: string[]
}

export default function ParameterSkillTestIndex({
  positions = [],
  jabatans = [],
  selectedKdJabatan = null,
  tahapConfig,
}: Props) {
  const prefix = tahapConfig?.route_prefix || 'parameter-skill-test'
  const pageTitle = tahapConfig?.title || 'Parameter Penilaian Skill Test'
  const pageSubtitle = tahapConfig?.subtitle || 'Konfigurasi aspek teknis, bobot penilaian, dan kriteria uji kompetensi keahlian per jabatan.'

  // Filter state
  const [search, setSearch] = useState('')
  const [jabatanFilter, setJabatanFilter] = useState(selectedKdJabatan || 'all')

  // Unified Multi-Parameter Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(false)

  // Form for managing all parameters of a Jabatan
  const { data, setData, post, processing, errors, clearErrors } = useForm<{
    kd_jabatan: string
    parameters: FormParameterItem[]
  }>({
    kd_jabatan: jabatans[0]?.kd_jabatan ?? '',
    parameters: [
      {
        parameter: '',
        bobot: 30,
        urutan: 1,
        active: true,
        yang_dinilai: [''],
      },
    ],
  })

  // Filtered position groups
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        pos.nama_jabatan.toLowerCase().includes(q) ||
        pos.kd_jabatan.toLowerCase().includes(q) ||
        pos.departement.toLowerCase().includes(q) ||
        pos.parameters.some(
          (p) =>
            p.parameter.toLowerCase().includes(q) ||
            p.yang_dinilai.some((d) => d.yang_dinilai.toLowerCase().includes(q))
        )

      const matchJabatan =
        jabatanFilter === 'all' || pos.kd_jabatan === jabatanFilter

      return matchSearch && matchJabatan
    })
  }, [positions, search, jabatanFilter])

  // Overall KPI Stats
  const stats = useMemo(() => {
    const totalPosisiConfigured = positions.length
    const totalParameters = positions.reduce((sum, p) => sum + p.total_parameters, 0)
    const totalKriteria = positions.reduce((sum, p) => sum + p.total_items_dinilai, 0)
    const totalMasterJabatan = jabatans.length
    return { totalPosisiConfigured, totalParameters, totalKriteria, totalMasterJabatan }
  }, [positions, jabatans])

  // Calculate current sum of bobot in the modal form
  const totalFormBobot = useMemo(() => {
    return data.parameters.reduce((sum, p) => sum + (Number(p.bobot) || 0), 0)
  }, [data.parameters])

  // Open modal to configure/create for a new or specific Jabatan
  function openConfigureJabatan(kdJabatan?: string) {
    clearErrors()
    const targetKd =
      kdJabatan && kdJabatan !== 'all'
        ? kdJabatan
        : jabatans[0]?.kd_jabatan ?? ''

    // Check if this position already has parameters configured
    const existing = positions.find((p) => p.kd_jabatan === targetKd)

    if (existing && existing.parameters.length > 0) {
      setIsEditingExisting(true)
      setData({
        kd_jabatan: existing.kd_jabatan,
        parameters: existing.parameters.map((p, idx) => ({
          id: p.id,
          parameter: p.parameter,
          bobot: p.bobot,
          urutan: p.urutan || idx + 1,
          active: p.active,
          yang_dinilai:
            p.yang_dinilai.length > 0
              ? p.yang_dinilai.map((d) => d.yang_dinilai)
              : [''],
        })),
      })
    } else {
      setIsEditingExisting(false)
      setData({
        kd_jabatan: targetKd,
        parameters: [
          {
            parameter: '',
            bobot: 50,
            urutan: 1,
            active: true,
            yang_dinilai: [''],
          },
        ],
      })
    }
    setModalOpen(true)
  }

  // Parameter manipulation inside modal
  function handleAddParameter() {
    setData('parameters', [
      ...data.parameters,
      {
        parameter: '',
        bobot: 20,
        urutan: data.parameters.length + 1,
        active: true,
        yang_dinilai: [''],
      },
    ])
  }

  function handleRemoveParameter(paramIndex: number) {
    const updated = [...data.parameters]
    updated.splice(paramIndex, 1)
    if (updated.length === 0) {
      updated.push({
        parameter: '',
        bobot: 100,
        urutan: 1,
        active: true,
        yang_dinilai: [''],
      })
    }
    setData('parameters', updated)
  }

  function handleUpdateParameterField<K extends keyof FormParameterItem>(
    paramIndex: number,
    field: K,
    value: FormParameterItem[K]
  ) {
    const updated = [...data.parameters]
    updated[paramIndex] = {
      ...updated[paramIndex],
      [field]: value,
    }
    setData('parameters', updated)
  }

  // Yang Dinilai sub-item manipulation
  function handleAddYangDinilai(paramIndex: number) {
    const updated = [...data.parameters]
    updated[paramIndex].yang_dinilai.push('')
    setData('parameters', updated)
  }

  function handleRemoveYangDinilai(paramIndex: number, itemIndex: number) {
    const updated = [...data.parameters]
    updated[paramIndex].yang_dinilai.splice(itemIndex, 1)
    if (updated[paramIndex].yang_dinilai.length === 0) {
      updated[paramIndex].yang_dinilai.push('')
    }
    setData('parameters', updated)
  }

  function handleUpdateYangDinilai(paramIndex: number, itemIndex: number, value: string) {
    const updated = [...data.parameters]
    updated[paramIndex].yang_dinilai[itemIndex] = value
    setData('parameters', updated)
  }

  // Switch position in modal (loads existing if already configured)
  function handleSelectJabatanInModal(newKdJabatan: string) {
    const existing = positions.find((p) => p.kd_jabatan === newKdJabatan)
    if (existing && existing.parameters.length > 0) {
      setIsEditingExisting(true)
      setData({
        kd_jabatan: existing.kd_jabatan,
        parameters: existing.parameters.map((p, idx) => ({
          id: p.id,
          parameter: p.parameter,
          bobot: p.bobot,
          urutan: p.urutan || idx + 1,
          active: p.active,
          yang_dinilai:
            p.yang_dinilai.length > 0
              ? p.yang_dinilai.map((d) => d.yang_dinilai)
              : [''],
        })),
      })
    } else {
      setIsEditingExisting(false)
      setData('kd_jabatan', newKdJabatan)
    }
  }

  // Submit bulk save
  function handleSubmitJabatan(e: React.FormEvent) {
    e.preventDefault()

    // Validate parameters
    for (let i = 0; i < data.parameters.length; i++) {
      const p = data.parameters[i]
      if (!p.parameter.trim()) {
        toast.error(`Nama Parameter #${i + 1} wajib diisi.`)
        return
      }
      const validPoints = p.yang_dinilai.filter((y) => y.trim() !== '')
      if (validPoints.length === 0) {
        toast.error(`Parameter "${p.parameter}" wajib memiliki minimal 1 poin "Yang Dinilai".`)
        return
      }
    }

    post(`/${prefix}/save-jabatan`, {
      preserveScroll: true,
      onSuccess: () => {
        setModalOpen(false)
        toast.success(`Konfigurasi ${pageTitle} posisi jabatan berhasil disimpan!`)
      },
      onError: () => {
        toast.error('Gagal menyimpan konfigurasi. Periksa kembali form.')
      },
    })
  }

  // Delete all parameters for a position
  function handleDeleteJabatan(kdJabatan: string, namaJabatan: string) {
    router.delete(`/${prefix}/jabatan/${kdJabatan}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Semua parameter untuk ${namaJabatan} berhasil dihapus.`)
      },
    })
  }

  // Toggle single parameter active status
  function handleToggleParamStatus(paramId: number, paramName: string) {
    router.post(`/${prefix}/${paramId}/toggle-status`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Status "${paramName}" berhasil diubah.`)
      },
    })
  }

  return (
    <AppLayout>
      <Head title={`${pageTitle} - Rekrutmen & Talenta`} />

      <Stack gap={5}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <Stack gap={1} className="flex-1 min-w-0">
            <Eyebrow>Modul Rekrutmen & Talenta</Eyebrow>
            <Heading level={1}>{pageTitle}</Heading>
            <Text size="sm" muted>
              {pageSubtitle}
            </Text>
          </Stack>
          <Button
            onClick={() => openConfigureJabatan(jabatanFilter !== 'all' ? jabatanFilter : undefined)}
            className="w-full sm:w-auto shrink-0"
          >
            <IconPlus size={16} /> Konfigurasi Parameter Jabatan
          </Button>
        </div>

        {/* KPI Summary Cards */}
        <Grid cols={4} gap={4}>
          <Card>
            <Row gap={3} align="center">
              <Blob icon="database" tone="purple" size="sm" />
              <div>
                <Text size="sm" muted>Posisi Terkonfigurasi</Text>
                <Heading level={2}>{stats.totalPosisiConfigured}</Heading>
              </div>
            </Row>
          </Card>

          <Card>
            <Row gap={3} align="center">
              <Blob icon="target" tone="blue" size="sm" />
              <div>
                <Text size="sm" muted>Total Parameter</Text>
                <Heading level={2}>{stats.totalParameters}</Heading>
              </div>
            </Row>
          </Card>

          <Card>
            <Row gap={3} align="center">
              <Blob icon="overview" tone="mint" size="sm" />
              <div>
                <Text size="sm" muted>Total Poin Yang Dinilai</Text>
                <Heading level={2}>{stats.totalKriteria}</Heading>
              </div>
            </Row>
          </Card>

          <Card>
            <Row gap={3} align="center">
              <Blob icon="users" tone="yellow" size="sm" />
              <div>
                <Text size="sm" muted>Master Jabatan</Text>
                <Heading level={2}>{stats.totalMasterJabatan}</Heading>
              </div>
            </Row>
          </Card>
        </Grid>

        {/* Filter Bar */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1">
              {/* Search */}
              <div className="flex-1 min-w-[240px]">
                <Input
                  value={search}
                  onChange={(v) => setSearch(v)}
                  placeholder="Cari posisi jabatan, parameter, atau poin pengujian..."
                />
              </div>

              {/* Filter Jabatan */}
              <div className="w-full sm:w-72">
                <Select
                  value={jabatanFilter}
                  onChange={(v) => setJabatanFilter(v)}
                  options={[
                    { value: 'all', label: 'Semua Posisi Jabatan' },
                    ...jabatans.map((j) => ({
                      value: j.kd_jabatan,
                      label: `${j.nama_jabatan} (${j.kd_jabatan})`,
                    })),
                  ]}
                />
              </div>
            </div>

            {(search || jabatanFilter !== 'all') && (
              <Button
                size="sm"
                variant="quiet"
                onClick={() => {
                  setSearch('')
                  setJabatanFilter('all')
                }}
              >
                <IconX size={14} /> Reset Filter
              </Button>
            )}
          </div>
        </Card>

        {/* Position Groups List */}
        {filteredPositions.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <IconDeviceDesktop size={28} />
              </div>
              <Heading level={3}>Belum Ada Parameter Skill Test</Heading>
              <Text size="sm" muted className="max-w-md mx-auto mt-1 mb-4">
                {search || jabatanFilter !== 'all'
                  ? 'Tidak ada data parameter yang sesuai dengan filter pencarian.'
                  : 'Mulai atur kriteria parameter dan poin penilaian skill test untuk posisi lowongan / jabatan yang tersedia.'}
              </Text>
              {/* <Button onClick={() => openConfigureJabatan(jabatanFilter !== 'all' ? jabatanFilter : undefined)}>
                <IconPlus size={16} /> Atur Parameter Sekarang
              </Button> */}
            </div>
          </Card>
        ) : (
          <Stack gap={5}>
            {filteredPositions.map((pos) => {
              const isPerfectBobot = pos.total_bobot === 100

              return (
                <Card key={pos.kd_jabatan} className="overflow-hidden border border-slate-200">
                  <Stack gap={4}>
                    {/* Jabatan Card Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                      <Row gap={3} align="center" className="min-w-0">
                        <div className="min-w-0">
                          <Row gap={2} align="center" wrap>
                            <Heading level={3} className="text-slate-900">
                              {pos.nama_jabatan}
                            </Heading>
                            <Badge tone="idle">{pos.departement}</Badge>
                          </Row>
                          <Text size="sm" muted className="mt-0.5">
                            {pos.total_parameters} Parameter Penilaian &bull; {pos.total_items_dinilai} Poin Pengujian
                          </Text>
                        </div>
                      </Row>

                      {/* Header Actions & Bobot Badge */}
                      <Row gap={2} align="center" className="shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <Badge tone={isPerfectBobot ? 'mint' : 'yellow'}>
                          {isPerfectBobot ? (
                            <span className="flex items-center gap-1 font-bold">
                              <IconCheck size={14} /> Total Bobot: {pos.total_bobot}%
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-bold">
                              <IconAlertTriangle size={14} /> Total Bobot: {pos.total_bobot}%
                            </span>
                          )}
                        </Badge>

                        <Button
                          size="sm"
                          tone="blue"
                          onClick={() => openConfigureJabatan(pos.kd_jabatan)}
                        >
                          <IconEdit size={14} /> Kelola Parameter
                        </Button>

                        <Confirm
                          title={`Hapus Semua Parameter ${pos.nama_jabatan}?`}
                          body="Semua kriteria dan poin pengujian skill test untuk posisi ini akan dihapus permanen."
                          confirmLabel="Hapus Semua"
                          cancelLabel="Batal"
                          tone="orange"
                          onConfirm={() => handleDeleteJabatan(pos.kd_jabatan, pos.nama_jabatan)}
                        >
                          <Button size="sm" tone="pink">
                            <IconTrash size={14} />
                          </Button>
                        </Confirm>
                      </Row>
                    </div>

                    {/* Skill Test Table (Exact Table Styling as User Reference Image) */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#1e40af] text-white text-xs uppercase tracking-wider font-semibold">
                            <th className="py-3 px-4 w-[30%]">Parameter</th>
                            <th className="py-3 px-4 w-[16%] text-center">Bobot</th>
                            <th className="py-3 px-4 w-[40%]">Yang Dinilai</th>
                            <th className="py-3 px-4 w-[14%] text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {pos.parameters.map((param, pIdx) => (
                            <tr
                              key={param.id || pIdx}
                              className={pIdx % 2 === 0 ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-50'}
                            >
                              {/* Parameter Title */}
                              <td className="py-4 px-4 align-top">
                                <div>
                                  <div className="font-bold text-slate-900 text-base">
                                    {param.parameter}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    Parameter #{pIdx + 1}
                                  </div>
                                </div>
                              </td>

                              {/* Bobot % (Prominent Bold Navy) */}
                              <td className="py-4 px-4 align-top text-center">
                                <span className="inline-block font-extrabold text-xl text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-lg">
                                  {param.bobot}%
                                </span>
                              </td>

                              {/* Yang Dinilai (Bulleted Criteria List) */}
                              <td className="py-4 px-4 align-top">
                                <ul className="space-y-1.5">
                                  {param.yang_dinilai.map((detail, dIdx) => (
                                    <li key={dIdx} className="flex items-start gap-2 text-slate-700 text-xs sm:text-sm">
                                      <span className="text-blue-600 font-bold leading-tight select-none">&bull;</span>
                                      <span>{detail.yang_dinilai}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>

                              {/* Status Toggle */}
                              <td className="py-4 px-4 align-top text-right">
                                <Row gap={2} justify="end" align="center">
                                  {param.id && (
                                    <Button
                                      size="sm"
                                      tone="blue"
                                      onClick={() => handleToggleParamStatus(param.id!, param.parameter)}
                                    >
                                      <Dot tone={param.active ? 'mint' : 'yellow'} />
                                      <span className="text-xs font-bold">
                                        {param.active ? 'Aktif' : 'Nonaktif'}
                                      </span>
                                    </Button>
                                  )}
                                </Row>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer Total Summary */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700">
                      <span>Total Bobot Keseluruhan:</span>
                      <span className={`text-sm font-extrabold ${isPerfectBobot ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {pos.total_bobot}% {isPerfectBobot ? '(Sempurna)' : '(Belum 100%)'}
                      </span>
                    </div>
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        )}
      </Stack>

      {/* Unified Multi-Parameter Jabatan Configuration Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="xl"
        title={isEditingExisting ? 'Kelola Parameter Skill Test Jabatan' : 'Konfigurasi Parameter Skill Test Baru'}
      >
        <form onSubmit={handleSubmitJabatan}>
          <Stack gap={5}>
            {/* Position Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Posisi Lowongan / Jabatan <span className="text-red-500">*</span>
              </label>
              <Select
                value={data.kd_jabatan}
                onChange={handleSelectJabatanInModal}
                options={jabatans.map((j) => ({
                  value: j.kd_jabatan,
                  label: `${j.nama_jabatan} (${j.kd_jabatan}) - ${j.departement}`,
                }))}
              />
              <Text size="sm" muted className="mt-1">
                Pilih jabatan yang ingin dikonfigurasi kriteria pengujian skill test-nya.
              </Text>
            </div>

            <Separator />

            {/* Parameter List Section - Table Format */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Heading level={3}>Daftar Parameter Penilaian</Heading>
                </div>
                <Button
                  type="button"
                  size="sm"
                  tone="purple"
                  onClick={handleAddParameter}
                >
                  <IconPlus size={14} /> Tambah Parameter
                </Button>
              </div>

              {/* Dynamic Parameter Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto max-h-[52vh] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#1e40af] text-white">
                      <tr className="text-xs uppercase tracking-wider font-semibold">
                        <th className="py-3.5 px-4 w-[28%]">Parameter</th>
                        <th className="py-3.5 px-4 w-[16%] text-center">Bobot (%)</th>
                        <th className="py-3.5 px-4 w-[48%]">Yang Dinilai (Poin Pengujian)</th>
                        <th className="py-3.5 px-4 w-[8%] text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 text-sm bg-white">
                      {data.parameters.map((param, pIdx) => (
                        <tr key={pIdx} className="hover:bg-slate-50/50 align-middle">
                          {/* Parameter Title */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1.5">
                              <Input
                                value={param.parameter}
                                onChange={(val) => handleUpdateParameterField(pIdx, 'parameter', val)}
                                placeholder="Contoh: Problem Solving"
                                required
                              />
                              <div className="text-[11px] text-slate-400 font-medium pl-1">
                                Parameter #{pIdx + 1}
                              </div>
                            </div>
                          </td>

                          {/* Bobot (%) */}
                          <td className="py-4 px-4 align-top">
                            <div className="w-24 mx-auto">
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                value={String(param.bobot)}
                                onChange={(val) => handleUpdateParameterField(pIdx, 'bobot', Number(val))}
                                placeholder="25"
                                required
                              />
                            </div>
                          </td>

                          {/* Yang Dinilai Sub-Items List */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-2.5">
                              {param.yang_dinilai.map((item, dIdx) => (
                                <div key={dIdx} className="flex items-center gap-2.5">
                                  <span className="text-purple-600 font-bold text-lg select-none shrink-0 leading-none">
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <Input
                                      value={item}
                                      onChange={(val) => handleUpdateYangDinilai(pIdx, dIdx, val)}
                                      placeholder="Contoh: Logika Berpikir"
                                      required
                                    />
                                  </div>
                                  {param.yang_dinilai.length > 1 && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      tone="pink"
                                      onClick={() => handleRemoveYangDinilai(pIdx, dIdx)}
                                    >
                                      <IconTrash size={15} />
                                    </Button>
                                  )}
                                </div>
                              ))}

                              <div className="pt-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  tone="mint"
                                  onClick={() => handleAddYangDinilai(pIdx)}
                                >
                                  <IconPlus size={14} /> Tambah Poin
                                </Button>
                              </div>
                            </div>
                          </td>

                          {/* Action - Delete Row */}
                          <td className="py-4 px-4 align-top text-center">
                            <div className="flex justify-center">
                              {data.parameters.length > 1 ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  tone="pink"
                                  onClick={() => handleRemoveParameter(pIdx)}
                                >
                                  <Text className='text-black'>Hapus Parameter</Text>
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-300 select-none">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Real-time Total Bobot Banner */}
            <div
              className={`p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm font-semibold border ${
                totalFormBobot === 100
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {totalFormBobot === 100 ? (
                  <IconCheck size={18} className="text-emerald-600 shrink-0" />
                ) : (
                  <IconAlertTriangle size={18} className="text-amber-600 shrink-0" />
                )}
                <span>
                  {totalFormBobot === 100
                    ? 'Total bobot pas 100% (Sempurna & Siap Disimpan)'
                    : `Total bobot saat ini ${totalFormBobot}% (Disarankan total 100%)`}
                </span>
              </div>
              <span className="font-extrabold text-base">{totalFormBobot}%</span>
            </div>

            {/* Modal Actions */}
            <Row justify="end" gap={2} className="pt-3 border-t border-slate-100">
              <Button type="button" tone='pink' onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" loading={processing}>
                Simpan Konfigurasi Jabatan
              </Button>
            </Row>
          </Stack>
        </form>
      </Dialog>
    </AppLayout>
  )
}
