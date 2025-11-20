import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeManager } from '@/components/themes/theme-manager'
import { ThemeProvider } from '@/components/themes/theme-provider'

export default async function ThemesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if couple profile exists
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!couple) {
    redirect('/dashboard/setup')
  }

  return (
    <ThemeProvider>
      <ThemeManager />
    </ThemeProvider>
  )
}