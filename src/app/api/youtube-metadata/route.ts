import { NextRequest, NextResponse } from 'next/server'

// GET YouTube video metadata
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const videoId = searchParams.get('videoId')

        if (!videoId) {
            return NextResponse.json(
                { error: 'videoId is required' },
                { status: 400 }
            )
        }

        // Try YouTube Data API first if key is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
        if (apiKey) {
            try {
                const res = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`,
                    { next: { revalidate: 3600 } }
                )

                if (res.ok) {
                    const data = await res.json()
                    if (data.items && data.items.length > 0) {
                        const video = data.items[0]
                        const channelTitle = video.snippet?.channelTitle || 'Unknown Artist'
                        const duration = video.contentDetails?.duration ? parseDuration(video.contentDetails.duration) : '0:00'

                        return NextResponse.json({
                            artist: channelTitle,
                            duration,
                        })
                    }
                }
            } catch (error) {
                console.warn('YouTube Data API failed, trying oEmbed:', error)
            }
        }

        // Fallback to oEmbed API (more reliable, no key needed)
        const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        )

        if (oembedRes.ok) {
            const oembedData = await oembedRes.json()
            return NextResponse.json({
                artist: oembedData.author_name || 'Unknown Artist',
                duration: '0:00', // oEmbed doesn't provide duration
            })
        }

        // If all else fails, return defaults
        return NextResponse.json({
            artist: 'Unknown Artist',
            duration: '0:00',
        })
    } catch (error) {
        console.error('Error fetching YouTube metadata:', error)
        return NextResponse.json({
            artist: 'Unknown Artist',
            duration: '0:00',
        })
    }
}

function parseDuration(duration: string): string {
    // Parse ISO 8601 duration format (e.g., PT1H23M45S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return '0:00'

    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const seconds = parseInt(match[3] || '0', 10)

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
