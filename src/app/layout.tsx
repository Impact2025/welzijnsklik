import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Welzijnsklik — welzijn dichtbij",
  description: "Vrijwilligers, bewoners en familie verbonden in de ouderenzorg",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "Welzijnsklik",
    description: "Welzijn dichtbij, altijd verbonden",
    siteName: "Welzijnsklik",
    type: "website",
    locale: "nl_NL",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
