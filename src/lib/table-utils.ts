import type { Charge } from "@/types/charge"
import type { FilterState, SortState } from "@/types/table"
import { roundCurrency } from "@/lib/utils"

function getOutstanding(charge: Charge): number {
  return roundCurrency(charge.charge_amount - charge.paid_amount)
}

function getStatus(charge: Charge): "paid" | "partial" | "unpaid" {
  const outstanding = getOutstanding(charge)
  if (outstanding <= 0) return "paid"
  if (charge.paid_amount > 0) return "partial"
  return "unpaid"
}

export function filterCharges(charges: Charge[], filter: FilterState): Charge[] {
  return charges.filter((charge) => {
    const status = getStatus(charge)
    const searchLower = filter.search.toLowerCase().trim()
    const chargeId = charge.charge_id.toLowerCase()
    const studentName = charge.student_name.toLowerCase()
    const studentId = charge.student_id.toLowerCase()

    if (filter.search) {
      const matchesSearch =
        chargeId.includes(searchLower) ||
        studentName.includes(searchLower) ||
        studentId.includes(searchLower)
      if (!matchesSearch) return false
    }

    if (filter.status && status !== filter.status) return false

    if (filter.studentId && charge.student_id !== filter.studentId) return false

    if (filter.dateFrom && charge.date_charged < filter.dateFrom) return false
    if (filter.dateTo && charge.date_charged > filter.dateTo) return false

    const amountMin = parseFloat(filter.amountMin)
    const amountMax = parseFloat(filter.amountMax)
    if (!Number.isNaN(amountMin) && charge.charge_amount < amountMin) return false
    if (!Number.isNaN(amountMax) && charge.charge_amount > amountMax) return false

    return true
  })
}

export function sortCharges(charges: Charge[], sort: SortState): Charge[] {
  const result = [...charges]
  const dir = sort.direction === "asc" ? 1 : -1

  result.sort((a, b) => {
    let cmp = 0
    switch (sort.column) {
      case "charge_id":
        cmp = a.charge_id.localeCompare(b.charge_id)
        break
      case "date_charged":
        cmp = a.date_charged.localeCompare(b.date_charged)
        break
      case "student_id":
        cmp = a.student_id.localeCompare(b.student_id)
        break
      case "student_name":
        cmp = a.student_name.localeCompare(b.student_name)
        break
      case "charge_amount":
        cmp = a.charge_amount - b.charge_amount
        break
      case "paid_amount":
        cmp = a.paid_amount - b.paid_amount
        break
      case "pending_amount":
        cmp = getOutstanding(a) - getOutstanding(b)
        break
      case "status": {
        const statusOrder = { paid: 0, partial: 1, unpaid: 2 }
        cmp = statusOrder[getStatus(a)] - statusOrder[getStatus(b)]
        break
      }
      default:
        return 0
    }
    return cmp * dir
  })

  return result
}

export function paginateCharges<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function getUniqueStudents(charges: Charge[]): { id: string; name: string }[] {
  const seen = new Set<string>()
  return charges
    .map((c) => ({ id: c.student_id, name: c.student_name }))
    .filter((s) => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export { getStatus, getOutstanding }
