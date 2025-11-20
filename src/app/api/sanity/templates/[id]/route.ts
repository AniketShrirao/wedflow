import { NextRequest, NextResponse } from 'next/server'
import { SanityService } from '@/lib/sanity/service'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const template = await SanityService.getWeddingTemplate(id)

        if (!template) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Template not found'
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: template
        })
    } catch (error) {
        console.error('Error fetching wedding template:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch wedding template'
            },
            { status: 500 }
        )
    }
}