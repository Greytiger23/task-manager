'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CategorySidebar } from '@/components/categories/CategorySidebar'
import { TaskList } from '@/components/tasks/TaskList'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, User } from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-xl font-bold items-center text-gray-900">Task Manager</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 lg:z-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="h-full pt-16 lg:pt-0">
              <CategorySidebar
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={(categoryId) => {
                  setSelectedCategoryId(categoryId)
                  setIsSidebarOpen(false) // Close sidebar on mobile after selection
                }}
              />
            </div>
          </div>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="h-full p-4 lg:p-6">
              <TaskList selectedCategoryId={selectedCategoryId} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}