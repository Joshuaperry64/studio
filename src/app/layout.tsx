import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Space_Grotesk, Source_Code_Pro } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'], variable: '--font-source-code-pro' });

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
    <html lang="en" className={`${spaceGrotesk.variable} ${sourceCodePro.variable}`} suppressHydrationWarning>
      <head>
      </head>
      <body className="font-code antialiased bg-background">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
