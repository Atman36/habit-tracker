
import type { Metadata } from 'next';
import { Unbounded, Rubik, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";

const fontDisplay = Unbounded({
  variable: '--font-display',
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700', '900'],
});

const fontSans = Rubik({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
});

const fontMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Трекер Привычек',
  description: 'Современное приложение для отслеживания привычек',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
