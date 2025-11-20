import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
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

  // Get some basic stats
  const { count: guestCount } = await supabase
    .from('guests')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', couple.id)

  const { count: contactCount } = await supabase
    .from('vendor_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', couple.id)

  const { count: todoCount } = await supabase
    .from('todo_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', couple.id)

  const { count: completedTodos } = await supabase
    .from('todo_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', couple.id)
    .eq('completed', true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {couple.partner1_name} & {couple.partner2_name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your wedding planning progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{guestCount || 0}</div>
            <p className="text-sm text-gray-600">Guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{contactCount || 0}</div>
            <p className="text-sm text-gray-600">Vendor Contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {completedTodos || 0}/{todoCount || 0}
            </div>
            <p className="text-sm text-gray-600">Tasks Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-pink-600">
              {couple.wedding_date ? new Date(couple.wedding_date).toLocaleDateString() : 'Not set'}
            </div>
            <p className="text-sm text-gray-600">Wedding Date</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Guest Management</CardTitle>
            <CardDescription>Manage your wedding guest list</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Add guests, send invitations, and track RSVPs
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/guests">Manage Guests</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Vendor Contacts</CardTitle>
            <CardDescription>Keep track of your wedding vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Store contact information for decorators, photographers, and more
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/contacts">View Contacts</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Manage your wedding events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Create your public wedding site with event information
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/events">Setup Events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Photo Gallery</CardTitle>
            <CardDescription>Collect and share wedding photos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Connect Google Drive and manage photo collections
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/photos">Manage Photos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Gift Portal</CardTitle>
            <CardDescription>Set up digital gift receiving</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure UPI details for receiving monetary gifts
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/gifts">Setup Gifts</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Todo Planner</CardTitle>
            <CardDescription>Track your wedding preparation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage your wedding planning checklist
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/todos">View Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/${couple.couple_slug}`} target="_blank">
                View Public Site
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/guests">Add Guests</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/contacts">Add Vendors</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}