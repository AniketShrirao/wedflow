'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Couple } from '@/lib/types/database'
import { Toaster } from 'sonner'

interface DashboardLayoutProps {
  children: React.ReactNode
  couple: Couple | null
}

export function DashboardLayout({ children, couple }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar couple={couple} />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75 animate-in fade-in duration-300" onClick={toggleMobileMenu} />
          <div className="relative flex flex-col w-full bg-white shadow-xl h-screen overflow-y-auto animate-in slide-in-from-left duration-300">
            <Sidebar onClose={toggleMobileMenu} couple={couple} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          couple={couple} 
          onMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  )
}