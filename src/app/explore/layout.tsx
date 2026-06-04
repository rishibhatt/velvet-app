import { ExploreLayoutShell } from "@/components/layouts/ExploreLayoutShell";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ExploreLayoutShell>{children}</ExploreLayoutShell>;
}
