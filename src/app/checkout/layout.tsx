import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Checkout pesanan Star Village Coffee - Pilih metode pembayaran: Transfer Bank, QRIS, atau COD. Pesan online, ambil di cafe atau delivery.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
