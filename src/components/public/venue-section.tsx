'use client'

import { MapPin, Phone, Mail, ExternalLink, Navigation } from 'lucide-react'
import { VenueDetails } from '@/lib/types/events'
import { Button } from '@/components/ui/button'

interface VenueSectionProps {
  venues: VenueDetails[]
}

export function VenueSection({ venues }: VenueSectionProps) {
  if (!venues || venues.length === 0) return null

  const getDirectionsUrl = (venue: VenueDetails) => {
    if (venue.maps_url) return venue.maps_url
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
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

        {/* Venues */}
        <div className="space-y-12 md:space-y-20">
          {venues.map((venue, index) => (
            <div 
              key={venue.id}
              className={`group relative ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
            >
              <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 hover:shadow-3xl transition-shadow duration-500">
                {/* Content Side */}
                <div className={`p-8 md:p-12 lg:p-16 flex flex-col justify-center ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold text-lg mb-6 shadow-lg">
                    {index + 1}
                  </div>

                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6 leading-tight">
                    {venue.name}
                  </h3>

                  {/* Address */}
                  <div className="flex items-start gap-4 mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <address className="text-gray-800 font-medium not-italic leading-relaxed">
                        {venue.address}
                      </address>
                    </div>
                  </div>

                  {/* Description */}
                  {venue.description && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-l-4 border-pink-400">
                      <blockquote className="text-gray-700 leading-relaxed italic">
                        "{venue.description}"
                      </blockquote>
                    </div>
                  )}

                  {/* Contact Info */}
                  {(venue.contact_phone || venue.contact_email) && (
                    <div className="space-y-3 mb-8">
                      {venue.contact_phone && (
                        <a 
                          href={`tel:${venue.contact_phone}`}
                          className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group/contact"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover/contact:bg-purple-200 transition-colors">
                            <Phone className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="text-gray-800 font-medium">{venue.contact_phone}</span>
                        </a>
                      )}
                      {venue.contact_email && (
                        <a 
                          href={`mailto:${venue.contact_email}`}
                          className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group/contact"
                        >
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center group-hover/contact:bg-pink-200 transition-colors">
                            <Mail className="h-5 w-5 text-pink-600" />
                          </div>
                          <span className="text-gray-800 font-medium">{venue.contact_email}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Get Directions Button */}
                  <Button 
                    asChild 
                    className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6 rounded-xl"
                  >
                    <a
                      href={getDirectionsUrl(venue)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <Navigation className="h-5 w-5" />
                      Get Directions
                    </a>
                  </Button>
                </div>

                {/* Visual Side */}
                <div className={`relative min-h-[400px] md:min-h-[600px] ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }} />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <MapPin className="h-16 w-16 md:h-20 md:w-20 text-pink-600" />
                      </div>
                      
                      <h4 className="text-2xl md:text-3xl font-medium text-gray-800 mb-4 text-center">
                        {venue.name}
                      </h4>
                      
                      <address className="text-center text-gray-600 mb-8 not-italic max-w-md leading-relaxed">
                        {venue.address}
                      </address>

                      <Button 
                        asChild 
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-pink-200 hover:border-pink-300 text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <a
                          href={getDirectionsUrl(venue)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <ExternalLink className="h-5 w-5" />
                          Open in Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
