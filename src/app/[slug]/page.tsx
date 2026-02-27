import { notFound } from 'next/navigation'
import { PublicWeddingSite } from '@/components/public/wedding-site'
import { getPublicWeddingData } from '@/lib/public-service'

interface PublicWeddingSitePageProps {
  params: Promise<{ slug: string }>
}

async function getWeddingData(slug: string) {
  try {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const response = await fetch(
      `${siteBase}/api/public/${slug}`,
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching wedding data:', error)
    return null
  }
}

export default async function PublicWeddingSitePage({
  params,
}: PublicWeddingSitePageProps) {
  const { slug } = await params
  const data = await getPublicWeddingData(slug)

  if (!data) notFound()

  return <PublicWeddingSite data={data} />
}