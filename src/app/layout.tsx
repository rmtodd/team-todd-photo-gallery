import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import ServiceWorkerManager from "@/components/ServiceWorkerManager";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Team Todd Photo Gallery",
  description: "A secure photo gallery for the Todd family with offline capabilities",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Todd Gallery",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Team Todd Photo Gallery",
    title: "Team Todd Photo Gallery",
    description: "A secure photo gallery for the Todd family with offline capabilities",
  },
  twitter: {
    card: "summary",
    title: "Team Todd Photo Gallery",
    description: "A secure photo gallery for the Todd family with offline capabilities",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white`}
      >
        <ServiceWorkerManager>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ServiceWorkerManager>
      </body>
    </html>
  );
}
