'use client'

import { useState, useEffect } from 'react'
import { Heart, Calendar, MapPin, Clock, Camera, Gift } from 'lucide-react'

interface FloatingNavProps {
  availableSections: {
    events: boolean
    venues: boolean
    timeline: boolean
    photos: boolean
    gifts: boolean
  }
}

export function FloatingNav({ availableSections }: FloatingNavProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const toggleVisibility = () => {
      // Show after scrolling past hero section
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    const updateActiveSection = () => {
      const sections = ['hero', 'events', 'venues', 'timeline', 'photos', 'gifts']
      const scrollPosition = window.pageYOffset + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    const handleScroll = () => {
      toggleVisibility()
      updateActiveSection()
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const allNavItems = [
    { href: '#hero', icon: Heart, label: 'Home', key: 'hero', available: true },
    { href: '#events', icon: Calendar, label: 'Events', key: 'events', available: availableSections.events },
    { href: '#venues', icon: MapPin, label: 'Venues', key: 'venues', available: availableSections.venues },
    { href: '#timeline', icon: Clock, label: 'Timeline', key: 'timeline', available: availableSections.timeline },
    { href: '#photos', icon: Camera, label: 'Photos', key: 'photos', available: availableSections.photos },
    { href: '#gifts', icon: Gift, label: 'Gifts', key: 'gifts', available: availableSections.gifts },
  ]

  const navItems = allNavItems.filter(item => item.available)

  if (navItems.length <= 1) return null

  return (
    <>
      {/* Desktop Navigation - Bottom Center */}
      <nav 
        className={`hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-pink-100/50 px-6 py-3">
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`group flex flex-col items-center space-y-1 transition-all duration-200 p-2 rounded-full ${
                  activeSection === item.key
                    ? 'text-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                }`}
                title={item.label}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <item.icon className={`h-5 w-5 transition-transform duration-200 ${
                  activeSection === item.key ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className={`text-xs font-medium transition-opacity duration-200 ${
                  activeSection === item.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Fixed Bottom Menu */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-1 transition-all duration-200 px-3 py-2 rounded-xl min-w-[60px] ${
                activeSection === item.key
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-600 active:bg-gray-100'
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <item.icon className={`h-6 w-6 transition-transform duration-200 ${
                activeSection === item.key ? 'scale-110' : ''
              }`} />
              <span className={`text-xs font-medium ${
                activeSection === item.key ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}