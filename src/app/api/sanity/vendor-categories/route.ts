import { NextRequest, NextResponse } from 'next/server'
import { SanityService } from '@/lib/sanity/service'

export async function GET(request: NextRequest) {
    try {
        const categories = await SanityService.getVendorCategories()

        return NextResponse.json({
            success: true,
            data: categories
        })
    } catch (error) {
        console.error('Error fetching vendor categories:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch vendor categories'
            },
            { status: 500 }
        )
    }
}