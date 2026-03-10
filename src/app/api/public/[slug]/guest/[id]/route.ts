import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validate couple exists
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .eq('couple_slug', slug)
      .single()

    if (!couple) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

    // Fetch guest by id ensuring it belongs to couple
    const { data: guest, error } = await supabase
      .from('guests')
      .select('id,name,phone,email,group_name,invite_status,invite_sent_at,invite_viewed_at')
      .eq('id', id)
      .eq('couple_id', couple.id)
      .single()

    if (error) {
      console.error('Error fetching guest:', error)
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    return NextResponse.json({ guest })
  } catch (err) {
    console.error('Error in GET /api/public/[slug]/guest/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
