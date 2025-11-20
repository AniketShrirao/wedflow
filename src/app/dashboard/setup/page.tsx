import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSetupForm } from '@/components/dashboard/profile-setup-form'

export default async function SetupPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if couple profile already exists
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (couple) {
    redirect('/dashboard')
  }

  return <ProfileSetupForm userId={user.id} />
}