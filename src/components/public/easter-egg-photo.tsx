'use client'

import { useEffect, useState } from 'react'
import { X, Heart } from 'lucide-react'

interface EasterEggPhotoProps {
  isOpen: boolean
  onClose: () => void
}

export function EasterEggPhoto({ isOpen, onClose }: EasterEggPhotoProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 300)
  }

  if (!isOpen) return null

  // Placeholder photos - replace with actual couple photos
  const photos = [
    { id: 1, color: 'from-pink-200 to-rose-300', emoji: '💕' },
    { id: 2, color: 'from-purple-200 to-indigo-300', emoji: '💑' },
    { id: 3, color: 'from-blue-200 to-cyan-300', emoji: '💖' },
    { id: 4, color: 'from-green-200 to-emerald-300', emoji: '💗' },
    { id: 5, color: 'from-yellow-200 to-orange-300', emoji: '💝' },
  ]

  const randomPhoto = photos[Math.floor(Math.random() * photos.length)]

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Photo Card */}
      <div 
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-[101] w-full max-w-md transition-all duration-500 ease-out ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl p-6 mx-4 mb-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500 fill-current animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-800">
                You found a secret! 💫
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Photo Placeholder */}
          <div className={`relative aspect-[4/3] rounded-2xl bg-gradient-to-br ${randomPhoto.color} overflow-hidden mb-4 shadow-lg`}>
            {/* Placeholder content - replace with actual photo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-bounce">
                  {randomPhoto.emoji}
                </div>
                <p className="text-gray-700 font-medium text-lg">
                  A special moment
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  (Photo placeholder)
                </p>
              </div>
            </div>

            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s',
                }}
              />
            ))}
          </div>

          {/* Message */}
          <div className="text-center">
            <p className="text-gray-600 text-sm leading-relaxed">
              Thanks for exploring! Here's a special moment from our journey together. 
              Click the heart anytime to see more surprises! ✨
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
