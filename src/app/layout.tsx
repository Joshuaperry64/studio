import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';


export const metadata: Metadata = {
  title: 'AlphaLink',
  description: 'The beginning of a new era in AI collaboration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <head>
      </head>
      <body className="font-sans antialiased bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
