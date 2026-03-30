import type { Metadata } from 'next'
import { Ramabhadra, Arimo, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _ramabhadra = Ramabhadra({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-ramabhadra',
});

const _arimo = Arimo({ 
  subsets: ["latin"],
  variable: '--font-arimo',
});

const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'CSSE Super Student App | Andhra University',
  description: 'A 360-degree tool for teachers and administrators to manage attendance, track compliance, and generate official student documentation.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_ramabhadra.variable} ${_arimo.variable} ${_geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
