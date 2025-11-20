import { NextRequest, NextResponse } from 'next/server'
import { SanityService } from '@/lib/sanity/service'

export async function GET(request: NextRequest) {
    try {
        const templates = await SanityService.getWeddingTemplates()

        return NextResponse.json({
            success: true,
            data: templates
        })
    } catch (error) {
        console.error('Error fetching wedding templates:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch wedding templates'
            },
            { status: 500 }
        )
    }
}