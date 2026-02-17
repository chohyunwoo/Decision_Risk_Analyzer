import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type TermsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: TermsLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/terms",
    pageKey: "terms"
  });
}

export default function TermsLayout({ children }: TermsLayoutProps) {
  return children;
}
