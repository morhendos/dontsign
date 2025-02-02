import { Inter } from 'next/font/google';
import './globals.css';
import { initClarity } from '@/lib/clarity';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Clarity in useEffect
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLARITY_ID) {
      initClarity(process.env.NEXT_PUBLIC_CLARITY_ID);
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
