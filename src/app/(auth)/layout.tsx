import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = noIndexMetadata("Authentication");

export default function AuthRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
