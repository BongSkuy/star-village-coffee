import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loyalty Points',
  description: 'Program Loyalty Points Star Village Coffee - Kumpulkan poin setiap transaksi, naik level member, tukar poin dengan hadiah menarik. Daftar sekarang!',
  keywords: ['Loyalty Points', 'Member Coffee Shop', 'Poin Kopi', 'Rewards Cafe', 'Member Boyolali', 'Poin Loyalitas'],
  openGraph: {
    title: 'Loyalty Points - Star Village Coffee',
    description: 'Program Loyalty Points Star Village Coffee. Kumpulkan poin, naik level, tukar hadiah!',
    url: 'https://starvillage.coffee/loyalty',
    images: ['/images/logo.png'],
  },
}

export default function LoyaltyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
