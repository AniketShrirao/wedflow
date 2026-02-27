'use client'

import { HeroSection } from './hero-section'
import { EventsCarousel } from './events-carousel'
import { VenueCarouselSection } from './venue-carousel-section'
import { TimelineSection } from './timeline-section'
import { FeaturedPlaylistSection } from './featured-playlist-section'
import { PhotoGallerySection } from './photo-gallery-section'
import { PhotoUploadSection } from './photo-upload-section'
import { GiftPortalSection } from './gift-portal-section'
import { PublicFooter } from './footer'
import { FloatingNav } from './floating-nav'
import { PublicSiteErrorBoundary } from '@/components/error-boundary/public-site-error-boundary'
import { EventsFallback, PhotosFallback, GiftsFallback } from '@/components/loading/loading-states'
import { checkPublicDataIntegrity, hasSufficientData } from '@/lib/data/integrity-checker'
import { ValidationErrorDisplay } from '@/components/validation/validation-error'

interface PublicWeddingSiteProps {
  data: {
    couple: {
      id: string
      partner1_name: string
      partner2_name: string
      wedding_date: string | null
      couple_slug: string
    }
    events: {
      couple_intro: string
      events: any[]
      venues: any[]
      timeline: any[]
    }
    photos: {
      categories: any[]
      highlight_photos: any[]
    } | null
    gifts: {
      upi_id: string | null
      qr_code_url: string | null
      custom_message: string | null
    } | null
    playlists: {
      playlists: any[]
    } | null
    _validation?: {
      warnings: Array<{
        field: string
        message: string
        suggestion?: string
      }>
    }
  }
}

export function PublicWeddingSite({ data }: PublicWeddingSiteProps) {
  const { couple, events, gifts, playlists, _validation } = data

  // Check data integrity
  checkPublicDataIntegrity(data)
  
  // Determine which sections have sufficient data
  const hasEvents = hasSufficientData(data, 'events')
  const hasVenues = hasSufficientData(data, 'venues')
  const hasTimeline = hasSufficientData(data, 'timeline')
  const hasPhotos = hasSufficientData(data, 'photos')
  const hasGifts = hasSufficientData(data, 'gifts')

  return (
    <PublicSiteErrorBoundary>
      <div className="min-h-screen scroll-smooth">
        {/* Show validation warnings if any */}
        {_validation?.warnings && _validation.warnings.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="max-w-6xl mx-auto">
              <ValidationErrorDisplay 
                errors={[]}
                warnings={_validation.warnings}
                className="mb-0"
              />
            </div>
          </div>
        )}

        {/* Floating Navigation - Pass available sections */}
        <FloatingNav 
          availableSections={{
            events: hasEvents,
            venues: hasVenues,
            timeline: hasTimeline,
            photos: hasPhotos,
            gifts: hasGifts
          }}
        />
        
        {/* Hero Section */}
        <PublicSiteErrorBoundary fallback={<div className="h-screen bg-gray-100 flex items-center justify-center">Hero section unavailable</div>}>
          <section id="hero">
            <HeroSection 
              couple={couple}
              coupleIntro={events.couple_intro || "We are excited to share our special day with you. Join us as we begin our journey together as one."}
              availableSections={{
                events: hasEvents,
                venues: hasVenues,
                timeline: hasTimeline,
                photos: hasPhotos,
                gifts: hasGifts
              }}
            />
          </section>
        </PublicSiteErrorBoundary>

        {/* Events Section */}
        <PublicSiteErrorBoundary fallback={<EventsFallback />}>
          <section id="events">
            {hasEvents ? (
              <EventsCarousel events={events.events} />
            ) : (
              <EventsFallback />
            )}
          </section>
        </PublicSiteErrorBoundary>

        {/* Venue Carousel Section - Only show if there are venues */}
        {hasVenues && (
          <PublicSiteErrorBoundary>
            <section id="venues">
              <VenueCarouselSection venues={events.venues} />
            </section>
          </PublicSiteErrorBoundary>
        )}

        {/* Timeline Section - Only show if there's a timeline */}
        {hasTimeline && (
          <PublicSiteErrorBoundary>
            <section id="timeline">
              <TimelineSection timeline={events.timeline} />
            </section>
          </PublicSiteErrorBoundary>
        )}

        {/* Featured Playlist Section - Only show if there are playlists */}
        {playlists?.playlists && playlists.playlists.length > 0 && (
          <PublicSiteErrorBoundary>
            <section id="playlist">
              <FeaturedPlaylistSection 
                playlists={playlists.playlists} 
                coupleSlug={couple.couple_slug}
              />
            </section>
          </PublicSiteErrorBoundary>
        )}

        {/* Photo Gallery Section */}
        <PublicSiteErrorBoundary fallback={<PhotosFallback />}>
          <section id="photos">
            <PhotoGallerySection coupleSlug={couple.couple_slug} />
          </section>
        </PublicSiteErrorBoundary>

        {/* Photo Upload Section */}
        <PublicSiteErrorBoundary>
          <section id="photo-upload">
            <PhotoUploadSection coupleSlug={couple.couple_slug} coupleId={couple.id} />
          </section>
        </PublicSiteErrorBoundary>

        {/* Gift Portal Section */}
        <PublicSiteErrorBoundary fallback={<GiftsFallback />}>
          <section id="gifts">
            {hasGifts && gifts ? (
              <GiftPortalSection gifts={gifts} />
            ) : (
              <GiftsFallback />
            )}
          </section>
        </PublicSiteErrorBoundary>

        {/* Footer */}
        <PublicSiteErrorBoundary>
          <PublicFooter couple={couple} />
        </PublicSiteErrorBoundary>
      </div>
    </PublicSiteErrorBoundary>
  )
}