import type { Charge } from "@/types/charge"

const STUDENTS = [
  { id: "stu_101", name: "Jason Schuller" },
  { id: "stu_102", name: "Eva Calvert" },
  { id: "stu_103", name: "Citrus Lee" },
  { id: "stu_104", name: "Samantha Lee" },
  { id: "stu_105", name: "Michael Chen" },
  { id: "stu_106", name: "Sarah Williams" },
  { id: "stu_107", name: "David Park" },
  { id: "stu_108", name: "Emma Thompson" },
  { id: "stu_109", name: "James Wilson" },
  { id: "stu_110", name: "Olivia Martinez" },
  { id: "stu_111", name: "Daniel Brown" },
  { id: "stu_112", name: "Sophia Davis" },
  { id: "stu_113", name: "Alexander Kim" },
  { id: "stu_114", name: "Isabella Garcia" },
  { id: "stu_115", name: "Benjamin Taylor" },
  { id: "stu_116", name: "Mia Anderson" },
  { id: "stu_117", name: "William Thomas" },
  { id: "stu_118", name: "Charlotte White" },
  { id: "stu_119", name: "Henry Jones" },
  { id: "stu_120", name: "Amelia Clark" },
  { id: "stu_121", name: "Lucas Rodriguez" },
  { id: "stu_122", name: "Charlotte Moore" },
  { id: "stu_123", name: "Ethan Johnson" },
  { id: "stu_124", name: "Ava Robinson" },
  { id: "stu_125", name: "Mason Lewis" },
  { id: "stu_126", name: "Harper Walker" },
  { id: "stu_127", name: "Liam Hall" },
  { id: "stu_128", name: "Ella Young" },
  { id: "stu_129", name: "Noah King" },
  { id: "stu_130", name: "Grace Scott" },
]

const AMOUNTS = [49, 79, 99, 120, 150, 199, 200, 250, 299, 350, 399, 450, 500]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return d.toISOString().slice(0, 10)
}

function generateCharges(count: number): Charge[] {
  const charges: Charge[] = []
  const startDate = new Date("2025-06-01")
  const endDate = new Date("2025-10-15")

  for (let i = 0; i < count; i++) {
    const student = randomItem(STUDENTS)
    const baseAmount = randomItem(AMOUNTS)
    const chargeAmount = round2(baseAmount + Math.random())
    const paidRatio = Math.random()
    const paidAmount =
      paidRatio < 0.4 ? 0 : paidRatio < 0.7 ? round2(chargeAmount * (0.3 + Math.random() * 0.7)) : chargeAmount

    charges.push({
      charge_id: `chg_${String(2200 - i).padStart(4, "0")}`,
      charge_amount: chargeAmount,
      paid_amount: paidAmount,
      student_id: student.id,
      student_name: student.name,
      date_charged: randomDate(startDate, endDate),
    })
  }

  return charges.sort((a, b) => b.date_charged.localeCompare(a.date_charged))
}

export const MOCK_CHARGES: Charge[] = generateCharges(50)
