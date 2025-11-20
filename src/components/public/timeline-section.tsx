'use client'

import { Clock } from 'lucide-react'
import { TimelineItem } from '@/lib/types/events'

interface TimelineSectionProps {
  timeline: TimelineItem[]
}

export function TimelineSection({ timeline }: TimelineSectionProps) {
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-6">
            <Clock className="h-8 w-8 text-pink-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-gray-800 mb-6">
            Wedding Timeline
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Here's the schedule of events for our special day
          </p>
        </div>

        {/* Enhanced Timeline */}
        <div className="relative">
          {/* Enhanced Timeline Line */}
          <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400 via-purple-400 to-pink-400 rounded-full shadow-sm"></div>

          {/* Timeline Items */}
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={item.id} className="relative flex items-start group">
                {/* Enhanced Timeline Dot */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-24 h-24 bg-white border-4 border-pink-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-pink-600" />
                    </div>
                  </div>
                  {/* Connecting line to content */}
                  <div className="absolute top-12 left-24 w-8 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400"></div>
                </div>

                {/* Enhanced Timeline Content */}
                <div className="ml-8 flex-1">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 group-hover:border-pink-200 group-hover:-translate-y-1">
                    {/* Time Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-semibold mb-4 shadow-md">
                      {formatTime(item.time)}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-serif font-medium text-gray-800 mb-4 group-hover:text-pink-600 transition-colors duration-300">
                      {item.title}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border-l-4 border-pink-300">
                        <p className="text-gray-700 leading-relaxed italic text-lg">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Decorative Element */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-12 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full group-hover:w-16 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Decorative Element */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-3 p-4 bg-white rounded-full shadow-lg border border-gray-100">
            <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-pulse shadow-sm"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-5 h-5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '1s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '1.5s' }}></div>
            <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}