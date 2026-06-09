import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import "../dashboard.css";
import "../collection-grid.css";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
