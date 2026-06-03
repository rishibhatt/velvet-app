import { CategoryPage } from "@/components/seo/CategoryPage";
import { getPublicBoardsByMood } from "@/lib/public-collection";
import { categoryMetadata } from "@/lib/seo/metadata";

export const metadata = categoryMetadata("wedding");

export default async function WeddingPage() {
  return <CategoryPage mood="wedding" boards={await getPublicBoardsByMood("wedding")} />;
}
