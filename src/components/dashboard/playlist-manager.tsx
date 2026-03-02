'use client'

import { useState, useEffect } from 'react'
import { Music, Plus, Trash2, Play, X, Check, XCircle, Heart } from 'lucide-react'
import { DownloadButtons } from '@/components/guests/download-buttons'
import { Playlist } from '@/lib/types/playlist'
import { Button } from '@/components/ui/button'
import '@/styles/components/playlist-manager.scss'

interface SongSuggestion {
  id: string
  song_title: string
  artist_name: string | null
  youtube_url: string | null
  suggested_by: string
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface PlaylistManagerProps {
  coupleId: string
}

export function PlaylistManager({ coupleId }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [suggestions, setSuggestions] = useState<SongSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null)
  const [showTrackForm, setShowTrackForm] = useState<string | null>(null)
  const [nowPlaying, setNowPlaying] = useState<{ playlistId: string; trackId: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'playlists' | 'suggestions'>('playlists')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'predefined' as const,
    eventType: '',
  })
  const [trackFormData, setTrackFormData] = useState({
    title: '',
    youtubeUrl: '',
  })
  const [trackMetadata, setTrackMetadata] = useState({
    artist: '',
    duration: '',
  })
  const [fetchingMetadata, setFetchingMetadata] = useState(false)

  useEffect(() => {
    fetchPlaylists()
    fetchSuggestions()
  }, [coupleId])

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/playlists/suggestions?coupleId=${coupleId}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`/api/playlists?coupleId=${coupleId}`)
      if (res.ok) {
        const data = await res.json()
        console.log('Playlists fetched:', data)
        setPlaylists(data)
      } else {
        console.error('Failed to fetch playlists:', res.status)
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId,
          ...formData,
          tracks: [],
        }),
      })

      if (res.ok) {
        const newPlaylist = await res.json()
        setPlaylists([newPlaylist, ...playlists])
        setFormData({ name: '', description: '', type: 'predefined', eventType: '' })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return

    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setPlaylists(playlists.filter(p => p.id !== playlistId))
      }
    } catch (error) {
      console.error('Error deleting playlist:', error)
    }
  }

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      return urlObj.searchParams.get('v') || null
    } catch {
      return null
    }
  }

  const getUrlType = (url: string): 'youtube' | 'drive' | 'mp3' | 'unknown' => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        return 'youtube'
      }
      if (urlObj.hostname.includes('drive.google.com')) {
        // Check if it's a folder or file
        if (url.includes('/folders/')) {
          return 'unknown' // Folders can't be played directly
        }
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

  const fetchMetadata = async (url: string) => {
    const urlType = getUrlType(url)

    setFetchingMetadata(true)

    // Check for Google Drive folders
    if (url.includes('drive.google.com') && url.includes('/folders/')) {
      console.error('Google Drive folders cannot be played. Please use a direct file link.')
      setTrackMetadata({
        artist: 'Invalid: Use file link, not folder',
        duration: '0:00',
      })
      setFetchingMetadata(false)
      return
    }

    // Always set a default artist immediately so button isn't disabled
    setTrackMetadata({
      artist: 'Unknown Artist',
      duration: '0:00',
    })

    try {
      if (urlType === 'youtube') {
        const videoId = extractVideoId(url)
        if (!videoId) {
          console.error('Invalid YouTube URL')
          setFetchingMetadata(false)
          return
        }
        // Use backend API to fetch YouTube metadata
        const res = await fetch(`/api/youtube-metadata?videoId=${videoId}`)
        if (res.ok) {
          const data = await res.json()
          setTrackMetadata({
            artist: data.artist || 'Unknown Artist',
            duration: data.duration || '0:00',
          })
        }
      } else if (urlType === 'drive') {
        // For Google Drive, extract file ID and get metadata
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          const res = await fetch(`/api/drive-metadata?fileId=${fileId}`)
          if (res.ok) {
            const data = await res.json()
            setTrackMetadata({
              artist: data.artist || 'Unknown Artist',
              duration: data.duration || '0:00',
            })
          }
        }
      } else if (urlType === 'mp3') {
        // For direct MP3 URLs, try to extract metadata from headers
        const res = await fetch(`/api/audio-metadata?url=${encodeURIComponent(url)}`)
        if (res.ok) {
          const data = await res.json()
          setTrackMetadata({
            artist: data.artist || 'Unknown Artist',
            duration: data.duration || '0:00',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
    } finally {
      setFetchingMetadata(false)
    }
  }

  const handleAddTrack = async (playlistId: string, e: React.FormEvent) => {
    e.preventDefault()
    try {
      const trackData = {
        title: trackFormData.title,
        artist: trackMetadata.artist,
        youtubeUrl: trackFormData.youtubeUrl,
        duration: trackMetadata.duration,
      }

      const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
      })

      if (res.ok) {
        setTrackFormData({ title: '', youtubeUrl: '' })
        setTrackMetadata({ artist: '', duration: '' })
        setShowTrackForm(null)
        fetchPlaylists()
      }
    } catch (error) {
      console.error('Error adding track:', error)
    }
  }

  const handleDeleteTrack = async (playlistId: string, trackId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/tracks?trackId=${trackId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchPlaylists()
      }
    } catch (error) {
      console.error('Error deleting track:', error)
    }
  }

  const handlePlayTrack = (playlistId: string, trackId: string) => {
    setNowPlaying({ playlistId, trackId })
  }

  const getNowPlayingTrack = () => {
    if (!nowPlaying) return null
    const playlist = playlists.find(p => p.id === nowPlaying.playlistId)
    return playlist?.tracks.find(t => t.id === nowPlaying.trackId)
  }

  const handleApproveSuggestion = async (suggestion: SongSuggestion) => {
    try {
      // Find or create custom playlist
      let customPlaylist = playlists.find(p => p.type === 'custom')

      if (!customPlaylist) {
        // Create a custom playlist for guest suggestions
        const createRes = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coupleId,
            name: 'Guest Suggestions',
            description: 'Songs suggested by our guests',
            type: 'custom',
            tracks: [],
          }),
        })

        if (createRes.ok) {
          customPlaylist = await createRes.json()
          setPlaylists([...playlists, customPlaylist])
        } else {
          throw new Error('Failed to create custom playlist')
        }
      }

      // Add track to custom playlist
      const trackRes = await fetch(`/api/playlists/${customPlaylist.id}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestion.song_title,
          artist: suggestion.artist_name || 'Unknown Artist',
          youtubeUrl: suggestion.youtube_url || '',
          duration: '0:00',
        }),
      })

      if (trackRes.ok) {
        // Update suggestion status
        await fetch(`/api/playlists/suggestions/${suggestion.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        })

        fetchPlaylists()
        fetchSuggestions()
      }
    } catch (error) {
      console.error('Error approving suggestion:', error)
    }
  }

  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      await fetch(`/api/playlists/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      fetchSuggestions()
    } catch (error) {
      console.error('Error rejecting suggestion:', error)
    }
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending')

  if (loading) {
    return <div className="playlist-manager__loading">Loading playlists...</div>
  }

  return (
    <div className="playlist-manager">
      <div className="playlist-manager__header">
        <h2 className="playlist-manager__title">
          <Music className="playlist-manager__icon" />
          Playlist Manager
        </h2>
        <div className="playlist-manager__controls">
          <DownloadButtons resource="songs" />
          <Button
            onClick={() => setShowForm(!showForm)}
            className="playlist-manager__create-button"
          >
            <Plus className="playlist-manager__button-icon" />
            Create Playlist
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="playlist-manager__tabs">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`playlist-manager__tab ${activeTab === 'playlists' ? 'playlist-manager__tab--active' : ''}`}
        >
          Playlists ({playlists.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`playlist-manager__tab ${activeTab === 'suggestions' ? 'playlist-manager__tab--active' : ''}`}
        >
          <Heart className="playlist-manager__tab-icon" />
          Suggestions ({pendingSuggestions.length})
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePlaylist} className="playlist-manager__form">
          <div className="playlist-manager__form-group">
            <label className="playlist-manager__label">Playlist Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="playlist-manager__input"
              required
            />
          </div>

          <div className="playlist-manager__form-group">
            <label className="playlist-manager__label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="playlist-manager__textarea"
            />
          </div>

          <div className="playlist-manager__form-group">
            <label className="playlist-manager__label">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="playlist-manager__select"
            >
              <option value="predefined">Predefined</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {formData.type === 'predefined' && (
            <div className="playlist-manager__form-group">
              <label className="playlist-manager__label">Event Type</label>
              <input
                type="text"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="playlist-manager__input"
                placeholder="e.g., Ceremony, Reception"
              />
            </div>
          )}

          <div className="playlist-manager__form-actions">
            <Button type="submit" className="playlist-manager__submit-button">
              Create
            </Button>
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              className="playlist-manager__cancel-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'suggestions' && (
        <div className="playlist-manager__suggestions">
          {pendingSuggestions.length === 0 ? (
            <div className="playlist-manager__empty">
              <Heart className="playlist-manager__empty-icon" />
              <p>No pending song suggestions</p>
              <p className="playlist-manager__empty-hint">
                Guests can suggest songs from your wedding website
              </p>
            </div>
          ) : (
            pendingSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="playlist-manager__suggestion">
                <div className="playlist-manager__suggestion-info">
                  <h4 className="playlist-manager__suggestion-title">{suggestion.song_title}</h4>
                  {suggestion.artist_name && (
                    <p className="playlist-manager__suggestion-artist">{suggestion.artist_name}</p>
                  )}
                  <p className="playlist-manager__suggestion-by">
                    Suggested by <strong>{suggestion.suggested_by}</strong>
                  </p>
                  {suggestion.message && (
                    <p className="playlist-manager__suggestion-message">&quot;{suggestion.message}&quot;</p>
                  )}
                </div>
                <div className="playlist-manager__suggestion-actions">
                  <button
                    onClick={() => handleApproveSuggestion(suggestion)}
                    className="playlist-manager__suggestion-approve"
                    title="Approve and add to playlist"
                  >
                    <Check className="playlist-manager__suggestion-icon" />
                  </button>
                  <button
                    onClick={() => handleRejectSuggestion(suggestion.id)}
                    className="playlist-manager__suggestion-reject"
                    title="Reject suggestion"
                  >
                    <XCircle className="playlist-manager__suggestion-icon" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'playlists' && (
        <div className="playlist-manager__list">
          {playlists.length === 0 ? (
            <div className="playlist-manager__empty">
              <p>No playlists yet. Create one to get started!</p>
            </div>
          ) : (
            playlists.map((playlist) => (
              <div key={playlist.id} className="playlist-manager__item">
                <div className="playlist-manager__item-header">
                  <button
                    onClick={() => setExpandedPlaylist(expandedPlaylist === playlist.id ? null : playlist.id)}
                    className="playlist-manager__expand-button"
                  >
                    <h3 className="playlist-manager__item-title">{playlist.name}</h3>
                  </button>
                  <div className="playlist-manager__item-actions">
                    <button
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      className="playlist-manager__delete-button"
                      title="Delete playlist"
                    >
                      <Trash2 className="playlist-manager__action-icon" />
                    </button>
                  </div>
                </div>

                {playlist.description && (
                  <p className="playlist-manager__item-description">{playlist.description}</p>
                )}

                <div className="playlist-manager__item-meta">
                  <span className="playlist-manager__meta-badge">{playlist.type}</span>
                  <span className="playlist-manager__meta-count">{playlist.tracks.length} tracks</span>
                </div>

                {expandedPlaylist === playlist.id && (
                  <>
                    <div className="playlist-manager__tracks">
                      {playlist.tracks.length === 0 ? (
                        <p className="playlist-manager__no-tracks">No tracks yet</p>
                      ) : (
                        playlist.tracks.map((track) => (
                          <div key={track.id} className="playlist-manager__track">
                            <div className="playlist-manager__track-info">
                              <p className="playlist-manager__track-title">{track.title}</p>
                              <p className="playlist-manager__track-artist">{track.artist}</p>
                              <p className="playlist-manager__track-duration">{track.duration}</p>
                            </div>
                            <div className="playlist-manager__track-actions">
                              <button
                                onClick={() => handlePlayTrack(playlist.id, track.id)}
                                className="playlist-manager__track-play"
                                title="Play track"
                              >
                                <Play className="playlist-manager__track-play-icon" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrack(playlist.id, track.id)}
                                className="playlist-manager__track-delete"
                                title="Delete track"
                              >
                                <Trash2 className="playlist-manager__track-delete-icon" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {showTrackForm === playlist.id ? (
                      <form onSubmit={(e) => handleAddTrack(playlist.id, e)} className="playlist-manager__track-form">
                        <div className="playlist-manager__track-form-group">
                          <input
                            type="text"
                            placeholder="Song Title"
                            value={trackFormData.title}
                            onChange={(e) => setTrackFormData({ ...trackFormData, title: e.target.value })}
                            className="playlist-manager__track-input"
                            required
                          />
                        </div>
                        <div className="playlist-manager__track-form-group">
                          <input
                            type="url"
                            placeholder="Media URL (YouTube, Google Drive file, or MP3)"
                            value={trackFormData.youtubeUrl}
                            onChange={(e) => {
                              setTrackFormData({ ...trackFormData, youtubeUrl: e.target.value })
                              if (e.target.value) {
                                fetchMetadata(e.target.value)
                              }
                            }}
                            className="playlist-manager__track-input"
                            required
                          />
                        </div>

                        {fetchingMetadata && (
                          <div className="playlist-manager__metadata-loading">
                            <p>Fetching video details...</p>
                          </div>
                        )}

                        {trackMetadata.artist && (
                          <div className="playlist-manager__metadata-display">
                            <div className="playlist-manager__metadata-item">
                              <span className="playlist-manager__metadata-label">Artist:</span>
                              <span className="playlist-manager__metadata-value">{trackMetadata.artist}</span>
                            </div>
                            <div className="playlist-manager__metadata-item">
                              <span className="playlist-manager__metadata-label">Duration:</span>
                              <span className="playlist-manager__metadata-value">{trackMetadata.duration}</span>
                            </div>
                          </div>
                        )}

                        <div className="playlist-manager__track-form-actions">
                          <button
                            type="submit"
                            className="playlist-manager__track-submit"
                            disabled={fetchingMetadata}
                          >
                            Add Track
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowTrackForm(null)
                              setTrackFormData({ title: '', youtubeUrl: '' })
                              setTrackMetadata({ artist: '', duration: '' })
                            }}
                            className="playlist-manager__track-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowTrackForm(playlist.id)}
                        className="playlist-manager__add-track-button"
                      >
                        <Plus className="playlist-manager__button-icon" />
                        Add Track
                      </button>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {nowPlaying && getNowPlayingTrack() && (
        <div
          className="playlist-manager__player-modal"
          onClick={() => setNowPlaying(null)}
        >
          <div
            className="playlist-manager__player-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setNowPlaying(null)}
              className="playlist-manager__player-close"
              title="Close player"
            >
              <X className="playlist-manager__player-close-icon" />
            </button>
            <div className="playlist-manager__player-info">
              <h3 className="playlist-manager__player-title">{getNowPlayingTrack()?.title}</h3>
              <p className="playlist-manager__player-artist">{getNowPlayingTrack()?.artist}</p>
            </div>
            <div className="playlist-manager__player-embed">
              {(() => {
                const url = getNowPlayingTrack()?.youtubeUrl || ''
                const urlType = getUrlType(url)

                if (urlType === 'youtube') {
                  return (
                    <iframe
                      key={nowPlaying.trackId}
                      width="100%"
                      height="400"
                      src={`https://www.youtube.com/embed/${extractVideoId(url)}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                      title={getNowPlayingTrack()?.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                } else if (urlType === 'drive') {
                  const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
                  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
                  return (
                    <div className="playlist-manager__drive-player">
                      <iframe
                        key={nowPlaying.trackId}
                        width="100%"
                        height="300"
                        src={`https://drive.google.com/file/d/${fileId}/preview`}
                        title={getNowPlayingTrack()?.title}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="playlist-manager__download-button"
                      >
                        Download Audio
                      </a>
                    </div>
                  )
                } else {
                  return (
                    <audio
                      key={nowPlaying.trackId}
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
    </div>
  )
}
