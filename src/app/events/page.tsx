import { CategoryPage } from "@/components/seo/CategoryPage";
import { getPublicBoardsByMood } from "@/lib/public-collection";
import { categoryMetadata } from "@/lib/seo/metadata";

export const metadata = categoryMetadata("events");

export default async function EventsPage() {
  return <CategoryPage mood="events" boards={await getPublicBoardsByMood("events")} />;
}
