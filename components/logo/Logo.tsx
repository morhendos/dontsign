'use client';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`relative w-[211.4px] h-[26.208px] ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="211.4"
        height="26.208"
        viewBox="0 0 211.4 26.208"
        className="text-gray-900 dark:text-white"
        preserveAspectRatio="xMidYMid meet"
        aria-label="dontSign.ai logo"
      >
        <use href="/images/logo.svg#logo" className="fill-current" />
      </svg>
    </div>
  );
}