import type { Metadata } from "next";
import "./globals.css";
import Providers from "../lib/providers";

export const metadata: Metadata = {
  title: "BOLXolve Invoice | Multi-Tenant Billing Platform",
  description: "Enterprise multi-tenant invoice, billing, and automated tax management platform",
  icons: {
    icon: "/platform-logo.svg",
    apple: "/platform-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
