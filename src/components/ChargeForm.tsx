import { useState, useCallback } from "react"
import type { Charge } from "@/types/charge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ChargeFormValues = Omit<Charge, "charge_id">

type ChargeFormProps = {
  initialValues?: ChargeFormValues | null
  onSubmit: (values: ChargeFormValues) => void
  onCancel?: () => void
  onValidationError?: () => void
  submitLabel?: string
  className?: string
  students?: { id: string; name: string }[]
}

const emptyForm: ChargeFormValues = {
  charge_amount: 0,
  paid_amount: 0,
  student_id: "",
  student_name: "",
  date_charged: "",
}

const DECIMAL_PLACES_REGEX = /^\d+(\.\d{1,2})?$/

function isValidDate(dateStr: string): boolean {
  if (!dateStr || dateStr.length !== 10) return false
  const date = new Date(dateStr + "T12:00:00")
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateStr
}

function validate(values: ChargeFormValues): Partial<Record<keyof ChargeFormValues, string>> {
  const errors: Partial<Record<keyof ChargeFormValues, string>> = {}
  if (!values.student_id.trim()) errors.student_id = "Student ID is required"
  if (!values.student_name.trim()) errors.student_name = "Student name is required"
  if (!values.date_charged) errors.date_charged = "Date is required"
  else if (!isValidDate(values.date_charged)) errors.date_charged = "Please enter a valid date (YYYY-MM-DD)"
  if (values.charge_amount <= 0) errors.charge_amount = "Charge amount must be greater than 0"
  else if (!DECIMAL_PLACES_REGEX.test(String(values.charge_amount))) {
    errors.charge_amount = "Charge amount must have at most 2 decimal places"
  }
  if (values.paid_amount < 0) errors.paid_amount = "Paid amount cannot be negative"
  else if (!DECIMAL_PLACES_REGEX.test(String(values.paid_amount))) {
    errors.paid_amount = "Paid amount must have at most 2 decimal places"
  } else if (values.paid_amount > values.charge_amount) {
    errors.paid_amount = "Paid amount cannot exceed charge amount"
  }
  return errors
}

export function ChargeForm({
  initialValues = null,
  onSubmit,
  onCancel,
  onValidationError,
  submitLabel = "Add Charge",
  className,
  students = [],
}: ChargeFormProps) {
  const [values, setValues] = useState<ChargeFormValues>(
    initialValues ?? emptyForm
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ChargeFormValues, string>>>({})

  const handleChange = useCallback((field: keyof ChargeFormValues, value: string | number) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const errs = validate(values)
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        onValidationError?.()
        return
      }
      onSubmit(values)
      if (!initialValues) {
        setValues(emptyForm)
      }
      setErrors({})
    },
    [values, onSubmit, initialValues, onValidationError]
  )

  const showStudentSelect = students.length > 0

  const handleStudentSelect = (option: { id: string; name: string }) => {
    handleChange("student_id", option.id)
    handleChange("student_name", option.name)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {showStudentSelect ? (
        <div className="grid gap-2">
          <Label htmlFor="student_select">Select Student</Label>
          <SearchableSelect
            id="student_select"
            options={students}
            value={values.student_id}
            onSelect={handleStudentSelect}
            placeholder="Search or select a student..."
            hasError={!!(errors.student_id || errors.student_name)}
          />
          {(errors.student_id || errors.student_name) && (
            <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
              {errors.student_id || errors.student_name}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              value={values.student_id}
              onChange={(e) => handleChange("student_id", e.target.value)}
              placeholder="e.g. stu_101"
              className={errors.student_id ? "border-red-500" : ""}
            />
            {errors.student_id && (
              <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">{errors.student_id}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="student_name">Student Name</Label>
            <Input
              id="student_name"
              value={values.student_name}
              onChange={(e) => handleChange("student_name", e.target.value)}
              placeholder="e.g. John Smith"
              className={errors.student_name ? "border-red-500" : ""}
            />
            {errors.student_name && (
              <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">{errors.student_name}</p>
            )}
          </div>
        </>
      )}

      <div className="grid gap-2">
        <Label htmlFor="charge_amount">Charge Amount ($)</Label>
        <Input
          id="charge_amount"
          type="number"
          step="0.01"
          min="0.01"
          value={values.charge_amount || ""}
          onChange={(e) => handleChange("charge_amount", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className={errors.charge_amount ? "border-red-500" : ""}
        />
        {errors.charge_amount && (
          <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">{errors.charge_amount}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="paid_amount">Paid Amount ($)</Label>
        <Input
          id="paid_amount"
          type="number"
          step="0.01"
          min="0"
          value={values.paid_amount ?? ""}
          onChange={(e) => handleChange("paid_amount", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className={errors.paid_amount ? "border-red-500" : ""}
        />
        {errors.paid_amount && (
          <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">{errors.paid_amount}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date_charged">Date Charged</Label>
        <DateInput
          id="date_charged"
          value={values.date_charged}
          onChange={(e) => handleChange("date_charged", e.target.value)}
          className={errors.date_charged ? "border-red-500" : ""}
        />
        {errors.date_charged && (
          <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">{errors.date_charged}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
