import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type TrendsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: TrendsLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/trends",
    pageKey: "trends"
  });
}

export default function TrendsLayout({ children }: TrendsLayoutProps) {
  return children;
}
