import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { photoService } from '@/lib/services/photo-service'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        const imageId = params.id

        // Validate imageId is provided
        if (!imageId) {
            return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
        }

        // Get the image to verify it belongs to the couple
        const { data: image, error: imageError } = await supabase
            .from('images')
            .select('id, couple_id')
            .eq('id', imageId)
            .single()

        if (imageError || !image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 })
        }

        // Verify the image belongs to the authenticated couple
        if (image.couple_id !== couple.id) {
            return NextResponse.json({ error: 'Unauthorized to delete this image' }, { status: 403 })
        }

        // Delete the image
        await photoService.deleteImage(imageId)

        return NextResponse.json({ success: true, message: 'Image deleted successfully' })
    } catch (error) {
        console.error('Error deleting image:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
