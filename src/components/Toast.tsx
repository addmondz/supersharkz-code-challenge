import { useEffect } from "react"
import { cn } from "@/lib/utils"

type ToastProps = {
  message: string
  variant: "success" | "error"
  onClose: () => void
  duration?: number
}

export function Toast({ message, variant, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] px-4 py-3 shadow-md border animate-in slide-in-from-bottom-2 fade-in duration-300",
        variant === "success" && "bg-green-50 border-green-200 text-green-800",
        variant === "error" && "bg-red-50 border-red-200 text-red-800"
      )}
    >
      {message}
    </div>
  )
}
