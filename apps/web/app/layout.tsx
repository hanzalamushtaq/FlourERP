import type { Metadata, Viewport } from 'next';
import './globals.css';
import NumberInputGuard from '../components/common/NumberInputGuard';
import { LanguageProvider } from '../context/LanguageContext';

export const metadata: Metadata = {
  title: 'Flour Mill (Chakki) Billing & Management System',
  description: 'Fast, touch-first billing & financial management system for retail flour shop',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NumberInputGuard />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
