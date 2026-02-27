export interface PlaylistTrack {
    id: string
    title: string
    artist: string
    youtubeUrl: string
    duration: string
    addedAt?: string
}

export interface Playlist {
    id: string
    coupleId: string
    name: string
    description?: string
    type: 'predefined' | 'custom'
    eventType?: string
    tracks: PlaylistTrack[]
    createdAt: string
    updatedAt: string
    createdBy?: string
}

export interface PlaylistCategory {
    id: string
    coupleId: string
    name: string
    description?: string
    isCustom: boolean
    playlistCount: number
    createdAt: string
}
