import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type CommunityLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: CommunityLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/community",
    pageKey: "community"
  });
}

export default function CommunityLayout({ children }: CommunityLayoutProps) {
  return children;
}
