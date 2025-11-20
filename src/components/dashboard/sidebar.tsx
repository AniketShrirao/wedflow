'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Contact, 
  Calendar, 
  Camera, 
  Gift, 
  CheckSquare, 
  Settings,
  Home,
  Palette,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Couple } from '@/lib/types/database'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Guest Management', href: '/dashboard/guests', icon: Users },
  { name: 'Vendor Contacts', href: '/dashboard/contacts', icon: Contact },
  { name: 'Event Details', href: '/dashboard/events', icon: Calendar },
  { name: 'Photo Gallery', href: '/dashboard/photos', icon: Camera },
  { name: 'Gift Portal', href: '/dashboard/gifts', icon: Gift },
  { name: 'Todo Planner', href: '/dashboard/todos', icon: CheckSquare },
  { name: 'Wedding Themes', href: '/dashboard/themes', icon: Palette },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
  couple?: Couple | null
}

export function Sidebar({ onClose, couple }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-full bg-white shadow-sm border-r border-gray-200">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 border-b border-gray-200">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Wedflow</h1>
          {couple && (
            <p className="text-sm sm:text-base text-gray-600 truncate mt-0.5">
              {couple.partner1_name} & {couple.partner2_name}
            </p>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden ml-3 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 px-3 sm:px-6 py-6 sm:py-8 space-y-2 sm:space-y-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-colors whitespace-nowrap sm:whitespace-normal',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}