import { CategoryPage } from "@/components/seo/CategoryPage";
import { getPublicBoardsByMood } from "@/lib/public-collection";
import { categoryMetadata } from "@/lib/seo/metadata";

export const metadata = categoryMetadata("fashion");

export default async function FashionPage() {
  return <CategoryPage mood="fashion" boards={await getPublicBoardsByMood("fashion")} />;
}
