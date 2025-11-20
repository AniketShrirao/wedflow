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
  Palette
} from 'lucide-react'

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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Wedflow</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}