import { createClient } from '@/lib/supabase/server'
import { ContactList } from '@/components/contacts/contact-list'

export default async function ContactsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  // Get couple information
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!couple) {
    return <div>Couple profile not found</div>
  }

  // Get initial contacts for the page
  const { data: initialContacts } = await supabase
    .from('vendor_contacts')
    .select('*')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return <ContactList initialContacts={initialContacts || []} />
}