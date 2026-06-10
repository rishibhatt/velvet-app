import { CategoryPage } from "@/components/seo/CategoryPage";
import { getPublicBoardsByMood } from "@/lib/public-collection";
import { categoryMetadata } from "@/lib/seo/metadata";

export const metadata = categoryMetadata("lifestyle");

export default async function LifestylePage() {
  return (
    <CategoryPage mood="lifestyle" boards={await getPublicBoardsByMood("lifestyle")} />
  );
}
