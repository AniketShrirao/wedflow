import { Music, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Playlist, PlaylistTrack } from '@/lib/types/playlist'
import { PlaylistContent } from '@/components/public/playlist-content'
import '@/styles/pages/playlist-page.scss'

async function getPlaylistsForCouple(coupleSlug: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    // First, get couple ID from slug
    const coupleRes = await fetch(
      `${baseUrl}/api/public/${coupleSlug}`,
      { cache: 'no-store' }
    )
    
    if (!coupleRes.ok) {
      console.error('Couple fetch failed:', coupleRes.status)
      throw new Error('Couple not found')
    }

    const coupleData = await coupleRes.json()
    const coupleId = coupleData.couple.id

    // Then fetch playlists for this couple
    const playlistRes = await fetch(
      `${baseUrl}/api/playlists?coupleId=${coupleId}`,
      { cache: 'no-store' }
    )

    if (!playlistRes.ok) {
      console.error('Playlists fetch failed:', playlistRes.status)
      throw new Error('Failed to fetch playlists')
    }

    const playlists = await playlistRes.json()
    return { playlists, coupleId }
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return { playlists: [], coupleId: '' }
  }
}

export default async function PlaylistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { playlists, coupleId } = await getPlaylistsForCouple(slug)
  
  const allTracks = playlists.flatMap((playlist: Playlist) => 
    (playlist.tracks || []).map((track: PlaylistTrack) => ({
      ...track,
      playlistName: playlist.name,
      playlistId: playlist.id
    }))
  )

  return (
    <div className="playlist-page">
      {/* Header */}
      <div className="playlist-page__header">
        <div className="playlist-page__container">
          <Link href={`/${slug}`} className="playlist-page__back-button">
            <ArrowLeft className="playlist-page__back-icon" />
            Back to Wedding
          </Link>

          <div className="playlist-page__title-section">
            <div className="playlist-page__icon-wrapper">
              <Music className="playlist-page__icon" />
            </div>
            <h1 className="playlist-page__title">Wedding Playlist</h1>
            <p className="playlist-page__subtitle">
              All songs curated for our special day
            </p>
          </div>

          <div className="playlist-page__stats">
            <div className="playlist-page__stat">
              <span className="playlist-page__stat-label">Total Tracks</span>
              <span className="playlist-page__stat-value">{allTracks.length}</span>
            </div>
            <div className="playlist-page__stat">
              <span className="playlist-page__stat-label">Playlists</span>
              <span className="playlist-page__stat-value">{playlists.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Playlists */}
      <div className="playlist-page__content">
        <div className="playlist-page__container">
          <PlaylistContent playlists={playlists} coupleId={coupleId} />
        </div>
      </div>
    </div>
  )
}
