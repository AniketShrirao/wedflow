import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-pink-600">Wedflow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your complete digital wedding management platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-pink-600">Guest Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage your guest list, send digital invitations via WhatsApp and SMS
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">Photo Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect Google Drive to collect and showcase wedding photos
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-600">Digital Gifts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set up UPI-based gift portal for easy monetary blessings
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="space-x-4">
          <Button asChild size="lg">
            <a href="/auth/register">Get Started</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/auth/login">Sign In</a>
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Modern, Gen-Z friendly wedding management made simple</p>
        </div>
      </div>
    </div>
  )
}