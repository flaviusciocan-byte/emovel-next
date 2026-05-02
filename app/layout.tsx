import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  defaultDescription,
  defaultTitle,
  ogImage,
  siteName,
  siteUrl,
  softwareJsonLd,
  websiteJsonLd,
} from "./seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s",
  },
  description: defaultDescription,
  applicationName: siteName,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    type: "website",
    images: [
      {
        url: ogImage,
        alt: "EMOVEL controlled digital product system",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteJsonLd, softwareJsonLd]),
          }}
        />
        <header className="bg-[#030405] text-slate-100 py-4 px-6 backdrop-blur-lg z-50 fixed w-full">
          <nav className="flex items-center justify-between max-w-6xl mx-auto">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
              EMOVEL
            </Link>
            <ul className="flex space-x-8">
              <li><Link href="/" className="text-slate-400 hover:text-white">Home</Link></li>
              <li><Link href="/ecosystem" className="text-slate-400 hover:text-white">Ecosystem</Link></li>
              <li><Link href="/builder" className="text-slate-400 hover:text-white">Builder</Link></li>
              <li><Link href="/assistants" className="text-slate-400 hover:text-white">Assistants</Link></li>
              <li><Link href="/prompt-engine" className="text-slate-400 hover:text-white">Prompt Engine</Link></li>
              <li><Link href="/docs" className="text-slate-400 hover:text-white">Docs</Link></li>
            </ul>
          </nav>
        </header>
        <main className="mt-[5rem] flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
