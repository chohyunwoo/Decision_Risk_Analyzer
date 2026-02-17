import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type CommunityReportLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: CommunityReportLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/community/report",
    pageKey: "community",
    robots: {
      index: false,
      follow: false
    }
  });
}

export default function CommunityReportLayout({
  children
}: CommunityReportLayoutProps) {
  return children;
}
