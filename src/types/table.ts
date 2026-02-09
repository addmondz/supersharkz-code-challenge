export type ChargeStatus = "paid" | "partial" | "unpaid"

export type SortColumn =
  | "charge_id"
  | "date_charged"
  | "student_id"
  | "student_name"
  | "charge_amount"
  | "paid_amount"
  | "pending_amount"
  | "status"

export type SortDirection = "asc" | "desc"

export type SortState = {
  column: SortColumn
  direction: SortDirection
}

export type FilterState = {
  search: string
  status: ChargeStatus | ""
  studentId: string
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
}

export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  status: "",
  studentId: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
}
