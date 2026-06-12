import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { noIndexMetadata } from "@/lib/seo/metadata";
import "../dashboard.css";
import "../collection-grid.css";

export const metadata: Metadata = noIndexMetadata("Dashboard");

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
