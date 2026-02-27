import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { photoService } from '@/lib/services/photo-service'

/**
 * GET /api/photos/folders
 * List all available categories (default and custom) for the authenticated couple
 * @deprecated Use /api/photos/categories instead
 */
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

        // Get all available categories for the couple (mapped to folder format for backward compatibility)
        const categories = await photoService.getAvailableCategories(couple.id)

        // Map categories to folder format for backward compatibility
        const folders = categories.map(cat => ({
            id: cat.id,
            couple_id: cat.couple_id,
            folder_name: cat.category_name,
            folder_type: cat.category_type,
            google_drive_folder_id: cat.google_drive_folder_id,
            created_at: cat.created_at,
            updated_at: cat.updated_at
        }))

        return NextResponse.json(folders)
    } catch (error) {
        console.error('Error fetching folders:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/photos/folders
 * Create a custom category for the authenticated couple
 * @deprecated Use /api/photos/categories instead
 */
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
        const { folderName, googleDriveFolderId } = body

        // Validate required fields
        if (!folderName || typeof folderName !== 'string' || folderName.trim() === '') {
            return NextResponse.json({ error: 'Folder name is required and must be a non-empty string' }, { status: 400 })
        }

        // Use service role client to bypass RLS for server-side operations
        const serviceSupabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        )

        // Check if category name already exists for this couple
        const { data: existingCategory } = await serviceSupabase
            .from('categories')
            .select('id')
            .eq('couple_id', couple.id)
            .eq('category_name', folderName.trim())
            .single()

        if (existingCategory) {
            return NextResponse.json({ error: 'Folder with this name already exists' }, { status: 409 })
        }

        // Create custom category directly using service role to bypass RLS
        const { data: newCategory, error: insertError } = await serviceSupabase
            .from('categories')
            .insert({
                couple_id: couple.id,
                category_name: folderName.trim(),
                category_type: 'custom',
                google_drive_folder_id: googleDriveFolderId || null
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error inserting category:', insertError)
            return NextResponse.json({ error: `Failed to create folder: ${insertError.message}` }, { status: 500 })
        }

        // Map to folder format for backward compatibility
        const folder = {
            id: newCategory.id,
            couple_id: newCategory.couple_id,
            folder_name: newCategory.category_name,
            folder_type: newCategory.category_type,
            google_drive_folder_id: newCategory.google_drive_folder_id,
            created_at: newCategory.created_at,
            updated_at: newCategory.updated_at
        }

        return NextResponse.json(folder, { status: 201 })
    } catch (error) {
        console.error('Error creating custom folder:', error)
        const errorMessage = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
