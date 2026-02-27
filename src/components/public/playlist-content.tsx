'use client'

import { useState } from 'react'
import { Music, Play, X, Plus, Send, Heart } from 'lucide-react'
import { Playlist, PlaylistTrack } from '@/lib/types/playlist'

interface PlaylistContentProps {
  playlists: Playlist[]
  coupleId: string
}

export function PlaylistContent({ playlists, coupleId }: PlaylistContentProps) {
  const [nowPlaying, setNowPlaying] = useState<PlaylistTrack | null>(null)
  const [showSuggestForm, setShowSuggestForm] = useState(false)
  const [suggestionData, setSuggestionData] = useState({
    songTitle: '',
    artistName: '',
    youtubeUrl: '',
    suggestedBy: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const getUrlType = (url: string): 'youtube' | 'drive' | 'mp3' | 'unknown' => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        return 'youtube'
      }
      if (urlObj.hostname.includes('drive.google.com')) {
        if (url.includes('/folders/')) return 'unknown'
        return 'drive'
      }
      if (url.endsWith('.mp3') || urlObj.hostname.includes('storage') || urlObj.hostname.includes('cdn')) {
        return 'mp3'
      }
    } catch {
      return 'unknown'
    }
    return 'unknown'
  }

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      return urlObj.searchParams.get('v') || null
    } catch {
      return null
    }
  }

  const handlePlayTrack = (track: PlaylistTrack) => {
    setNowPlaying(track)
  }

  const handleSuggestSong = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/playlists/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId,
          ...suggestionData,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setShowSuggestForm(false)
      } else {
        alert('Failed to submit suggestion. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      alert('Failed to submit suggestion. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {playlists.length === 0 ? (
        <div className="playlist-page__empty-state">
          <Music className="playlist-page__empty-icon" />
          <h2 className="playlist-page__empty-title">No Playlists Yet</h2>
          <p className="playlist-page__empty-text">
            Playlists will appear here once they are created
          </p>
        </div>
      ) : (
        playlists.map((playlist: Playlist) => (
          <div key={playlist.id} className="playlist-page__playlist-section">
            <h2 className="playlist-page__playlist-title">{playlist.name}</h2>
            {playlist.description && (
              <p className="playlist-page__playlist-description">{playlist.description}</p>
            )}
            <p className="playlist-page__playlist-count">
              {(playlist.tracks || []).length} songs
            </p>

            {(playlist.tracks || []).length === 0 ? (
              <div className="playlist-page__empty-playlist">
                <p>No tracks in this playlist yet</p>
              </div>
            ) : (
              <div className="playlist-page__tracks-list">
                {(playlist.tracks || []).map((track: PlaylistTrack, index: number) => (
                  <div key={track.id} className="playlist-page__track-row">
                    <div className="playlist-page__track-number">{index + 1}</div>

                    <div className="playlist-page__track-details">
                      <h3 className="playlist-page__track-title">{track.title}</h3>
                      <p className="playlist-page__track-artist">{track.artist}</p>
                    </div>

                    <div className="playlist-page__track-duration">{track.duration}</div>

                    <button
                      onClick={() => handlePlayTrack(track)}
                      className="playlist-page__play-button"
                      title={`Play ${track.title}`}
                      aria-label={`Play ${track.title}`}
                    >
                      <Play className="playlist-page__play-icon" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Suggest a Song Section */}
      <div className="playlist-page__suggest-section">
        <div className="playlist-page__suggest-header">
          <Heart className="playlist-page__suggest-icon" />
          <h3 className="playlist-page__suggest-title">Suggest a Song</h3>
          <p className="playlist-page__suggest-subtitle">
            Help us create the perfect playlist for our special day!
          </p>
        </div>

        {submitted ? (
          <div className="playlist-page__suggest-success">
            <Heart className="playlist-page__success-icon" />
            <p>Thank you for your suggestion! The couple will review it.</p>
            <button 
              onClick={() => {
                setSubmitted(false)
                setSuggestionData({ songTitle: '', artistName: '', youtubeUrl: '', suggestedBy: '', message: '' })
              }}
              className="playlist-page__suggest-another"
            >
              Suggest Another Song
            </button>
          </div>
        ) : showSuggestForm ? (
          <form onSubmit={handleSuggestSong} className="playlist-page__suggest-form">
            <div className="playlist-page__suggest-form-group">
              <input
                type="text"
                placeholder="Song Title *"
                value={suggestionData.songTitle}
                onChange={(e) => setSuggestionData({ ...suggestionData, songTitle: e.target.value })}
                className="playlist-page__suggest-input"
                required
              />
            </div>
            <div className="playlist-page__suggest-form-group">
              <input
                type="text"
                placeholder="Artist Name"
                value={suggestionData.artistName}
                onChange={(e) => setSuggestionData({ ...suggestionData, artistName: e.target.value })}
                className="playlist-page__suggest-input"
              />
            </div>
            <div className="playlist-page__suggest-form-group">
              <input
                type="url"
                placeholder="YouTube URL (optional)"
                value={suggestionData.youtubeUrl}
                onChange={(e) => setSuggestionData({ ...suggestionData, youtubeUrl: e.target.value })}
                className="playlist-page__suggest-input"
              />
            </div>
            <div className="playlist-page__suggest-form-group">
              <input
                type="text"
                placeholder="Your Name *"
                value={suggestionData.suggestedBy}
                onChange={(e) => setSuggestionData({ ...suggestionData, suggestedBy: e.target.value })}
                className="playlist-page__suggest-input"
                required
              />
            </div>
            <div className="playlist-page__suggest-form-group">
              <textarea
                placeholder="Why do you love this song? (optional)"
                value={suggestionData.message}
                onChange={(e) => setSuggestionData({ ...suggestionData, message: e.target.value })}
                className="playlist-page__suggest-textarea"
                rows={3}
              />
            </div>
            <div className="playlist-page__suggest-actions">
              <button 
                type="submit" 
                className="playlist-page__suggest-submit"
                disabled={submitting}
              >
                <Send className="playlist-page__suggest-submit-icon" />
                {submitting ? 'Sending...' : 'Send Suggestion'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowSuggestForm(false)}
                className="playlist-page__suggest-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setShowSuggestForm(true)}
            className="playlist-page__suggest-button"
          >
            <Plus className="playlist-page__suggest-button-icon" />
            Suggest a Song
          </button>
        )}
      </div>

      {/* Player Modal */}
      {nowPlaying && (
        <div 
          className="playlist-page__player-modal"
          onClick={() => setNowPlaying(null)}
        >
          <div 
            className="playlist-page__player-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setNowPlaying(null)}
              className="playlist-page__player-close"
              title="Close player"
            >
              <X className="playlist-page__player-close-icon" />
            </button>
            <div className="playlist-page__player-info">
              <h3 className="playlist-page__player-title">{nowPlaying.title}</h3>
              <p className="playlist-page__player-artist">{nowPlaying.artist}</p>
            </div>
            <div className="playlist-page__player-embed">
              {(() => {
                const url = nowPlaying.youtubeUrl || ''
                const urlType = getUrlType(url)
                
                if (urlType === 'youtube') {
                  return (
                    <iframe
                      key={nowPlaying.id}
                      width="100%"
                      height="400"
                      src={`https://www.youtube.com/embed/${extractVideoId(url)}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                      title={nowPlaying.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                } else if (urlType === 'drive') {
                  const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
                  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
                  return (
                    <div className="playlist-page__drive-player">
                      <iframe
                        key={nowPlaying.id}
                        width="100%"
                        height="300"
                        src={`https://drive.google.com/file/d/${fileId}/preview`}
                        title={nowPlaying.title}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                      <a 
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="playlist-page__download-button"
                      >
                        Download Audio
                      </a>
                    </div>
                  )
                } else {
                  return (
                    <audio
                      key={nowPlaying.id}
                      controls
                      autoPlay
                      style={{ width: '100%', height: '60px' }}
                    >
                      <source src={url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
