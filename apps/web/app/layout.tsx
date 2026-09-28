import type { Metadata, Viewport } from 'next';
import './globals.css';
import NumberInputGuard from '../components/common/NumberInputGuard';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'Flour Mill (Chakki) Billing & Management System',
  description: 'Fast, touch-first billing & financial management system for retail flour shop',
  icons: {
    icon: '/icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

// Inline script to prevent theme flash (FOUC) and detect native app for safe-area insets
const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('flour_erp_theme');
      var isDark = stored === 'dark' || ((!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }

      var isNative = !!window.Capacitor || 
                     (navigator.userAgent && (navigator.userAgent.indexOf('wv') > -1 || navigator.userAgent.indexOf('Capacitor') > -1)) ||
                     (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                     !!(window.navigator && window.navigator.standalone);
      if (isNative) {
        document.documentElement.classList.add('is-native-app');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/JameelNooriNastaleeqRegular.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NumberInputGuard />
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
