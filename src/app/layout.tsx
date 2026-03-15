import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://starvillage.coffee'),
  title: {
    default: "Star Village Coffee - Menu & Harga | Coffee Shop Boyolali",
    template: "%s | Star Village Coffee"
  },
  description: "Star Village Coffee - Coffee shop terbaik di Boyolali dengan menu lengkap: kopi specialty, kopi susu, makanan, dan minuman lezat dengan harga terjangkau. Free WiFi, area luas, mushola tersedia. Pesan online sekarang!",
  keywords: [
    "Star Village Coffee",
    "Coffee Shop Boyolali",
    "Kopi Boyolali",
    "Kopi Susu",
    "Nongkrong Boyolali",
    "Cafe Boyolali",
    "Menu Coffee Shop",
    "Kopi Susu Aren",
    "Nasi Goreng Boyolali",
    "Cafe 24 Jam Boyolali",
    "Coffee Shop Murah",
    "Tempat Nongkrong Boyolali",
    "Kopi Specialty Boyolali",
    "Delivery Kopi Boyolali"
  ],
  authors: [{ name: "Star Village Coffee", url: "https://starvillage.coffee" }],
  creator: "Star Village Coffee",
  publisher: "Star Village Coffee",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/images/logo.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Star Village Coffee - Menu & Harga | Coffee Shop Boyolali",
    description: "Coffee shop terbaik di Boyolali dengan menu lengkap: kopi specialty, kopi susu, makanan, minuman lezat. Free WiFi, area luas, mushola tersedia. Pesan online sekarang!",
    url: "https://starvillage.coffee",
    siteName: "Star Village Coffee",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Star Village Coffee Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Star Village Coffee - Menu & Harga | Coffee Shop Boyolali",
    description: "Coffee shop terbaik di Boyolali dengan menu lengkap dan harga terjangkau. Free WiFi, area luas, mushola tersedia.",
    images: ["/images/logo.png"],
  },
  alternates: {
    canonical: "https://starvillage.coffee",
  },
  category: "restaurant",
  classification: "Coffee Shop, Restaurant, Cafe",
  other: {
    "geo.region": "ID-JT",
    "geo.placename": "Boyolali",
    "geo.position": "-7.5129947;110.5970333",
    "ICBM": "-7.5129947, 110.5970333",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "@id": "https://starvillage.coffee/#organization",
  "name": "Star Village Coffee",
  "alternateName": "Star Village",
  "description": "Coffee shop terbaik di Boyolali dengan menu lengkap: kopi specialty, kopi susu, makanan, dan minuman lezat dengan harga terjangkau.",
  "url": "https://starvillage.coffee",
  "logo": "https://starvillage.coffee/images/logo.png",
  "image": "https://starvillage.coffee/images/logo.png",
  "telephone": "+6282148615641",
  "email": "starvillage.coffee@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Tentara Pelajar, Dusun 3",
    "addressLocality": "Kiringan",
    "addressRegion": "Boyolali, Jawa Tengah",
    "postalCode": "57312",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -7.5129947,
    "longitude": 110.5970333
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "10:00",
      "closes": "23:00"
    }
  ],
  "priceRange": "Rp 15.000 - Rp 50.000",
  "servesCuisine": ["Coffee", "Indonesian", "Western"],
  "hasMenu": {
    "@type": "Menu",
    "name": "Menu Star Village Coffee",
    "url": "https://starvillage.coffee/menu"
  },
  "sameAs": [
    "https://www.instagram.com/starvillage.coffee",
    "https://www.facebook.com/starvillage.coffee"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Free WiFi",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification", 
      "name": "Mushola",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Outdoor Seating",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Indoor Seating",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Parking",
      "value": true
    }
  ]
};

// Breadcrumb structured data
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://starvillage.coffee"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Menu",
      "item": "https://starvillage.coffee/menu"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Reservasi",
      "item": "https://starvillage.coffee/reservasi"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Gallery",
      "item": "https://starvillage.coffee/gallery"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
