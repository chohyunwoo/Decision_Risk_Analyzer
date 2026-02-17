import type { Metadata } from "next";
import { buildPageMetadata, localePath, normalizeLocale } from "@/lib/seo";

type CommunityDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params
}: CommunityDetailLayoutProps): Promise<Metadata> {
  const { locale, id } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const routePath = `/community/${id}`;

  return {
    ...buildPageMetadata({
      locale: normalizedLocale,
      path: "/community",
      pageKey: "community"
    }),
    alternates: {
      canonical: localePath(normalizedLocale, routePath),
      languages: {
        ko: `/community/${id}`,
        en: `/en/community/${id}`,
        ja: `/ja/community/${id}`,
        "x-default": `/community/${id}`
      }
    }
  };
}

export default function CommunityDetailLayout({
  children
}: CommunityDetailLayoutProps) {
  return children;
}
