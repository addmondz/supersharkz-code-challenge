import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SearchableSelectOption = { id: string; name: string }

type SearchableSelectProps = {
  options: SearchableSelectOption[]
  value: string
  onSelect: (option: SearchableSelectOption) => void
  placeholder?: string
  className?: string
  hasError?: boolean
  id?: string
}

export function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder = "Select...",
  className,
  hasError,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const selected = options.find((o) => o.id === value)

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase()
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    )
  }, [options, search])

  React.useEffect(() => {
    if (open) {
      setSearch("")
      setHighlightedIndex(0)
      inputRef.current?.focus()
    }
  }, [open])

  React.useEffect(() => {
    if (open) {
      const el = listRef.current?.children[highlightedIndex] as HTMLElement
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [open, highlightedIndex])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        setOpen(true)
      }
      return
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault()
        setOpen(false)
        break
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((i) => Math.max(i - 1, 0))
        break
      case "Enter": {
        e.preventDefault()
        const item = filtered[highlightedIndex]
        if (item) {
          onSelect(item)
          setOpen(false)
        }
        break
      }
    }
  }

  const handleSelect = (option: SearchableSelectOption) => {
    onSelect(option)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-listbox` : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={cn(
          "flex h-10 w-full items-center rounded-lg border bg-white px-3 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#1b3c68] focus:ring-offset-0",
          hasError ? "border-red-500" : "border-gray-300",
          "cursor-pointer"
        )}
      >
        {open ? (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setHighlightedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none"
            autoComplete="off"
          />
        ) : (
          <span className={cn("flex-1 truncate", !selected && "text-gray-400")}>
            {selected ? `${selected.name} (${selected.id})` : placeholder}
          </span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
        />
      </div>

      {open && (
        <ul
          ref={listRef}
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">No students found</li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option.id}
                role="option"
                aria-selected={option.id === value}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm",
                  i === highlightedIndex && "bg-[#1b3c68]/10",
                  option.id === value && "font-medium text-[#1b3c68]"
                )}
              >
                {option.name} ({option.id})
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
