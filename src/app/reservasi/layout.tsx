import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reservasi Meja',
  description: 'Reservasi meja di Star Village Coffee Boyolali - Pilih area Indoor (AC) atau Outdoor (Taman), tentukan tanggal dan jumlah tamu. Booking sekarang!',
  keywords: ['Reservasi Star Village', 'Booking Meja Boyolali', 'Reservasi Cafe', 'Tempat Nongkrong Boyolali', 'Meeting Cafe'],
  openGraph: {
    title: 'Reservasi Meja - Star Village Coffee',
    description: 'Reservasi meja di Star Village Coffee Boyolali. Pilih area Indoor/Outdoor, tentukan tanggal dan jumlah tamu.',
    url: 'https://starvillage.coffee/reservasi',
    images: ['/images/logo.png'],
  },
}

export default function ReservasiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
