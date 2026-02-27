'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { VenueDetails } from '@/lib/types/events'
import { Button } from '@/components/ui/button'
import '@/styles/components/venue-carousel.scss'

interface VenueCarouselSectionProps {
  venues: VenueDetails[]
}

export function VenueCarouselSection({ venues }: VenueCarouselSectionProps) {
  if (!venues || venues.length === 0) return null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedPin, setCopiedPin] = useState<'left' | 'right' | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  const copyAddressToClipboard = async (pin: 'left' | 'right') => {
    try {
      const textToCopy = `${currentVenue.name}\n${currentVenue.address}`
      await navigator.clipboard.writeText(textToCopy)
      setCopiedPin(pin)
      setTimeout(() => setCopiedPin(null), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const getDirectionsUrl = (venue: VenueDetails) => {
    if (venue.maps_url) {
      const url = venue.maps_url.trim()
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      if (url.startsWith('www.') || url.startsWith('google.com')) {
        return `https://${url}`
      }
      return `https://${url}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const sectionRect = sectionRef.current.getBoundingClientRect()
      const sectionTop = sectionRect.top
      const sectionHeight = sectionRect.height
      const viewportHeight = window.innerHeight
      
      // Calculate progress through the section
      // When section top is at viewport top, progress = 0
      // When section bottom is at viewport bottom, progress = 1
      const scrollProgress = Math.max(0, Math.min(1, (-sectionTop) / (sectionHeight - viewportHeight)))
      
      // Determine which card to show based on scroll progress
      const totalCards = venues.length
      const cardIndex = Math.min(
        Math.floor(scrollProgress * totalCards),
        totalCards - 1
      )
      
      setCurrentIndex(cardIndex)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [venues.length])

  const currentVenue = venues[currentIndex]

  return (
    <section 
      ref={sectionRef}
      className="relative w-full"
      style={{
        height: `calc(${venues.length * 100}vh - 20vh)`,
      }}
    >
      {/* Section Header - Outside sticky container */}
      <div className="relative bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-6 shadow-lg">
            <MapPin className="h-8 w-8 md:h-10 md:w-10 text-pink-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Venue Details
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Find us at these beautiful locations for our wedding celebrations
          </p>
        </div>
      </div>

      {/* Sticky Container */}
      <div
        className={`sticky top-0 w-full h-screen overflow-hidden`}
        style={{
          zIndex: 10,
        }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50" />

        {/* Content Container */}
        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
          {/* Card */}
          <div className="w-full h-full max-w-6xl mx-auto flex flex-col md:flex-row gap-0 rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
            {/* Content Side */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">

              {/* Card Counter */}
              <div 
                key={`counter-${currentIndex}`}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold text-lg mb-6 shadow-lg animate-slide-in-up"
              >
                {currentIndex + 1}
              </div>

              {/* Venue Name */}
              <h3 
                key={`name-${currentIndex}`}
                className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6 leading-tight animate-slide-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                {currentVenue.name}
              </h3>

              {/* Address */}
              <div 
                key={`address-${currentIndex}`}
                className="flex items-start gap-4 mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl animate-slide-in-up hover:bg-gray-200 transition-colors group cursor-pointer"
                style={{ animationDelay: '0.2s' }}
                onClick={() => copyAddressToClipboard('left')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    copyAddressToClipboard('left')
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyAddressToClipboard('left')
                  }}
                  className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 hover:bg-pink-200 group-hover:scale-110 transition-all cursor-pointer"
                  title="Click to copy address"
                  aria-label="Copy address to clipboard"
                >
                  <MapPin className="h-6 w-6 text-pink-600 cursor-pointer" />
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Address</p>
                  <address className="text-gray-800 font-medium not-italic leading-relaxed">
                    {currentVenue.address}
                  </address>
                  {copiedPin === 'left' && (
                    <p className="text-xs text-green-600 mt-2 font-medium">✓ Copied to clipboard</p>
                  )}
                </div>
              </div>

              {/* Description */}
              {currentVenue.description && (
                <div 
                  key={`desc-${currentIndex}`}
                  className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-l-4 border-pink-400 animate-slide-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  <blockquote className="text-gray-700 leading-relaxed italic">
                    "{currentVenue.description}"
                  </blockquote>
                </div>
              )}

              {/* Contact Info */}
              {(currentVenue.contact_phone || currentVenue.contact_email) && (
                <div 
                  key={`contact-${currentIndex}`}
                  className="space-y-3 mb-8 animate-slide-in-up"
                  style={{ animationDelay: '0.4s' }}
                >
                  {currentVenue.contact_phone && (
                    <a 
                      href={`tel:${currentVenue.contact_phone}`}
                      className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-gray-800 font-medium">{currentVenue.contact_phone}</span>
                    </a>
                  )}
                  {currentVenue.contact_email && (
                    <a 
                      href={`mailto:${currentVenue.contact_email}`}
                      className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                        <MapPin className="h-5 w-5 text-pink-600" />
                      </div>
                      <span className="text-gray-800 font-medium">{currentVenue.contact_email}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Get Directions Button */}
              <div 
                key={`button-${currentIndex}`}
                className="animate-slide-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                <Button 
                  asChild 
                  className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6 rounded-xl"
                >
                  <a
                    href={getDirectionsUrl(currentVenue)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Navigation className="h-5 w-5" />
                    Get Directions
                  </a>
                </Button>
              </div>

              {/* Progress Indicator */}
              <div 
                key={`progress-${currentIndex}`}
                className="mt-12 pt-8 border-t border-gray-200 animate-fade-in"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">
                    {currentIndex + 1} of {venues.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentIndex + 1) / venues.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Visual Side */}
            <div 
              key={`visual-${currentIndex}`}
              className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 animate-slide-in-right"
            >
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => copyAddressToClipboard('right')}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl animate-fade-in hover:bg-white hover:shadow-3xl transition-all cursor-pointer group"
                    title="Click to copy address"
                    aria-label="Copy address to clipboard"
                  >
                    <MapPin className="h-16 w-16 md:h-20 md:w-20 text-pink-600 group-hover:scale-110 transition-transform cursor-pointer" />
                  </button>
                  {copiedPin === 'right' && (
                    <p className="text-xs text-green-600 font-medium">✓ Copied to clipboard</p>
                  )}
                </div>
                
                <h4 
                  className="text-2xl md:text-3xl font-medium text-gray-800 mb-4 text-center animate-slide-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  {currentVenue.name}
                </h4>
                
                <address 
                  className="text-center text-gray-600 not-italic max-w-md leading-relaxed animate-slide-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  {currentVenue.address}
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Hint - Only show on first card */}
        {currentIndex === 0 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Scroll to explore venues</p>
              <svg className="w-6 h-6 mx-auto text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
