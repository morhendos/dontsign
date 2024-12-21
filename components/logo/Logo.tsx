'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Image 
      src="/images/logo.svg"
      alt="dontSign.ai logo"
      width={211.4}
      height={26.208}
      className={`${className} dark:invert`}
      priority
    />
  );
}