'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo/Logo";
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    
    if (pathname !== '/') {
      router.push(`/${anchor}`);
    } else {
      const element = document.querySelector(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50
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

        <div className="flex items-center space-x-6 md:space-x-8">
          <div className="hidden md:flex space-x-6">
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, '#how-it-works')}
              className="
                transition-colors duration-200
                text-gray-600 hover:text-gray-800 
                dark:text-gray-300 dark:hover:text-gray-100
              "
            >
              How it Works
            </a>
            <a
              href="#key-features"
              onClick={(e) => handleAnchorClick(e, '#key-features')}
              className="
                transition-colors duration-200
                text-gray-600 hover:text-gray-800 
                dark:text-gray-300 dark:hover:text-gray-100
              "
            >
              Key Features
            </a>
          </div>
          
          <div className="
            flex items-center border-l border-gray-200 dark:border-gray-700 pl-6 space-x-6
          ">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggleLog'))}
              className="
                text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100
                transition-colors duration-200
              "
              aria-label="Toggle analysis log"
            >
              <ClipboardList className="h-5 w-5" />
            </button>
            <div className="-mr-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}