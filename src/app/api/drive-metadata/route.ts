import { NextRequest, NextResponse } from 'next/server'

// GET Google Drive file metadata
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const fileId = searchParams.get('fileId')

        if (!fileId) {
            return NextResponse.json(
                { error: 'fileId is required' },
                { status: 400 }
            )
        }

        const accessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN

        if (!accessToken) {
            console.warn('Google Drive access token not configured')
            return NextResponse.json({
                artist: 'Unknown Artist',
                duration: '0:00',
            })
        }

        // Get file metadata from Google Drive API
        const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,owners,mimeType`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                next: { revalidate: 3600 },
            }
        )

        if (!res.ok) {
            console.error('Google Drive API error:', res.status)
            return NextResponse.json({
                artist: 'Unknown Artist',
                duration: '0:00',
            })
        }

        const data = await res.json()
        const ownerName = data.owners?.[0]?.displayName || 'Unknown Artist'

        return NextResponse.json({
            artist: ownerName,
            duration: '0:00',
        })
    } catch (error) {
        console.error('Error fetching Google Drive metadata:', error)
        return NextResponse.json({
            artist: 'Unknown Artist',
            duration: '0:00',
        })
    }
}
