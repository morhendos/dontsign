import Header from '@/components/header'
import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from '@/components/theme/theme-provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DontSign - AI Contract Analysis',
  description: 'AI-powered contract analysis to help you understand and review legal documents.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
          id="google-tag"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
        
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "q3qb8dnygb");
          `}
        </Script>
      </head>
      <body className={`${inter.className} h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-full flex flex-col">
            <Analytics />
            <Header />
            <main className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <div className="flex-1 flex items-center justify-center py-4 px-4">
                {children}
              </div>
              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} DontSign. All rights reserved.
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}