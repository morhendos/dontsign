'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-40
        transition-all duration-300 ease-in-out
        backdrop-blur-lg
        ${isScrolled
          ? 'py-2 bg-white/70 dark:bg-gray-900/70 shadow-lg shadow-black/[0.03] dark:shadow-black/[0.1]'
          : 'py-3 bg-transparent'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/20 dark:from-gray-900/50 dark:to-gray-900/20 pointer-events-none" />
      
      <nav className="
        relative z-10
        max-w-7xl mx-auto 
        flex items-center
        px-4 md:px-8
        transition-all duration-300 ease-in-out
      ">
        {/* Left spacer */}
        <div className="flex-1">
          <ThemeToggle />
        </div>

        {/* Centered title */}
        <h1 
          className={`
            text-base sm:text-lg md:text-xl font-semibold
            text-gray-800 dark:text-gray-200
            transition-all duration-300
            ${isScrolled ? 'scale-90' : 'scale-100'}
          `}
        >
          DontSign
        </h1>

        {/* Right spacer for symmetry */}
        <div className="flex-1 flex justify-end">
          {/* Empty div for balance */}
          <div className="w-9 h-9" />
        </div>
      </nav>
    </header>
  );
}