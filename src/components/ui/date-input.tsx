import * as React from "react"
import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, id, disabled, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const mergedRef = (el: HTMLInputElement | null) => {
      inputRef.current = el
      if (typeof ref === "function") ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
    }

    const handleContainerClick = () => {
      if (disabled) return
      const input = inputRef.current
      if (input?.showPicker) input.showPicker()
    }

    return (
      <div
        role="button"
        tabIndex={-1}
        onClick={handleContainerClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleContainerClick()
          }
        }}
        className={cn(
          "relative flex w-full cursor-pointer rounded-lg border border-gray-300 bg-white transition-all duration-200",
          "focus-within:border-[#1b3c68] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1b3c68]/20",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <Input
          ref={mergedRef}
          id={id}
          type="date"
          className={cn(
            "h-10 border-0 bg-transparent px-3 py-2 pr-10 focus:ring-0 focus:ring-offset-0",
            "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
          )}
          disabled={disabled}
          {...props}
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    )
  }
)
DateInput.displayName = "DateInput"

export { DateInput }
