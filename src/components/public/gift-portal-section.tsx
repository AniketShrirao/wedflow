'use client'

import { Gift, Heart, Copy, Check, Smartphone, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface GiftPortalSectionProps {
  gifts: {
    upi_id: string | null
    qr_code_url: string | null
    custom_message: string | null
  }
}

export function GiftPortalSection({ gifts }: GiftPortalSectionProps) {
  const [copied, setCopied] = useState(false)

  const copyUpiId = async () => {
    if (!gifts.upi_id) return
    
    try {
      await navigator.clipboard.writeText(gifts.upi_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-8 shadow-2xl">
            <Gift className="h-10 w-10 text-pink-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 mb-6">
            Bless Us With Your Gifts
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mb-8" />
          
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
              "{gifts.custom_message || 'Your presence is the greatest gift, but if you wish to bless us with something more, we would be grateful for your contribution to our new journey together.'}"
            </blockquote>
          </div>
        </div>

        {/* Gift Portal Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* QR Code Side */}
              {gifts.qr_code_url && (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                    <div className="relative p-6 bg-white rounded-3xl shadow-xl">
                      <img
                        src={gifts.qr_code_url}
                        alt="UPI QR Code"
                        className="w-64 h-64 rounded-2xl"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-gray-600">
                    <QrCode className="h-5 w-5" />
                    <span className="font-medium">Scan to Pay</span>
                  </div>
                </div>
              )}

              {/* UPI ID Side */}
              <div className="flex flex-col justify-center">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-800">
                      UPI Payment
                    </h3>
                  </div>
                  
                  {gifts.upi_id && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <code className="flex-1 font-mono text-lg text-gray-800">
                          {gifts.upi_id}
                        </code>
                        <button
                          onClick={copyUpiId}
                          className="w-10 h-10 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        >
                          {copied ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                      {copied && (
                        <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          UPI ID copied to clipboard!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500 fill-current" />
                    How to send a gift
                  </h4>
                  
                  <ol className="space-y-3">
                    {[
                      'Open any UPI app (GPay, PhonePe, Paytm)',
                      'Scan QR code or enter UPI ID',
                      'Enter amount and complete payment'
                    ].map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-lg">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mt-12 text-center">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto border border-white/50 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-pink-500 fill-current animate-pulse" />
                <Heart className="h-4 w-4 text-purple-500 fill-current animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Heart className="h-6 w-6 text-pink-500 fill-current animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                "Your love and blessings mean the world to us. Thank you for being part of our special day!"
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
