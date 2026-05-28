import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PriceHawk — Amazon Price Alerts",
  description: "Track Amazon prices and get instant Telegram alerts when products drop to your target price. Free, automatic, no app required.",
  keywords: ["amazon price tracker", "price alerts", "amazon deals", "price drop notifications"],
  openGraph: {
    title: "PriceHawk — Amazon Price Alerts",
    description: "Track Amazon prices and get instant Telegram alerts when products drop to your target price.",
    url: "https://pricehawk-seven.vercel.app",
    siteName: "PriceHawk",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦅</text></svg>"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}