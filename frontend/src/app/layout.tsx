import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniLink - URL Shortener",
  description: "Fast URL Shortener built with Symfony and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-200 bg-slate-950">
        {children}
      </body>
    </html>
  );
}
