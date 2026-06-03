import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorProfileView } from "@/features/profile/components/CreatorProfileView";
import { getPublicProfile } from "@/lib/public-collection";
import { profileMetadata } from "@/lib/seo/metadata";
import { JsonLd, profileSchema } from "@/lib/seo/schema";
import { TrackOnMount } from "@/components/analytics/TrackOnMount";
import { ANALYTICS_EVENTS } from "@/lib/analytics";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "Creator not found" };
  return profileMetadata(data.profile);
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  return (
    <>
      <JsonLd data={profileSchema(data.profile, data.boards.length)} />
      <TrackOnMount
        event={ANALYTICS_EVENTS.PROFILE_VIEWED}
        properties={{
          profile_id: data.profile.id,
          username: data.profile.username,
        }}
      />
      <CreatorProfileView profile={data.profile} boards={data.boards} />
    </>
  );
}
