
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Plan, track, and improve your routines with flexible analytics and AI tips.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
