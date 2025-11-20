import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventDetailsEditor } from '@/components/events/event-details-editor'

export default async function EventsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get couple information
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!couple) {
    redirect('/dashboard/setup')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
        <p className="text-gray-600">
          Create and manage your wedding events and public wedding site
        </p>
      </div>

      <EventDetailsEditor couple={couple} />
    </div>
  )
}