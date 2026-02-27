import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { photoService } from '@/lib/services/photo-service'

/**
 * GET /api/photos/categories
 * List all available categories (default and custom) for the authenticated couple
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

        // Get all available categories for the couple
        const categories = await photoService.getAvailableCategories(couple.id)

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/photos/categories
 * Create a custom category for the authenticated couple
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
        const { categoryName, googleDriveFolderId } = body

        // Validate required fields
        if (!categoryName || typeof categoryName !== 'string' || categoryName.trim() === '') {
            return NextResponse.json({ error: 'Category name is required and must be a non-empty string' }, { status: 400 })
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
            .eq('category_name', categoryName.trim())
            .single()

        if (existingCategory) {
            return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
        }

        // Create custom category directly using service role to bypass RLS
        const { data: newCategory, error: insertError } = await serviceSupabase
            .from('categories')
            .insert({
                couple_id: couple.id,
                category_name: categoryName.trim(),
                category_type: 'custom',
                google_drive_folder_id: googleDriveFolderId || null
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error inserting category:', insertError)
            return NextResponse.json({ error: `Failed to create category: ${insertError.message}` }, { status: 500 })
        }

        return NextResponse.json(newCategory, { status: 201 })
    } catch (error) {
        console.error('Error creating custom category:', error)
        const errorMessage = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
