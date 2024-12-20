import { useEffect } from 'react';
import { initGA, pageview } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize GA
    initGA();
  }, []);

  useEffect(() => {
    // Track page views
    const url = pathname + searchParams.toString();
    pageview(url);
  }, [pathname, searchParams]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}