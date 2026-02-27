import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params

        // Get upload
        const { data: upload, error: uploadError } = await supabase
            .from('uploads')
            .select('*')
            .eq('id', id)
            .eq('couple_id', couple.id)
            .single()

        if (uploadError || !upload) {
            return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
        }

        // Get images for this upload with retry logic for eventual consistency
        let images = null
        let imagesError = null
        let retries = 0
        const maxRetries = 3

        while (retries < maxRetries) {
            const result = await supabase
                .from('images')
                .select('*')
                .eq('upload_id', id)
                .order('created_at', { ascending: false })

            images = result.data
            imagesError = result.error

            // If we got results or it's the last retry, break
            if (images && images.length > 0) {
                break
            }

            // If this isn't the last retry, wait a bit before retrying
            if (retries < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            retries++
        }

        if (imagesError) {
            console.error('Error fetching images:', imagesError)
            return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
        }

        return NextResponse.json({
            images: images || []
        })
    } catch (error) {
        console.error('Error in upload detail API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
