import { AdSenseScript } from "@/components/ads/AdSenseScript";

export default function HomeCategoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
