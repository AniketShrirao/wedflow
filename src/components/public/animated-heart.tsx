'use client'

import { useEffect, useState } from 'react'
import { EasterEggPhoto } from './easter-egg-photo'

interface AnimatedHeartProps {
  partner1: string
  partner2: string
}

export function AnimatedHeart({ partner1, partner2 }: AnimatedHeartProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = 1200 // Maximum scroll distance to track
      const progress = Math.min(scrolled / maxScroll, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate scale based on scroll (1 to 0.05) - very small when fixed
  const baseScale = scrollProgress < 0.5 
    ? 1 - (scrollProgress * 1.9) // 1.0 -> 0.05
    : 0.05 // Stay at 0.05 after 50% scroll
  
  // On hover/touch, scale up to 0.5 when fixed (0.7 on mobile for easier touch)
  const hoverScale = isMobile ? 0.7 : 0.5
  const scale = isHovered && scrollProgress >= 0.5 ? hoverScale : baseScale
  
  // Calculate position - move to left at 25%
  const translateX = scrollProgress * -25 // Move to 25% from left (vw)
  const translateY = scrollProgress * -15 // Move up slightly (vh)
  
  // Calculate top position - starts at 20%, ends at 50% (20% on mobile)
  const endTop = isMobile ? 20 : 50
  const topPosition = `${20 + (scrollProgress * (endTop - 20))}%`

  // Calculate left position - starts at 50%, ends at 25% (38% on mobile)
  const endLeft = isMobile ? 38 : 28
  const leftPosition = `${50 - (scrollProgress * (50 - endLeft))}%`
  
  // Show/hide based on scroll - show after 50px scroll
  const opacity = scrollProgress > 0.04 ? 1 : 0
  
  // Container size - smaller on mobile
  const containerSize = isMobile ? '180px' : '250px'

  const handleHeartClick = () => {
    setShowEasterEgg(true)
  }

  return (
    <>
      <div 
        className="fixed pointer-events-none"
        style={{
          top: topPosition,
          left: leftPosition,
          width: containerSize,
          height: containerSize,
          transform: `translate(-50%, -50%) translateX(${translateX}vw) translateY(${translateY}vh) scale(${scale})`,
          transition: 'all 0.3s ease-out',
          opacity: opacity,
          zIndex: 50,
          willChange: 'transform, opacity, top',
        }}
      >
        {/* SVG Heart with Animation */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full pointer-events-auto cursor-pointer transition-all duration-300"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(236, 72, 153, 0.3))' }}
          onClick={handleHeartClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="button"
          aria-label="Click for a surprise!"
        >
        <defs>
          {/* Gradient for the heart */}
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 1 }}>
              <animate
                attributeName="stop-color"
                values="#ec4899; #f43f5e; #ec4899"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" style={{ stopColor: '#f43f5e', stopOpacity: 1 }}>
              <animate
                attributeName="stop-color"
                values="#f43f5e; #ec4899; #f43f5e"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Clip path for text */}
          <clipPath id="heartClip">
            <path d="M100,170 C20,120 20,70 50,50 C70,35 90,40 100,60 C110,40 130,35 150,50 C180,70 180,120 100,170 Z" />
          </clipPath>
        </defs>

        {/* Animated heart shape */}
        <path
          d="M100,170 C20,120 20,70 50,50 C70,35 90,40 100,60 C110,40 130,35 150,50 C180,70 180,120 100,170 Z"
          fill="url(#heartGradient)"
          filter="url(#glow)"
          className="heart-path"
        >
          {/* Pulse animation */}
          <animate
            attributeName="d"
            values="
              M100,170 C20,120 20,70 50,50 C70,35 90,40 100,60 C110,40 130,35 150,50 C180,70 180,120 100,170 Z;
              M100,175 C15,125 15,65 50,45 C70,30 90,35 100,55 C110,35 130,30 150,45 C185,65 185,125 100,175 Z;
              M100,170 C20,120 20,70 50,50 C70,35 90,40 100,60 C110,40 130,35 150,50 C180,70 180,120 100,170 Z
            "
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Sparkles around the heart */}
        <g className="sparkles">
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const radius = 85
            const x = 100 + radius * Math.cos(angle)
            const y = 100 + radius * Math.sin(angle)
            
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#fbbf24"
                opacity="0"
              >
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="2s"
                  begin={`${i * 0.25}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="1;3;1"
                  dur="2s"
                  begin={`${i * 0.25}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )
          })}
        </g>

        {/* Initials inside the heart - side by side with & */}
        <g clipPath="url(#heartClip)">
          {/* Partner 1 initial - left */}
          <text
            x="70"
            y="110"
            textAnchor="middle"
            style={{
              fontSize: '26px',
              fontWeight: '700',
              fill: 'white',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {partner1.charAt(0)}
          </text>
          
          {/* Ampersand - center */}
          <text
            x="100"
            y="110"
            textAnchor="middle"
            style={{
              fontSize: '20px',
              fontWeight: '300',
              fill: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'Georgia, serif',
            }}
          >
            &
          </text>
          
          {/* Partner 2 initial - right */}
          <text
            x="130"
            y="110"
            textAnchor="middle"
            style={{
              fontSize: '26px',
              fontWeight: '700',
              fill: 'white',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {partner2.charAt(0)}
          </text>
        </g>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <circle
            key={`particle-${i}`}
            cx={50 + i * 20}
            cy="180"
            r="1.5"
            fill="#fbbf24"
            opacity="0.6"
          >
            <animate
              attributeName="cy"
              values="180;20;180"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      </div>

      {/* Easter Egg Photo Modal */}
      <EasterEggPhoto 
        isOpen={showEasterEgg}
        onClose={() => setShowEasterEgg(false)}
      />
    </>
  )
}
