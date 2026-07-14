import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { FiChevronUp, FiChevronDown, FiChevronsLeft, FiChevronsRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '../../utils/helpers';

// Generic, sortable, paginated admin data table. `columns` accept a custom
// `cell` render and a `sortable` flag. Built on @tanstack/react-table for
// server-side-friendly patterns (dense rows, sticky header, bulk actions).
export default function DataTable({ columns, data, pageSize = 8, toolbar, onRowClick, initialSort = [] }) {
  const [sorting, setSorting] = useState(initialSort);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="rounded-2xl border border-admin-200 dark:border-admin-800 bg-white dark:bg-admin-900 shadow-sm overflow-hidden">
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-admin-200 dark:border-admin-800">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-admin-50 dark:bg-admin-800/40">
                {hg.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                      className={cn(
                        'px-4 py-2.5 text-left text-xs font-semibold text-admin-500 dark:text-admin-300 uppercase tracking-wide whitespace-nowrap',
                        sortable && 'cursor-pointer select-none hover:text-admin-700 dark:hover:text-white'
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && (
                          sorted === 'asc' ? <FiChevronUp className="w-3.5 h-3.5" />
                            : sorted === 'desc' ? <FiChevronDown className="w-3.5 h-3.5" />
                            : <span className="w-3.5 h-3.5 opacity-30">↕</span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'border-t border-admin-100 dark:border-admin-800/60 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-admin-50 dark:hover:bg-admin-800/30'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-admin-700 dark:text-admin-200 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-admin-400 dark:text-admin-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-admin-200 dark:border-admin-800 text-xs text-admin-500 dark:text-admin-400">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          {' · '}{table.getFilteredRowModel().rows.length} rows
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-admin-100 dark:hover:bg-admin-800 disabled:opacity-40" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><FiChevronsLeft /></button>
          <button className="p-1.5 rounded-lg hover:bg-admin-100 dark:hover:bg-admin-800 disabled:opacity-40" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><FiChevronLeft /></button>
          <button className="p-1.5 rounded-lg hover:bg-admin-100 dark:hover:bg-admin-800 disabled:opacity-40" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><FiChevronRight /></button>
          <button className="p-1.5 rounded-lg hover:bg-admin-100 dark:hover:bg-admin-800 disabled:opacity-40" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><FiChevronsRight /></button>
        </div>
      </div>
    </div>
  );
}
