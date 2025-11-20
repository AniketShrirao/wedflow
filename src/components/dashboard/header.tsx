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
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-2"
            onClick={onMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Wedding Dashboard
            </h1>
            {couple && (
              <p className="text-sm text-gray-600">
                {couple.partner1_name} & {couple.partner2_name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="shrink-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          Welcome to Wedflow! Complete your profile setup.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">No more notifications</p>
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