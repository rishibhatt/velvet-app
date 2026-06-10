import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo/metadata";
import { NotificationsPageContent } from "@/features/notifications/components/NotificationsPageContent";

export const metadata: Metadata = noIndexMetadata("Notifications");

export default function NotificationsPage() {
  return <NotificationsPageContent />;
}
