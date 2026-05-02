import type { Metadata } from "next";
import Link from "next/link";
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
  title: "EMOVEL",
  description: "EMOVEL - Build Systems That Convert",
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
        <header className="bg-[#030405] text-slate-100 py-4 px-6 backdrop-blur-lg z-50 fixed w-full">
          <nav className="flex items-center justify-between max-w-6xl mx-auto">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
              EMOVEL
            </Link>
            <ul className="flex space-x-8">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/ecosystem">Ecosystem</Link></li>
              <li><Link href="/builder">Builder</Link></li>
              <li><Link href="/assistants">Assistants</Link></li>
              <li><Link href="/prompt-engine">Prompt Engine</Link></li>
              <li><Link href="/docs" className="text-slate-400 hover:text-white">Docs</Link></li>
            </ul>
          </nav>
        </header>
        <main className="mt-[8rem] flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
