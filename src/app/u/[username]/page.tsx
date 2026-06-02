import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorProfileView } from "@/features/profile/components/CreatorProfileView";
import { getPublicProfile } from "@/lib/public-collection";
import { creatorProfileMetadata } from "@/lib/page-metadata";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "Creator not found" };
  return creatorProfileMetadata(data.profile);
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  return <CreatorProfileView profile={data.profile} boards={data.boards} />;
}
