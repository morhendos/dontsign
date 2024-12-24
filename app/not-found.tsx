import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 blur-2xl rounded-full opacity-20" />
          <FileQuestion className="w-24 h-24 mx-auto text-blue-500 dark:text-blue-400" />
        </div>

        {/* Text */}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          The page you're looking for may have been moved, deleted, or possibly never existed. 
          Let's get you back on track.
        </p>

        {/* Button */}
        <Link 
          href="/"
          className="
            inline-flex items-center text-gray-600 hover:text-gray-900 
            dark:text-gray-400 dark:hover:text-gray-100
            transition-colors duration-200
          "
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
          <div className="w-96 h-96 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-30" />
        </div>
      </div>
    </div>
  );
}
