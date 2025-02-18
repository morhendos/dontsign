'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Logo } from '@/components/logo/Logo';
import { AnalysisControls } from '@/components/contract-analyzer/components/analysis';
import { useContractAnalyzer } from '@/components/contract-analyzer/hooks/useContractAnalyzer';
import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { history, actions } = useContractAnalyzer();

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

        {/* Centered logo */}
        <div className="flex-1 flex justify-center">
          <Logo className={`transition-transform duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`} />
        </div>

        {/* Right section with history button */}
        <div className="flex items-center gap-2">
          {history.hasAnalyses && (
            <AnalysisControls
              hasStoredAnalyses={history.hasAnalyses}
              onSelectStoredAnalysis={actions.handleSelectStoredAnalysis}
            />
          )}
        </div>
      </nav>
    </header>
  );
}