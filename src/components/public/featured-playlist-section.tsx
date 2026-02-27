'use client'

import { useState } from 'react'
import { Music, Play, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import '@/styles/components/featured-playlist.scss'

interface PlaylistTrack {
  id: string
  title: string
  artist: string
  youtubeUrl: string
  duration: string
}

interface EventPlaylist {
  id: string
  name: string
  event_type: string
  tracks: PlaylistTrack[]
}

interface FeaturedPlaylistSectionProps {
  playlists: EventPlaylist[]
  coupleSlug: string
}

export function FeaturedPlaylistSection({ playlists, coupleSlug }: FeaturedPlaylistSectionProps) {
  const [activeTab, setActiveTab] = useState(0)

  if (!playlists || playlists.length === 0) return null

  const activePlaylist = playlists[activeTab]
  const featuredTracks = (activePlaylist.tracks || []).slice(0, 5)

  return (
    <section className="featured-playlist__section">
      <div className="featured-playlist__container">
        {/* Section Header */}
        <div className="featured-playlist__header">
          <div className="featured-playlist__icon-wrapper">
            <Music className="featured-playlist__icon" />
          </div>
          <h2 className="featured-playlist__title">Featured Playlist</h2>
          <div className="featured-playlist__divider" />
          <p className="featured-playlist__subtitle">
            Curated music for every moment of our celebration
          </p>
        </div>

        {/* Tabs */}
        <div className="featured-playlist__tabs">
          {playlists.map((playlist, index) => (
            <button
              key={playlist.id}
              onClick={() => setActiveTab(index)}
              className={`featured-playlist__tab ${
                index === activeTab ? 'featured-playlist__tab--active' : ''
              }`}
            >
              {playlist.name}
            </button>
          ))}
        </div>

        {/* Playlist Content */}
        <div className="featured-playlist__content">
          <div className="featured-playlist__playlist-header">
            <h3 className="featured-playlist__playlist-title">{activePlaylist.name}</h3>
            <p className="featured-playlist__track-count">
              {activePlaylist.tracks?.length || 0} songs
            </p>
          </div>

          {/* Featured Tracks */}
          <div className="featured-playlist__tracks">
            {featuredTracks.map((track, index) => (
              <div key={track.id} className="featured-playlist__track-item">
                <div className="featured-playlist__track-number">{index + 1}</div>
                
                <div className="featured-playlist__track-info">
                  <h4 className="featured-playlist__track-title">{track.title}</h4>
                  <p className="featured-playlist__track-artist">{track.artist}</p>
                </div>

                <div className="featured-playlist__track-duration">{track.duration}</div>

                <a
                  href={track.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="featured-playlist__play-button"
                  title="Play on YouTube Music"
                  aria-label={`Play ${track.title}`}
                >
                  <Play className="featured-playlist__play-icon" />
                </a>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="featured-playlist__footer">
            <Button asChild className="featured-playlist__view-all-button">
              <Link href={`/public/${coupleSlug}/playlist`}>
                View All Tracks
                <ArrowRight className="featured-playlist__arrow-icon" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
