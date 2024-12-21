import { Hero } from "@/components/hero"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ThemeToggle />
      <Hero />
    </main>
  )
}