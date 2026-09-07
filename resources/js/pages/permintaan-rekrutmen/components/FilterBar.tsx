import { Input } from '@/components/pouf/Input'
import { Select } from '@/components/pouf/controls'
import type { DepartementItem } from '../types'
import { PRIORITAS_OPTIONS, STATUS_OPTIONS, PAGE_SIZE_OPTIONS } from '../types'

interface FilterBarProps {
  search: string
  onSearchChange: (val: string) => void
  deptFilter: string
  onDeptFilterChange: (val: string) => void
  prioritasFilter: string
  onPrioritasFilterChange: (val: string) => void
  statusFilter: string
  onStatusFilterChange: (val: string) => void
  pageSize: string
  onPageSizeChange: (val: string) => void
  departements: DepartementItem[]
}

export function FilterBar({
  search,
  onSearchChange,
  deptFilter,
  onDeptFilterChange,
  prioritasFilter,
  onPrioritasFilterChange,
  statusFilter,
  onStatusFilterChange,
  pageSize,
  onPageSizeChange,
  departements,
}: FilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
      {/* Search Input */}
      <div className="flex-1 w-full lg:max-w-[340px]">
        <Input
          value={search}
          onChange={onSearchChange}
          placeholder="Cari kode, posisi, departemen, requester..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
        {/* Departement Filter */}
        <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[170px]">
          <Select
            value={deptFilter}
            onChange={onDeptFilterChange}
            options={[
              { value: 'all', label: 'Semua Dept' },
              ...departements.map((d) => ({
                value: String(d.id),
                label: d.deskripsi,
              })),
            ]}
          />
        </div>

        {/* Prioritas Filter */}
        <div className="flex-1 sm:flex-none min-w-[130px] sm:w-[150px]">
          <Select
            value={prioritasFilter}
            onChange={onPrioritasFilterChange}
            options={[
              { value: 'all', label: 'Semua Prioritas' },
              ...PRIORITAS_OPTIONS,
            ]}
          />
        </div>

        {/* Status Filter */}
        <div className="flex-1 sm:flex-none min-w-[140px] sm:w-[160px]">
          <Select
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: 'all', label: 'Semua Status' },
              ...STATUS_OPTIONS,
            ]}
          />
        </div>

        {/* Page Size */}
        <div className="w-[110px]">
          <Select
            value={pageSize}
            onChange={onPageSizeChange}
            options={PAGE_SIZE_OPTIONS}
          />
        </div>
      </div>
    </div>
  )
}
