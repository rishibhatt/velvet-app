import { AdSenseScript } from "@/components/ads/AdSenseScript";

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
