import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type ExploreLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: ExploreLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/explore",
    pageKey: "explore"
  });
}

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  return children;
}
