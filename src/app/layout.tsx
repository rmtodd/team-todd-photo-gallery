import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
