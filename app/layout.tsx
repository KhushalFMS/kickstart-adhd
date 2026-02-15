import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LayoutClient } from "@/components/LayoutClient";
import { Suspense } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Kickstart - ADHD Task Manager",
  description: "The only task manager designed for ADHD brains. Focus on one thing at a time.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Kickstart - My ADHD streak!",
    description: "One task at a time. Zero overwhelm. Build momentum with ADHD-first workflows.",
    type: "website",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Kickstart - My ADHD streak!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kickstart - My ADHD streak!",
    description: "One task at a time. Zero overwhelm.",
    images: ["/og.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary-500 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">
          Skip to main content
        </a>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen" />}>
            <LayoutClient>{children}</LayoutClient>
          </Suspense>
        </ErrorBoundary>
        <Script id="kickstart-sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/sw.js').catch(function () {});
            });
          }
        `}</Script>
        {posthogKey ? (
          <>
            <Script src={`${posthogHost}/static/array.js`} strategy="afterInteractive" />
            <Script id="kickstart-posthog" strategy="afterInteractive">{`
              if (navigator.doNotTrack !== '1' && window.posthog) {
                window.posthog.init('${posthogKey}', {
                  api_host: '${posthogHost}',
                  persistence: 'localStorage+cookie',
                  person_profiles: 'identified_only',
                  autocapture: false,
                  capture_pageview: false
                });
              }
            `}</Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
