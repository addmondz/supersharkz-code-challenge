import { Menu, ChevronRight, Home, Waves, Users, Calendar, Clock, CreditCard, GraduationCap, CalendarCheck, BarChart3, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"

type SidebarProps = {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Lessons", icon: Waves, hasChevron: true },
  { label: "Members", icon: Users },
  { label: "Schedule", icon: Calendar, hasChevron: true },
  { label: "Sessions", icon: Clock },
  { label: "Charges", icon: CreditCard, active: true },
  { label: "Coaches", icon: GraduationCap },
  { label: "Bookings", icon: CalendarCheck },
  { label: "Reports", icon: BarChart3, hasChevron: true },
  { label: "Settings", icon: Settings },
]

export function Sidebar({ open = false, onClose }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col w-64 flex-shrink-0 bg-white border-r border-gray-200",
        "fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="h-16 bg-white flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:border-b-0 lg:justify-center">
        <img
          src="/logo.png"
          alt="Super Sharkz"
          className="h-12 w-auto object-contain"
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation - white panel */}
      <nav className="flex-1 bg-white border-r border-gray-200 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onClose?.()}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium transition-colors mb-0.5",
                item.active
                  ? "bg-[#1b3c68]/10 text-[#1b3c68]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
              {item.hasChevron && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 bg-[#1b3c68] flex items-center justify-center text-white text-sm font-bold rounded-full">
            A
          </div>
          <span className="text-black text-sm font-medium flex-1">Admin User</span>
          <div className="text-gray-400 cursor-pointer hover:text-white">
            <Menu className="h-4 w-4" />
          </div>
        </div>
      </div>
    </aside>
  )
}
