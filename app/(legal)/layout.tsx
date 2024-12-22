import Header from '@/components/header'
import Footer from '@/components/footer'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <div className="py-16 px-4">
        {children}
      </div>
      <Footer />
    </main>
  )
}
