import { AdSenseScript } from "@/components/ads/AdSenseScript";

export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
