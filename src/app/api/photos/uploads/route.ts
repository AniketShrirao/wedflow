import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple record
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (coupleError || !couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const uploaderEmail = searchParams.get('uploaderEmail')

        // Build query
        let query = supabase
            .from('uploads')
            .select('*')
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        if (uploaderEmail) {
            query = query.eq('uploader_email', uploaderEmail)
        }

        const { data: uploads, error: uploadsError } = await query

        if (uploadsError) {
            console.error('Error fetching uploads:', uploadsError)
            return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 })
        }

        return NextResponse.json(uploads || [])
    } catch (error) {
        console.error('Error in uploads API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
