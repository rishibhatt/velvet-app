import { CategoryPage } from "@/components/seo/CategoryPage";
import { getPublicBoardsByMood } from "@/lib/public-collection";
import { categoryMetadata } from "@/lib/seo/metadata";

export const metadata = categoryMetadata("travel");

export default async function TravelPage() {
  return <CategoryPage mood="travel" boards={await getPublicBoardsByMood("travel")} />;
}
