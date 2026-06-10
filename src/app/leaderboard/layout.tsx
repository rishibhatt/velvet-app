import { ExploreLayoutShell } from "@/components/layouts/ExploreLayoutShell";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ExploreLayoutShell>{children}</ExploreLayoutShell>;
}
