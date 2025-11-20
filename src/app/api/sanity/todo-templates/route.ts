import { NextRequest, NextResponse } from 'next/server'
import { SanityService } from '@/lib/sanity/service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        let templates
        if (category) {
            templates = await SanityService.getTodoTemplatesByCategory(category)
        } else {
            templates = await SanityService.getTodoTemplates()
        }

        return NextResponse.json({
            success: true,
            data: templates
        })
    } catch (error) {
        console.error('Error fetching todo templates:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch todo templates'
            },
            { status: 500 }
        )
    }
}