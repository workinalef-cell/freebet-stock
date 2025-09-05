import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-context';
import { AuthContent } from '@/components/auth-content';
import PWAInstaller from '@/components/pwa-installer';
import RegisterSW from './register-sw';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'FreeBet Stock',
  description: 'Gestão e controle de freebets',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FreeBet Stock',
    startupImage: '/icons/icon-512x512.png',
  },
};

export const viewport = {
  themeColor: '#3b82f6',
};

// Desativar geração estática para resolver problemas com o AuthProvider
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AuthContent>
              {children}
              <PWAInstaller />
              <RegisterSW />
            </AuthContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}