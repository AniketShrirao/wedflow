import { NextRequest, NextResponse } from 'next/server'

// GET audio file metadata
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const url = searchParams.get('url')

        if (!url) {
            return NextResponse.json(
                { error: 'url is required' },
                { status: 400 }
            )
        }

        try {
            // Try to fetch the audio file headers to get metadata
            const res = await fetch(url, {
                method: 'HEAD',
                next: { revalidate: 3600 },
            })

            if (!res.ok) {
                return NextResponse.json({
                    artist: 'Unknown Artist',
                    duration: '0:00',
                })
            }

            // Extract filename from URL or Content-Disposition header
            const contentDisposition = res.headers.get('content-disposition')
            let filename = 'Unknown Artist'

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/)
                if (match) {
                    filename = match[1].replace(/\.[^/.]+$/, '') // Remove extension
                }
            } else {
                // Extract from URL path
                const urlObj = new URL(url)
                const pathname = urlObj.pathname
                filename = pathname.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unknown Artist'
            }

            return NextResponse.json({
                artist: filename,
                duration: '0:00',
            })
        } catch (error) {
            console.error('Error fetching audio file:', error)
            return NextResponse.json({
                artist: 'Unknown Artist',
                duration: '0:00',
            })
        }
    } catch (error) {
        console.error('Error fetching audio metadata:', error)
        return NextResponse.json({
            artist: 'Unknown Artist',
            duration: '0:00',
        })
    }
}
