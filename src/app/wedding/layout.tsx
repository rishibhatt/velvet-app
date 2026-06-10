import { AdSenseScript } from "@/components/ads/AdSenseScript";

export default function WeddingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
