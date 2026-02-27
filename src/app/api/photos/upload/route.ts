import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const { photos } = body

        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return NextResponse.json({ error: 'No photos provided' }, { status: 400 })
        }

        // Get couple names to create initials
        const { data: coupleData } = await supabase
            .from('couples')
            .select('partner1_name, partner2_name')
            .eq('id', couple.id)
            .single()

        // Create initials from couple names
        const initials = coupleData
            ? `${coupleData.partner1_name?.charAt(0) || ''}${coupleData.partner2_name?.charAt(0) || ''}`.toUpperCase()
            : 'DU'

        // Create an upload session
        const { data: upload, error: uploadError } = await supabase
            .from('uploads')
            .insert({
                couple_id: couple.id,
                uploader_name: initials,
                upload_source: 'dashboard',
                status: 'pending'
            })
            .select()
            .single()

        if (uploadError || !upload) {
            return NextResponse.json({ error: 'Failed to create upload session' }, { status: 500 })
        }

        // Insert images
        const imagesToInsert = photos.map((photo: any) => ({
            upload_id: upload.id,
            couple_id: couple.id,
            filename: photo.filename || `photo_${Date.now()}`,
            google_drive_file_id: photo.google_drive_file_id,
            public_url: photo.public_url,
            category: photo.category || 'Wedding',
            folder: photo.folder,
            is_highlighted: false
        }))

        const { data: insertedImages, error: imagesError } = await supabase
            .from('images')
            .insert(imagesToInsert)
            .select()

        if (imagesError) {
            return NextResponse.json({ error: 'Failed to insert images' }, { status: 500 })
        }

        // Update upload status to completed
        await supabase
            .from('uploads')
            .update({ status: 'completed' })
            .eq('id', upload.id)

        return NextResponse.json({
            success: true,
            uploadId: upload.id,
            imageCount: insertedImages?.length || 0
        })
    } catch (error) {
        console.error('Error uploading photos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}