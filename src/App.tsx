import { useState, useCallback } from "react"
import { useCharges } from "@/hooks/useCharges"
import { getUniqueStudents } from "@/lib/table-utils"
import { DEFAULT_FILTER_STATE } from "@/types/table"
import { ChargeForm } from "@/components/ChargeForm"
import { ChargeTable } from "@/components/ChargeTable"
import { Sidebar } from "@/components/Sidebar"
import { MainHeader } from "@/components/MainHeader"
import { SearchFilters } from "@/components/SearchFilters"
import { Toast } from "@/components/Toast"
import { Loading } from "@/components/Loading"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function App() {
  const { charges, addCharge, updateCharge, deleteCharge, isLoading } = useCharges()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null)
  const [filter, setFilter] = useState(DEFAULT_FILTER_STATE)
  const [pageSize, setPageSize] = useState(10)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleAddSuccess = () => {
    setAddModalOpen(false)
    setToast({ message: "Charge added successfully", variant: "success" })
  }

  const handleAddFail = () => {
    setToast({ message: "Failed to add charge. Please check the form.", variant: "error" })
  }

  const handleEditSuccess = useCallback(() => {
    setToast({ message: "Charge updated successfully", variant: "success" })
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    setToast({ message: "Charge deleted successfully", variant: "success" })
  }, [])

  const handleToastClose = useCallback(() => setToast(null), [])

  return (
    <div className={cn("min-h-screen bg-gray-900 flex flex-col lg:flex-row", sidebarOpen && "overflow-hidden")}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 shadow-xl overflow-hidden">
        <MainHeader onMenuClick={() => setSidebarOpen(true)} />
        <SearchFilters
          filter={filter}
          onFilterChange={setFilter}
          charges={charges}
          onAddClick={() => setAddModalOpen(true)}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />

        <main className="flex-1 overflow-auto">
          {isLoading ? (
            <Loading className="min-h-[400px] py-24" size="lg" />
          ) : (
          <ChargeTable
            charges={charges}
            filter={filter}
            onUpdate={updateCharge}
            onDelete={deleteCharge}
            onEditSuccess={handleEditSuccess}
            onDeleteSuccess={handleDeleteSuccess}
            pageSize={pageSize}
          />
          )}
        </main>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setAddModalOpen(false)}>
            <DialogTitle>Add Charge</DialogTitle>
          </DialogHeader>
          <ChargeForm
            students={getUniqueStudents(charges)}
            onSubmit={(values) => {
              addCharge(values)
              handleAddSuccess()
            }}
            onCancel={() => setAddModalOpen(false)}
            onValidationError={handleAddFail}
            submitLabel="Add Charge"
          />
        </DialogContent>
      </Dialog>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={handleToastClose}
        />
      )}
    </div>
  )
}

export default App
