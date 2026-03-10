'use client'

import { Heart } from 'lucide-react'

interface PublicFooterProps {
  couple: {
    partner1_name: string
    partner2_name: string
    couple_slug: string
  }
}

export function PublicFooter({ couple }: PublicFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className="text-white py-16 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, var(--color-neutral-900) 0%, var(--color-neutral-800) 50%, var(--color-neutral-900) 100%)'
      }}
      role="contentinfo"
      aria-labelledby="footer-heading"
    >
      {/* Background Elements - Decorative only */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl respect-motion-preference"
        style={{ backgroundColor: 'var(--color-primary-500)', opacity: 0.05 }}
        aria-hidden="true"
      ></div>
      <div 
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl respect-motion-preference"
        style={{ backgroundColor: 'var(--color-accent-500)', opacity: 0.05 }}
        aria-hidden="true"
      ></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Enhanced Couple Names with Accessibility */}
          <header className="mb-8">
            <h2 
              id="footer-heading"
              className="sr-only"
            >
              Wedding website footer for {couple.partner1_name} and {couple.partner2_name}
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span 
                className="text-2xl sm:text-3xl font-light bg-clip-text text-transparent"
                style={{ 
                  fontFamily: 'var(--font-family-heading)',
                  background: 'linear-gradient(90deg, var(--color-primary-400) 0%, var(--color-error-400) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {couple.partner1_name}
              </span>
              <div className="relative" aria-hidden="true">
                <Heart 
                  className="h-8 w-8 fill-current respect-motion-preference animate-pulse" 
                  style={{ color: 'var(--color-error-400)' }}
                />
                <div 
                  className="absolute inset-0 h-8 w-8 fill-current respect-motion-preference animate-ping"
                  style={{ color: 'var(--color-error-400)', opacity: 0.3 }}
                ></div>
              </div>
              <span 
                className="text-2xl sm:text-3xl font-light bg-clip-text text-transparent"
                style={{ 
                  fontFamily: 'var(--font-family-heading)',
                  background: 'linear-gradient(90deg, var(--color-accent-400) 0%, var(--color-info-400) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {couple.partner2_name}
              </span>
            </div>
            <div 
              className="w-32 h-0.5 mx-auto rounded-full"
              style={{ 
                background: 'linear-gradient(90deg, var(--color-primary-400) 0%, var(--color-accent-400) 50%, var(--color-info-400) 100%)'
              }}
              aria-hidden="true"
            ></div>
          </header>

          {/* Enhanced Thank You Message */}
          <div className="mb-10">
            <p 
              className="text-lg leading-relaxed max-w-3xl mx-auto"
              style={{ color: 'var(--color-neutral-300)' }}
            >
              Thank you for visiting our wedding website and being part of our special journey. 
              Your love and support mean everything to us.
            </p>
          </div>

          {/* Enhanced Decorative Divider with Motion Respect */}
          <div className="flex justify-center items-center space-x-6 mb-10" aria-hidden="true">
            <div 
              className="w-16 h-px"
              style={{ 
                background: 'linear-gradient(90deg, transparent 0%, var(--color-primary-400) 100%)'
              }}
            ></div>
            <div className="flex space-x-2">
              <div 
                className="w-3 h-3 rounded-full shadow-lg respect-motion-preference animate-pulse"
                style={{ backgroundColor: 'var(--color-primary-400)' }}
              ></div>
              <div 
                className="w-2 h-2 rounded-full shadow-lg respect-motion-preference animate-pulse" 
                style={{ 
                  backgroundColor: 'var(--color-accent-400)',
                  animationDelay: '0.5s' 
                }}
              ></div>
              <div 
                className="w-4 h-4 rounded-full shadow-lg respect-motion-preference animate-pulse" 
                style={{ 
                  background: 'linear-gradient(90deg, var(--color-primary-400) 0%, var(--color-accent-400) 100%)',
                  animationDelay: '1s' 
                }}
              ></div>
              <div 
                className="w-2 h-2 rounded-full shadow-lg respect-motion-preference animate-pulse" 
                style={{ 
                  backgroundColor: 'var(--color-accent-400)',
                  animationDelay: '1.5s' 
                }}
              ></div>
              <div 
                className="w-3 h-3 rounded-full shadow-lg respect-motion-preference animate-pulse" 
                style={{ 
                  backgroundColor: 'var(--color-primary-400)',
                  animationDelay: '2s' 
                }}
              ></div>
            </div>
            <div 
              className="w-16 h-px"
              style={{ 
                background: 'linear-gradient(90deg, var(--color-accent-400) 0%, transparent 100%)'
              }}
            ></div>
          </div>

          {/* Enhanced Powered By with Proper Navigation Landmarks */}
          <nav 
            className="text-gray-400"
            aria-label="Website information and credits"
          >
            <div 
              className="backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <p className="mb-2 text-lg">
                Wedding website created with{' '}
                <Heart 
                  className="inline h-4 w-4 fill-current mx-1 respect-motion-preference animate-pulse" 
                  style={{ color: 'var(--color-error-400)' }}
                  aria-label="love"
                />
                using{' '}
                <a 
                  href="https://wedflow.com" 
                  className="font-semibold focus-visible respect-motion-preference transition-all duration-300 bg-clip-text text-transparent"
                  style={{ 
                    background: 'linear-gradient(90deg, var(--color-primary-400) 0%, var(--color-accent-400) 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Wedflow - Wedding website platform (opens in new tab)"
                >
                  Wedflow
                </a>
              </p>
              <p 
                className="text-sm"
                style={{ color: 'var(--color-neutral-500)' }}
              >
                © {currentYear} All rights reserved
              </p>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  )
}