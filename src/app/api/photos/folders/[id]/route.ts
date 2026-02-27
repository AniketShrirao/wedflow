import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * DELETE /api/photos/folders/:id
 * Delete a custom category for the authenticated couple
 * @deprecated Use /api/photos/categories/:id instead
 */
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

        const categoryId = params.id

        // Validate category ID format
        if (!categoryId || typeof categoryId !== 'string') {
            return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 })
        }

        // Use service role client to bypass RLS
        const serviceSupabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        )

        // Get the category to verify it exists and belongs to the couple
        const { data: category, error: categoryError } = await serviceSupabase
            .from('categories')
            .select('id, couple_id, category_type')
            .eq('id', categoryId)
            .single()

        if (categoryError || !category) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
        }

        // Verify the category belongs to the authenticated couple
        if (category.couple_id !== couple.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Prevent deletion of default categories
        if (category.category_type === 'default') {
            return NextResponse.json({ error: 'Cannot delete default folders' }, { status: 400 })
        }

        // Delete the custom category
        const { error: deleteError } = await serviceSupabase
            .from('categories')
            .delete()
            .eq('id', categoryId)
            .eq('category_type', 'custom')

        if (deleteError) {
            console.error('Error deleting category:', deleteError)
            return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Error deleting folder:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
