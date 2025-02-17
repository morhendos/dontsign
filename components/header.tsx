'use client';

import Link from "next/link";
import { Logo } from "@/components/logo/Logo";
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useState, useEffect } from "react";

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
        backdrop-blur-md
        ${isScrolled
          ? 'py-3 bg-white/80 dark:bg-gray-900/80 shadow-md'
          : 'py-8 bg-transparent'}
      `}
    >
      <nav className="
        max-w-7xl mx-auto flex justify-between items-center
        px-4 md:px-8
        transition-all duration-300 ease-in-out
      ">
        <Link
          href="/"
          className={`
            hover:opacity-80 transition-all duration-200
            ${isScrolled ? 'py-1' : 'py-2'}
          `}
          aria-label="dontSign.ai Home"
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