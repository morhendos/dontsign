import Header from '@/components/header'
import Hero from '@/components/hero/Hero'
import HowItWorks from '@/components/how-it-works'
import KeyFeatures from '@/components/key-features'
import Footer from '@/components/footer'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <Hero />
      <HowItWorks />
      <KeyFeatures />
      <Footer />
    </main>
  )
}
