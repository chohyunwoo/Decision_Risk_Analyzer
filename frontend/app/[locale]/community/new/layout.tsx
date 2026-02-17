import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type CommunityNewLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: CommunityNewLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/community/new",
    pageKey: "community",
    robots: {
      index: false,
      follow: false
    }
  });
}

export default function CommunityNewLayout({ children }: CommunityNewLayoutProps) {
  return children;
}
