import { useState, useCallback, useEffect } from "react"
import type { Charge } from "@/types/charge"
import { MOCK_CHARGES } from "@/data/mockCharges"
import { roundCurrency } from "@/lib/utils"

function generateChargeId(charges: Charge[]): string {
  const max = charges.length
    ? Math.max(...charges.map((c) => parseInt(c.charge_id.replace(/\D/g, ""), 10) || 0))
    : 0
  return `chg_${String(max + 1).padStart(4, "0")}`
}

export function useCharges() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCharges(MOCK_CHARGES)
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const addCharge = useCallback((charge: Omit<Charge, "charge_id">) => {
    const normalized = {
      ...charge,
      charge_amount: roundCurrency(charge.charge_amount),
      paid_amount: roundCurrency(charge.paid_amount),
    }
    setCharges((prev) => [
      ...prev,
      { ...normalized, charge_id: generateChargeId(prev) },
    ])
  }, [])

  const updateCharge = useCallback((charge_id: string, updates: Partial<Charge>) => {
    const normalized = { ...updates }
    if (typeof updates.charge_amount === "number") {
      normalized.charge_amount = roundCurrency(updates.charge_amount)
    }
    if (typeof updates.paid_amount === "number") {
      normalized.paid_amount = roundCurrency(updates.paid_amount)
    }
    setCharges((prev) =>
      prev.map((c) => (c.charge_id === charge_id ? { ...c, ...normalized } : c))
    )
  }, [])

  const deleteCharge = useCallback((charge_id: string) => {
    setCharges((prev) => prev.filter((c) => c.charge_id !== charge_id))
  }, [])

  return { charges, addCharge, updateCharge, deleteCharge, isLoading }
}
