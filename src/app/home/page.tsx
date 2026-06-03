import { CategoryPage } from "@/components/seo/CategoryPage";
import { getPublicBoardsByMood } from "@/lib/public-collection";
import { categoryMetadata } from "@/lib/seo/metadata";

export const metadata = categoryMetadata("home");

export default async function HomeCategoryPage() {
  return <CategoryPage mood="home" boards={await getPublicBoardsByMood("home")} />;
}
