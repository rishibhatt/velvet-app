import { AdSenseScript } from "@/components/ads/AdSenseScript";

export default function LifestyleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
