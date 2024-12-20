import './globals.css'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { Analytics } from '@/components/Analytics';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Don\'t Sign Until You\'re Sure | AI Contract Analysis',
  description: 'Upload your contract and let AI highlight the risks and key terms before you sign.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Suspense>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}