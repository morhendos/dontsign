import Header from '@/components/header'
import Hero from '@/components/hero'
import HowItWorks from '@/components/how-it-works'
import KeyFeatures from '@/components/key-features'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      <Header />
      <Hero />
      <HowItWorks />
      <KeyFeatures />
      <Footer />
    </main>
  )
}

