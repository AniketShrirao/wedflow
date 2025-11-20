'use client'

import { Calendar, Clock, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { EventItem } from '@/lib/types/events'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface EventsCarouselProps {
  events: EventItem[]
}

export function EventsCarousel({ events }: EventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date)
    } catch {
      return 'Date to be announced'
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10))
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)
    } catch {
      return 'Time to be announced'
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
  }

  useEffect(() => {
    if (!isAutoPlaying || events.length <= 1) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, events.length])

  if (!events || events.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-6 shadow-lg">
            <Calendar className="h-8 w-8 md:h-10 md:w-10 text-pink-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Wedding Events
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in celebrating our special moments throughout our wedding festivities
          </p>
        </div>

        {/* Carousel */}
        <div 
          ref={carouselRef}
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {events.map((event, index) => (
                <div key={event.id} className="w-full flex-shrink-0 px-2 md:px-4">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Event Details */}
                      <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold text-lg mb-6 shadow-lg">
                          {index + 1}
                        </div>
                        
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6 leading-tight">
                          {event.name}
                        </h3>

                        <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-6 w-6 text-pink-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 uppercase tracking-wide">Date</p>
                              <time dateTime={event.date} className="text-lg font-medium text-gray-800">
                                {formatDate(event.date)}
                              </time>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 uppercase tracking-wide">Time</p>
                              <time className="text-lg font-medium text-gray-800">
                                {formatTime(event.time)}
                              </time>
                            </div>
                          </div>
                        </div>

                        {event.description && (
                          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-l-4 border-pink-400">
                            <p className="text-gray-700 leading-relaxed italic">
                              {event.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Visual Side */}
                      <div className="relative min-h-[300px] md:min-h-[500px] bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center p-8">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          }} />
                        </div>
                        
                        <div className="relative text-center">
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <Calendar className="h-16 w-16 md:h-20 md:w-20 text-pink-600" />
                          </div>
                          <h4 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">
                            {event.name}
                          </h4>
                          <p className="text-gray-600">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {events.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-300 hover:scale-110 z-10"
                aria-label="Previous event"
              >
                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-300 hover:scale-110 z-10"
                aria-label="Next event"
              >
                <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {events.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 bg-gradient-to-r from-pink-500 to-purple-500' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to event ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
