import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | DontSign',
    default: 'DontSign - AI Contract Analyzer',
  },
  description: 'Analyze contracts with AI to highlight risks and key terms',
  openGraph: {
    title: 'DontSign - AI Contract Analyzer',
    description: 'Analyze contracts with AI to highlight risks and key terms',
    url: 'https://dontsign.com',
    siteName: 'DontSign',
    locale: 'en_US',
    type: 'website',
  },
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
  twitter: {
    title: 'DontSign',
    card: 'summary_large_image',
  },
  icons: {
    shortcut: '/favicon.ico',
  },
}
