'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlaylistManager } from '@/components/dashboard/playlist-manager'
import { Couple } from '@/lib/types/database'

export default function PlaylistsPage() {
  const [couple, setCouple] = useState<Couple | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCouple = async () => {
      try {
        const supabase = createClient()
        
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
          .from('couples')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setCouple(data)
      } catch (error) {
        console.error('Error fetching couple:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCouple()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading playlists...</p>
        </div>
      </div>
    )
  }

  if (!couple) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load couple information</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Playlist Manager</h1>
        <p className="mt-2 text-gray-600">
          Create and manage playlists for your wedding events
        </p>
      </div>

      <PlaylistManager coupleId={couple.id} />
    </div>
  )
}
