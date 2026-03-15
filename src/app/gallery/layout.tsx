import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Gallery foto Star Village Coffee Boyolali - Lihat suasana cafe, tempat duduk indoor & outdoor, area taman, dan tempat nongkrong favorit di Boyolali.',
  keywords: ['Gallery Cafe', 'Foto Coffee Shop', 'Interior Cafe Boyolali', 'Tempat Nongkrong', 'Instagramable Spot'],
  openGraph: {
    title: 'Gallery - Star Village Coffee',
    description: 'Gallery foto Star Village Coffee Boyolali. Lihat suasana cafe, tempat duduk, area taman.',
    url: 'https://starvillage.coffee/gallery',
    images: ['/images/logo.png'],
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
