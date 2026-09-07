import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'
import { cx } from 'class-variance-authority'
import { Text } from './text'

// Re-export specific TanStack primitives if needed
export type { ColumnDef, SortingState }
export { useReactTable, flexRender, getCoreRowModel, getSortedRowModel }

/* ------------------------------------------------------------------ */
/* Pouf DataTable Powered by TanStack Table                           */
/* ------------------------------------------------------------------ */

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  mono?: boolean
  truncate?: boolean
  width?: string | number
  minWidth?: string | number
  /** Supply a boolean or comparator function to enable TanStack sorting */
  sort?: boolean | ((a: T, b: T) => number)
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  getKey?: (row: T) => string
  minWidth?: string | number
  onRowClick?: (row: T) => void
  getRowLabel?: (row: T) => string
  className?: string
}

export function Table<T>({
  columns,
  rows,
  getKey,
  minWidth,
  onRowClick,
  getRowLabel,
  className,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Adapt TableColumn<T>[] to TanStack ColumnDef<T, any>[]
  const tanstackColumns = useMemo<ColumnDef<T, any>[]>(() => {
    return columns.map((col) => {
      const isRight = col.align === 'right'
      const isCenter = col.align === 'center'

      return {
        id: col.key,
        accessorFn: (row: T) => {
          if (typeof col.sort === 'function') {
            return row
          }
          return (row as any)?.[col.key] ?? ''
        },
        header: () => (
          <span className={cx(isRight && 'text-right', isCenter && 'text-center', 'whitespace-nowrap font-extrabold text-[13px]')}>
            {col.header}
          </span>
        ),
        cell: ({ row }) => {
          const content = col.render(row.original)
          return (
            <div
              className={cx(
                isRight && 'flex justify-end text-right',
                isCenter && 'flex justify-center text-center',
                col.mono && 'font-mono [font-variant-numeric:tabular-nums]',
                col.truncate && 'truncate',
                'min-w-0',
              )}
              style={
                col.width
                  ? { width: col.width }
                  : col.minWidth
                    ? { minWidth: col.minWidth }
                    : undefined
              }
            >
              {content}
            </div>
          )
        },
        enableSorting: !!col.sort,
        sortingFn:
          typeof col.sort === 'function'
            ? (rowA, rowB) => (col.sort as (a: T, b: T) => number)(rowA.original, rowB.original)
            : 'auto',
      }
    })
  }, [columns])

  const table = useReactTable({
    data: rows ?? [],
    columns: tanstackColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: getKey ? (row) => getKey(row) : undefined,
  })

  // Dynamic minimum width based on column count if not specified
  const effectiveMinWidth =
    minWidth ?? (columns.length >= 7 ? '1000px' : columns.length >= 5 ? '850px' : '650px')

  return (
    <div className={cx('pouf-table__wrap overflow-x-auto w-full [webkit-overflow-scrolling:touch]', className)}>
      <table
        className="pouf-table w-full border-collapse"
        style={{ minWidth: effectiveMinWidth }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const isSorted = header.column.getIsSorted()
                const colDef = columns.find((c) => c.key === header.id)
                const isRight = colDef?.align === 'right'

                return (
                  <th
                    key={header.id}
                    className={cx(
                      'whitespace-nowrap px-4 py-3 font-extrabold text-muted text-[13px] border-b-2 border-[rgba(201,168,255,0.3)]',
                      isRight ? 'pouf-table__h--right text-right' : 'text-left',
                    )}
                    aria-sort={
                      isSorted
                        ? isSorted === 'desc'
                          ? 'descending'
                          : 'ascending'
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className={cx(
                          'pouf-table__sort inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit whitespace-nowrap',
                          isRight && 'flex-row-reverse',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Text size="sm" muted>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                        <span
                          aria-hidden="true"
                          className={cx(
                            'pouf-table__caret text-xs',
                            isSorted ? 'opacity-100 text-ink font-black' : 'opacity-45 text-muted',
                          )}
                        >
                          {isSorted ? (isSorted === 'desc' ? '▾' : '▴') : '⇅'}
                        </span>
                      </button>
                    ) : (
                      <Text size="sm" muted>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Text>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="pouf-table__empty text-center py-8 text-muted"
              >
                <Text size="sm" muted>
                  Tidak ada data yang ditemukan.
                </Text>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cx(
                  'pouf-table__row transition-colors hover:bg-[rgba(201,168,255,0.08)]',
                  onRowClick && 'pouf-table__row--click cursor-pointer',
                )}
                onClick={
                  onRowClick
                    ? (event) => {
                        const target = event.target as Element
                        const interactive = target.closest('a, button, input, select, textarea')
                        if (interactive && !interactive.classList.contains('pouf-table__rowaction')) return
                        onRowClick(row.original)
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell, index) => {
                  const colDef = columns.find((c) => c.key === cell.column.id)
                  const isRight = colDef?.align === 'right'

                  return (
                    <td
                      key={cell.id}
                      className={cx(
                        'px-4 py-3.5 border-b border-[rgba(201,168,255,0.15)] text-[14px] align-middle',
                        isRight && 'pouf-table__cell--right text-right',
                      )}
                    >
                      {index === 0 && onRowClick && getRowLabel ? (
                        <button
                          type="button"
                          className="pouf-table__rowaction"
                          aria-label={getRowLabel(row.original)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </button>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export { Table as DataTable }
