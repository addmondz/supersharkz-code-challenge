import { cn } from "@/lib/utils"

type LoadingProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-2",
  lg: "h-14 w-14 border-[3px]",
}

export function Loading({ className, size = "md" }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <div
        className={cn(
          "rounded-full border-[#1b3c68]/20 border-t-[#1b3c68] animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  )
}
