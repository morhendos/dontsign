import Link from 'next/link'

export default function Header() {
  return (
    <header className="py-6 px-4 md:px-8">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          dontSign.ai
        </Link>
        <div className="space-x-4">
          <Link href="#how-it-works" className="text-gray-600 hover:text-gray-800">
            How it Works
          </Link>
          <Link href="#key-features" className="text-gray-600 hover:text-gray-800">
            Key Features
          </Link>
        </div>
      </nav>
    </header>
  )
}

