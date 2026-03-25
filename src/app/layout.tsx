import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LaithST Photography — Equestrian Photography & Brand Management',
  description: 'Equestrian photographer based in the UAE. Competition coverage, private shoots, and brand management for equestrian brands across the Middle East and Europe.',
  keywords: 'equestrian photography, horse photography UAE, competition photography, equestrian brand management',
  openGraph: {
    title: 'LaithST Photography',
    description: 'Capturing the raw emotion and elegance of equestrian sport.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700;1,9..144,900&family=Raleway:wght@100;200;300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
