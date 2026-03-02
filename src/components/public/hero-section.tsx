'use client'

import { Heart, Calendar, ChevronDown, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatedHeart } from './animated-heart'

interface HeroSectionProps {
  couple: {
    partner1_name: string
    partner2_name: string
    wedding_date: string | null
  }
  coupleIntro: string
  availableSections: {
    events: boolean
    venues: boolean
    timeline: boolean
    photos: boolean
    gifts: boolean
  }
}

export function HeroSection({ couple, coupleIntro, availableSections }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const formatWeddingDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const firstAvailableSection = Object.entries(availableSections).find(([_, available]) => available)?.[0]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Animated Heart - travels with scroll */}
      <AnimatedHeart
        partner1={couple.partner1_name}
        partner2={couple.partner2_name}
      />

      {/* Content */}
      <div className={`relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Couple Names */}
        <h1 className="mb-6 md:mb-8">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 mb-4 animate-fade-in">
            {couple.partner1_name}
          </span>
          <span className="block text-3xl p-10 sm:text-4xl md:text-5xl lg:text-6xl text-gray-300 font-light my-4">&</span>
          <span className="block text-4xl p-10 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {couple.partner2_name}
          </span>
        </h1>

        {/* Decorative Line */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
          <Sparkles className="h-5 w-5 text-pink-400 animate-pulse" />
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        </div>

        {/* Wedding Date */}
        {couple.wedding_date && (
          <div className="mb-8 md:mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white/70 backdrop-blur-md rounded-full shadow-lg border border-white/50 hover:shadow-xl transition-shadow duration-300">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-pink-500 mr-3" />
              <time dateTime={couple.wedding_date} className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium">
                {formatWeddingDate(couple.wedding_date)}
              </time>
            </div>
          </div>
        )}

        {/* Couple Introduction */}
        {coupleIntro && (
          <div className="max-w-4xl mx-auto mb-12 md:mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/50">
              <blockquote className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed font-light italic">
                "{coupleIntro}"
              </blockquote>
            </div>
          </div>
        )}

        {/* Scroll Indicator */}
        {firstAvailableSection && (
          <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <a
              href={`#${firstAvailableSection}`}
              className="inline-flex flex-col items-center text-gray-600 hover:text-pink-600 transition-colors duration-300 group"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(firstAvailableSection)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span className="text-sm md:text-base font-medium mb-2">Explore Our Story</span>
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  )
}
