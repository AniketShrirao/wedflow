import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GuestList } from '@/components/guests/guest-list'

export default async function GuestsPage() {
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

  // Get initial guests data
  const { data: initialGuests } = await supabase
    .from('guests')
    .select('*')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
        <p className="text-gray-600">
          Manage your wedding guest list and send invitations
        </p>
      </div>
      
      <GuestList initialGuests={initialGuests || []} couple={couple} />
    </div>
  )
}