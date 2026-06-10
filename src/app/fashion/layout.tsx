import { AdSenseScript } from "@/components/ads/AdSenseScript";

export default function FashionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
