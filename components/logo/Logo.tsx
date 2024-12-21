'use client';

import { LogoIcon } from './LogoIcon';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 211.4 26.208"
      className={`w-auto text-gray-900 dark:text-white transition-colors duration-200 ${className}`}
      aria-label="dontSign.ai logo"
      role="img"
    >
      <title>dontSign.ai</title>
      <g className="fill-current">
        <LogoIcon />
      </g>
    </svg>
  );
}