import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Text */}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          This page is playing hide and seek (and winning).
        </p>

        {/* Link */}
        <Link 
          href="/"
          className="
            text-gray-600 hover:text-gray-900 
            dark:text-gray-400 dark:hover:text-gray-100
            transition-colors duration-200
          "
        >
          Go to main page
        </Link>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
          <div className="w-96 h-96 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-30" />
        </div>
      </div>
    </div>
  );
}