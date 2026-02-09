import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import type { Charge } from "@/types/charge"
import type { FilterState, SortColumn, SortDirection } from "@/types/table"
import { formatCurrency } from "@/lib/utils"
import {
  filterCharges,
  sortCharges,
  paginateCharges,
  getStatus,
  getOutstanding,
} from "@/lib/table-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChargeForm } from "@/components/ChargeForm"
import {
  Pencil,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ChargeTableProps = {
  charges: Charge[]
  filter: FilterState
  onUpdate: (charge_id: string, updates: Partial<Charge>) => void
  onDelete: (charge_id: string) => void
  onEditSuccess?: () => void
  onDeleteSuccess?: () => void
  pageSize: number
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: SortColumn
  sortColumn: SortColumn
  sortDirection: SortDirection
}) {
  if (sortColumn !== column) {
    return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 opacity-60" />
  }
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-[#1b3c68]" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-[#1b3c68]" />
  )
}

function SortableHeader({
  column,
  label,
  align = "left",
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: SortColumn
  label: string
  align?: "left" | "right"
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/80 transition-colors",
        align === "right" ? "text-right" : "text-left"
      )}
      onClick={() => onSort(column)}
    >
      <div className={cn("flex items-center gap-1", align === "right" && "justify-end")}>
        {label}
        <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
      </div>
    </th>
  )
}

function hasActiveFilters(filter: FilterState): boolean {
  return !!(
    filter.search.trim() ||
    filter.status ||
    filter.studentId ||
    filter.dateFrom ||
    filter.dateTo ||
    filter.amountMin ||
    filter.amountMax
  )
}

export function ChargeTable({
  charges,
  filter,
  onUpdate,
  onDelete,
  onEditSuccess,
  onDeleteSuccess,
  pageSize,
}: ChargeTableProps) {
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null)
  const [deletingCharge, setDeletingCharge] = useState<Charge | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [sort, setSort] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: "date_charged",
    direction: "desc",
  })

  const filteredCharges = useMemo(
    () => filterCharges(charges, filter),
    [charges, filter]
  )

  const sortedCharges = useMemo(
    () => sortCharges(filteredCharges, sort),
    [filteredCharges, sort]
  )

  const totalPages = Math.ceil(sortedCharges.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedCharges = paginateCharges(sortedCharges, currentPage, pageSize)

  const prevFilterPageSize = useRef({ filter, pageSize })
  useEffect(() => {
    const filterPageSizeChanged =
      prevFilterPageSize.current.filter !== filter ||
      prevFilterPageSize.current.pageSize !== pageSize
    prevFilterPageSize.current = { filter, pageSize }

    setCurrentPage((prev) => {
      if (filterPageSizeChanged) return 1
      if (prev > totalPages && totalPages > 0) return totalPages
      return prev
    })
  }, [filter, pageSize, totalPages])

  useEffect(() => {
    if (!openMenuId) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [openMenuId])

  const handleSort = (column: SortColumn) => {
    setSort((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }))
    setCurrentPage(1)
  }

  const handleEditSubmit = (values: Omit<Charge, "charge_id">) => {
    if (editingCharge) {
      onUpdate(editingCharge.charge_id, values)
      setEditingCharge(null)
      onEditSuccess?.()
    }
  }

  const handleDeleteConfirm = useCallback(() => {
    if (deletingCharge) {
      const id = deletingCharge.charge_id
      onDelete(id)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setDeletingCharge(null)
      onDeleteSuccess?.()
    }
  }, [deletingCharge, onDelete, onDeleteSuccess])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const pageIds = paginatedCharges.map((c) => c.charge_id)
    const allSelected = pageIds.every((id) => selectedIds.has(id))
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.add(id))
        return next
      })
    }
  }

  return (
    <>
      <div className="mx-3 sm:mx-6 my-4 border border-gray-200 overflow-hidden bg-white shadow-sm rounded-xl md:rounded-lg">
        {/* Desktop/Tablet: Table layout */}
        <div className="hidden md:block overflow-x-auto rounded-lg">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={
                      paginatedCharges.length > 0 &&
                      paginatedCharges.every((c) => selectedIds.has(c.charge_id))
                    }
                    onChange={toggleSelectAll}
                    className="border-gray-300 text-[#1b3c68] focus:ring-[#1b3c68]"
                  />
                </th>
                <SortableHeader column="charge_id" label="Charge ID" sortColumn={sort.column} sortDirection={sort.direction} onSort={handleSort} />
                <SortableHeader column="student_id" label="Student ID" sortColumn={sort.column} sortDirection={sort.direction} onSort={handleSort} />
                <SortableHeader column="charge_amount" label="Charge Amount" align="right" sortColumn={sort.column} sortDirection={sort.direction} onSort={handleSort} />
                <SortableHeader column="paid_amount" label="Paid Amount" align="right" sortColumn={sort.column} sortDirection={sort.direction} onSort={handleSort} />
                <SortableHeader column="date_charged" label="Date Charged" sortColumn={sort.column} sortDirection={sort.direction} onSort={handleSort} />
                <SortableHeader column="pending_amount" label="Amount Due" align="right" sortColumn={sort.column} sortDirection={sort.direction} onSort={handleSort} />
                <SortableHeader column="status" label="Status" sortColumn={sort.column} sortDirection={sort.direction} onSort={handleSort} />
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedCharges.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    {hasActiveFilters(filter)
                      ? "No charges match your filters."
                      : "No charges yet."}
                  </td>
                </tr>
              ) : (
                paginatedCharges.map((charge) => {
                const status = getStatus(charge)
                return (
                  <tr
                    key={charge.charge_id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(charge.charge_id)}
                        onChange={() => toggleSelect(charge.charge_id)}
                        className="border-gray-300 text-[#1b3c68] focus:ring-[#1b3c68]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      #{charge.charge_id.replace("chg_", "")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1b3c68]/10 flex items-center justify-center text-[#1b3c68] text-xs font-medium rounded-full">
                          {charge.student_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {charge.student_id}
                          </span>
                          <span className="text-xs text-gray-500">
                            {charge.student_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(charge.charge_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(charge.paid_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(charge.date_charged)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(getOutstanding(charge))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium",
                          status === "paid" && "bg-green-50 text-green-700",
                          status === "partial" && "bg-amber-50 text-amber-700",
                          status === "unpaid" && "bg-red-50 text-red-700"
                        )}
                      >
                        {status === "paid" && <Check className="h-3 w-3" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditingCharge(charge)}
                          className="p-2 hover:bg-gray-100 text-gray-500"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCharge(charge)}
                          className="p-2 hover:bg-gray-100 text-gray-500"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: Card layout */}
        <div className="md:hidden">
          {sortedCharges.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-500">
              {hasActiveFilters(filter)
                ? "No charges match your filters."
                : "No charges yet."}
            </div>
          ) : (
            <>
              {paginatedCharges.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                  <input
                    type="checkbox"
                    checked={
                      paginatedCharges.length > 0 &&
                      paginatedCharges.every((c) => selectedIds.has(c.charge_id))
                    }
                    onChange={toggleSelectAll}
                    className="size-4 shrink-0 border-gray-300 text-[#1b3c68] focus:ring-[#1b3c68] rounded"
                    aria-label="Select all"
                  />
                  <span className="text-sm font-medium text-gray-600">Select all</span>
                </div>
              )}
              <div className="divide-y divide-gray-200">
            {paginatedCharges.map((charge) => {
              const status = getStatus(charge)
              const isMenuOpen = openMenuId === charge.charge_id
              return (
                <div
                  key={charge.charge_id}
                  className="px-4 py-5 active:bg-gray-50/70 transition-colors"
                >
                  <div className="flex gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(charge.charge_id)}
                      onChange={() => toggleSelect(charge.charge_id)}
                      className="mt-3.5 size-4 shrink-0 border-gray-300 text-[#1b3c68] focus:ring-[#1b3c68] rounded"
                      aria-label={`Select ${charge.charge_id}`}
                    />
                    <div className="min-w-0 flex-1">
                      {/* Header: ID + Status */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base font-semibold text-gray-900">
                          #{charge.charge_id.replace("chg_", "")}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full",
                            status === "paid" && "bg-green-100 text-green-700",
                            status === "partial" && "bg-amber-100 text-amber-700",
                            status === "unpaid" && "bg-red-100 text-red-700"
                          )}
                        >
                          {status === "paid" && <Check className="h-3 w-3" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      {/* Student ID */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1b3c68]/10 flex items-center justify-center text-[#1b3c68] text-sm font-semibold rounded-full shrink-0">
                          {charge.student_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {charge.student_id}
                          </p>
                          <p className="text-xs text-gray-500">{charge.student_name}</p>
                        </div>
                      </div>
                      {/* Amounts: Charge, Paid, Outstanding + Date */}
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-500">Charge Amount</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(charge.charge_amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-500">Paid Amount</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(charge.paid_amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-500">Date Charged</span>
                          <span className="text-gray-900">
                            {formatDate(charge.date_charged)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-500">Amount Due</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(getOutstanding(charge))}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Actions: dropdown */}
                    <div
                      className="relative shrink-0"
                      ref={isMenuOpen ? menuRef : undefined}
                    >
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : charge.charge_id)}
                        className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                        aria-label="Actions"
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 z-20 w-40 py-1.5 bg-white rounded-xl shadow-lg border border-gray-200">
                          <button
                            onClick={() => {
                              setEditingCharge(charge)
                              setOpenMenuId(null)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4 text-gray-400" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeletingCharge(charge)
                              setOpenMenuId(null)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
              </div>
            </>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
            {sortedCharges.length === 0
              ? "0 results"
              : `${startIndex + 1}-${Math.min(startIndex + pageSize, sortedCharges.length)} of ${sortedCharges.length}`}
          </span>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true
                  if (p === 1 || p === totalPages) return true
                  if (Math.abs(p - currentPage) <= 1) return true
                  return false
                })
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-gray-400 px-1">…</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "min-w-[32px] h-8 px-2 rounded-md text-sm font-medium",
                        currentPage === p
                          ? "bg-[#1b3c68] text-white"
                          : "hover:bg-gray-200 text-gray-600"
                      )}
                    >
                      {p}
                    </button>
                  </span>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={!!editingCharge} onOpenChange={(open) => !open && setEditingCharge(null)}>
        <DialogContent>
          <DialogHeader onClose={() => setEditingCharge(null)}>
            <DialogTitle>Edit Charge</DialogTitle>
          </DialogHeader>
          {editingCharge && (
            <ChargeForm
              key={editingCharge.charge_id}
              initialValues={{
                charge_amount: editingCharge.charge_amount,
                paid_amount: editingCharge.paid_amount,
                student_id: editingCharge.student_id,
                student_name: editingCharge.student_name,
                date_charged: editingCharge.date_charged,
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingCharge(null)}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCharge} onOpenChange={(open) => !open && setDeletingCharge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete charge {deletingCharge?.charge_id}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
