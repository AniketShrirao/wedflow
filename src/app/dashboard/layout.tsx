import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/layout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
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

  // If no couple profile exists and not on setup page, show setup page directly
  if (!couple) {
    return <>{children}</>
  }

  return (
    <DashboardLayout couple={couple}>
      {children}
    </DashboardLayout>
  )
}