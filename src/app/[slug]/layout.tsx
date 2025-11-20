import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PublicWeddingSiteLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/public/${slug}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return {
        title: 'Wedding Site Not Found',
        description: 'The requested wedding site could not be found.'
      }
    }

    const data = await response.json()
    const { couple, events } = data

    const title = `${couple.partner1_name} & ${couple.partner2_name}'s Wedding`
    const description = events.couple_intro || 
      `Join us in celebrating the wedding of ${couple.partner1_name} and ${couple.partner2_name}${couple.wedding_date ? ` on ${new Date(couple.wedding_date).toLocaleDateString()}` : ''}.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`,
        siteName: 'Wedflow',
        images: [
          {
            url: '/og-wedding-default.jpg', // You'll need to add this image
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-wedding-default.jpg'],
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    return {
      title: 'Wedding Site',
      description: 'A beautiful wedding celebration'
    }
  }
}

export default function PublicWeddingSiteLayout({
  children,
}: Omit<PublicWeddingSiteLayoutProps, 'params'>) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}