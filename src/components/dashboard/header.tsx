'use client'

import { Bell, Menu, X } from 'lucide-react'
import { LogoutButton } from '@/components/auth/logout-button'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Couple } from '@/lib/types/database'

interface HeaderProps {
  couple: Couple | null
  onMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function Header({ couple, onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center min-w-0 flex-1">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-2 shrink-0"
            onClick={onMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          <div className="min-w-0">
            <h1 className="hidden sm:block text-base sm:text-lg font-semibold text-gray-900 truncate">
              Wedding Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Notification Center */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 md:w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-80 sm:max-h-96 overflow-y-auto">
                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                    Notifications
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="shrink-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-900 leading-tight">
                          Welcome to Wedflow! Complete your profile setup.
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">2 hours ago</p>
                      </div>
                    </div>
                    <div className="text-center py-1.5 sm:py-2">
                      <p className="text-xs sm:text-sm text-gray-500">No more notifications</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  )
}