import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Menu lengkap Star Village Coffee Boyolali - Pilihan kopi specialty, kopi susu, non-coffee drinks, makanan lezat dengan harga terjangkau. Pesan online sekarang!',
  keywords: ['Menu Star Village', 'Menu Kopi Boyolali', 'Harga Kopi', 'Menu Coffee Shop', 'Kopi Susu Aren', 'Es Kopi Susu', 'Nasi Goreng Cafe'],
  openGraph: {
    title: 'Menu Star Village Coffee - Daftar Menu & Harga',
    description: 'Menu lengkap Star Village Coffee: kopi specialty, kopi susu, non-coffee, makanan dengan harga terjangkau. Pesan online!',
    url: 'https://starvillage.coffee/menu',
    images: ['/images/logo.png'],
  },
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
