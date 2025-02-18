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
        w-full
        flex items-center
        pr-4 md:pr-8
        transition-all duration-300 ease-in-out
      ">
        {/* Left section with theme toggle */}
        <div className="pl-4 md:pl-8">
          <ThemeToggle />
        </div>

        {/* Centered title */}
        <h1 
          className={`
            flex-1 text-center
            text-base sm:text-lg md:text-xl font-semibold
            text-gray-800 dark:text-gray-200
            transition-all duration-300
            ${isScrolled ? 'scale-90' : 'scale-100'}
          `}
        >
          DontSign
        </h1>

        {/* Right spacer for symmetry */}
        <div className="w-9 h-9" />
      </nav>
    </header>
  );
}