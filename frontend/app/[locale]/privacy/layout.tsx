import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type PrivacyLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: PrivacyLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/privacy",
    pageKey: "privacy"
  });
}

export default function PrivacyLayout({ children }: PrivacyLayoutProps) {
  return children;
}
