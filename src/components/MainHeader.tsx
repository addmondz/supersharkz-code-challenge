type MainHeaderProps = {
  onMenuClick?: () => void
}

export function MainHeader({ onMenuClick }: MainHeaderProps) {
  return (
    <header className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          aria-label="Open menu"
        >
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      )}
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">Charges</h1>
    </header>
  )
}
