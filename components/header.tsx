'use client';

import Link from "next/link";
import { Logo } from "@/components/logo/Logo";
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
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
          : 'py-4 bg-transparent'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/20 dark:from-gray-900/50 dark:to-gray-900/20 pointer-events-none" />
      
      <nav className="
        relative z-10
        max-w-7xl mx-auto 
        flex justify-between items-center
        px-4 md:px-8
        transition-all duration-300 ease-in-out
      ">
        <Link
          href="/"
          className={`
            hover:opacity-80 transition-all duration-200
            ${isScrolled ? 'scale-90' : 'scale-100'}
          `}
          aria-label="DontSign.ai Home"
        >
          <Logo className={`
            transition-all duration-300 ease-in-out
            ${isScrolled ? 'h-6 md:h-7' : 'h-7 md:h-8'}
          `} />
        </Link>

        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}