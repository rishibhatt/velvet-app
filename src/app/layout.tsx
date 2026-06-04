import type { Metadata } from "next";

import { inter, playfair } from "@/lib/fonts";

import { createSiteMetadata } from "@/lib/site-metadata";

import { QueryProvider } from "@/providers/QueryProvider";

import { AuthProvider } from "@/providers/AuthProvider";
import { NotificationRealtimeProvider } from "@/providers/NotificationRealtimeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { GlobalModals } from "@/components/layouts/GlobalModals";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { AnalyticsProvider } from "@/providers/analytics/AnalyticsProvider";
import { NavigationProgressProvider } from "@/providers/NavigationProgressProvider";
import "./globals.css";



export const metadata: Metadata = createSiteMetadata();



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </head>
      <body className="min-h-screen bg-background font-body text-on-surface antialiased">
        <QueryProvider>
          <AuthProvider>
            <NotificationRealtimeProvider>
            <NavigationProgressProvider>
              <AnalyticsProvider>
                <ToastProvider>
                  {children}
                  <GlobalModals />
                </ToastProvider>
              </AnalyticsProvider>
            </NavigationProgressProvider>
            </NotificationRealtimeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>

    </html>

  );

}


