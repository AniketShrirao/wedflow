import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { setupGlobalErrorHandling, performanceMonitor } from "@/lib/monitoring/error-tracking";
import { setupCSPReporting } from "@/lib/security/security-headers";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: "Wedflow - Modern Wedding Management Platform",
  description: "Manage your wedding digitally with guest lists, invitations, photo sharing, and more.",
  keywords: "wedding, management, digital invitations, photo sharing, guest list",
  authors: [{ name: "Wedflow Team" }],
  creator: "Wedflow",
  publisher: "Wedflow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wedflow.com',
    title: 'Wedflow - Modern Wedding Management Platform',
    description: 'Manage your wedding digitally with guest lists, invitations, photo sharing, and more.',
    siteName: 'Wedflow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedflow - Modern Wedding Management Platform',
    description: 'Manage your wedding digitally with guest lists, invitations, photo sharing, and more.',
    creator: '@wedflow',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-semibold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        <link rel="dns-prefetch" href="//drive.google.com" />
        <link rel="dns-prefetch" href="//cdn.sanity.io" />
        
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        
        {/* Security and performance meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {children}
        
        {/* Initialize monitoring and security */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize global error handling
              if (typeof window !== 'undefined') {
                // Performance monitoring
                window.addEventListener('load', function() {
                  // Measure page load performance
                  const navigation = performance.getEntriesByType('navigation')[0];
                  if (navigation) {
                    fetch('/api/monitoring/performance', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: 'page_load_time',
                        value: navigation.loadEventEnd - navigation.fetchStart,
                        unit: 'ms',
                        timestamp: new Date().toISOString(),
                        environment: '${process.env.NODE_ENV}',
                        context: {
                          url: window.location.href,
                          userAgent: navigator.userAgent
                        }
                      })
                    }).catch(function(error) {
                      console.error('Failed to send performance metric:', error);
                    });
                  }
                });

                // CSP violation reporting
                document.addEventListener('securitypolicyviolation', function(event) {
                  fetch('/api/monitoring/csp-violations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      documentURI: event.documentURI,
                      referrer: event.referrer,
                      blockedURI: event.blockedURI,
                      violatedDirective: event.violatedDirective,
                      originalPolicy: event.originalPolicy,
                      sourceFile: event.sourceFile,
                      lineNumber: event.lineNumber,
                      columnNumber: event.columnNumber,
                      timestamp: new Date().toISOString()
                    })
                  }).catch(function(error) {
                    console.error('Failed to report CSP violation:', error);
                  });
                });

                // Global error handling
                window.addEventListener('error', function(event) {
                  fetch('/api/monitoring/critical-errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: event.error ? event.error.message : event.message,
                      stack: event.error ? event.error.stack : undefined,
                      level: 'error',
                      context: {
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString(),
                        environment: '${process.env.NODE_ENV}'
                      },
                      fingerprint: btoa((event.error ? event.error.message : event.message) + (event.filename || '')).slice(0, 16)
                    })
                  }).catch(function(error) {
                    console.error('Failed to report error:', error);
                  });
                });

                // Unhandled promise rejection handling
                window.addEventListener('unhandledrejection', function(event) {
                  fetch('/api/monitoring/critical-errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: 'Unhandled Promise Rejection: ' + event.reason,
                      level: 'error',
                      context: {
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString(),
                        environment: '${process.env.NODE_ENV}'
                      },
                      fingerprint: btoa('unhandled_rejection_' + event.reason).slice(0, 16)
                    })
                  }).catch(function(error) {
                    console.error('Failed to report unhandled rejection:', error);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}