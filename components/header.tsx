import Link from 'next/link'
import { Logo } from '@/components/logo/Logo'

export default function Header() {
  return (
    <header className="py-8 px-4 md:px-8">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="hover:opacity-80 transition-opacity duration-200 py-2"
          aria-label="dontSign.ai Home"
        >
          <Logo className="h-7 md:h-8" />
        </Link>
        <div className="space-x-6 flex items-center">
          <Link 
            href="#how-it-works" 
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
          >
            How it Works
          </Link>
          <Link 
            href="#key-features" 
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
          >
            Key Features
          </Link>
        </div>
      </nav>
    </header>
  )
}