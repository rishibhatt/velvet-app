import type { Metadata } from "next";
import { inter, playfair } from "@/lib/fonts";
import { createSiteMetadata } from "@/lib/site-metadata";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { GlobalModals } from "@/components/layouts/GlobalModals";
import "./globals.css";

export const metadata: Metadata = createSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-body text-on-surface antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <GlobalModals />
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
