import { Search, RotateCcw, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Button } from "@/components/ui/button"
import { getUniqueStudents } from "@/lib/table-utils"
import type { Charge } from "@/types/charge"
import type { FilterState } from "@/types/table"

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

type SearchFiltersProps = {
  filter: FilterState
  onFilterChange: (filter: FilterState) => void
  charges: Charge[]
  onAddClick?: () => void
  pageSize: number
  onPageSizeChange: (size: number) => void
}

export function SearchFilters({ filter, onFilterChange, charges, onAddClick, pageSize, onPageSizeChange }: SearchFiltersProps) {
  const students = getUniqueStudents(charges)

  const update = (updates: Partial<FilterState>) => {
    onFilterChange({ ...filter, ...updates })
  }

  const resetFilters = () => {
    onFilterChange({
      search: "",
      status: "",
      studentId: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
    })
  }

  const filterFieldClass = "grid gap-1.5 min-w-0"
  const inputClass = "h-10 w-full"

  return (
    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg">
          {/* Column 1: Search */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Charge #, student name or ID..."
                value={filter.search}
                onChange={(e) => update({ search: e.target.value })}
                className="pl-10 h-10 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b3c68] focus:border-transparent"
              />
            </div>
          </div>
          {/* Column 2: Items per page */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Items per page</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={`${inputClass} px-3 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b3c68] focus:border-transparent`}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          {/* Column 3: Status */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Status</label>
            <select
              value={filter.status}
              onChange={(e) => update({ status: e.target.value as FilterState["status"] })}
              className={`${inputClass} px-3 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b3c68] focus:border-transparent`}
              title="Paid = full, Partial = some, Unpaid = none"
            >
              <option value="">All</option>
              <option value="paid">Paid - Fully Paid</option>
              <option value="partial">Partial - Partially Paid</option>
              <option value="unpaid">Unpaid - Not Paid</option>
            </select>
          </div>
          {/* Column 4: Student */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Student</label>
            <select
              value={filter.studentId}
              onChange={(e) => update({ studentId: e.target.value })}
              className={`${inputClass} px-3 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1b3c68] focus:border-transparent`}
            >
              <option value="">All students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>
          {/* Row 2 - Column 1: Date from */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Date from</label>
            <DateInput
              value={filter.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
              className={inputClass}
            />
          </div>
          {/* Row 2 - Column 2: Date to */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Date to</label>
            <DateInput
              value={filter.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
              className={inputClass}
            />
          </div>
          {/* Row 2 - Column 3: Amount min */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Amount min ($)</label>
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="Min"
              value={filter.amountMin}
              onChange={(e) => update({ amountMin: e.target.value })}
              className={inputClass}
            />
          </div>
          {/* Row 2 - Column 4: Amount max */}
          <div className={filterFieldClass}>
            <label className="text-xs font-medium text-gray-500">Amount max ($)</label>
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="Max"
              value={filter.amountMax}
              onChange={(e) => update({ amountMax: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          {onAddClick && (
            <Button size="sm" onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Charge
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
