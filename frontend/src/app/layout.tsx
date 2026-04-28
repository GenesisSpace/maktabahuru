import type { Metadata } from 'next';
import '../styles/globals.css';
import DeviceGuard from '@/components/Deviceguard';


export const metadata: Metadata = {
  title: 'Maktaba Huru – Free E-Library Tanzania',
  description: 'Free books, videos and stories for every child in Tanzania. No registration required.',
  manifest: '/manifest.json',
  themeColor: '#0d3d26',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Maktaba Huru',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <DeviceGuard>
          {children}
        </DeviceGuard>
      </body>
    </html>
  );
}