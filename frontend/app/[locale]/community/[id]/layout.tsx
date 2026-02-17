import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SITE_NAME, buildPageMetadata, localePath, normalizeLocale } from "@/lib/seo";

type CommunityDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
};

type PostSeoRow = {
  title: string | null;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function buildDescription(content: string | null): string {
  const normalized = (content ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "Riskly community post.";
  }
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157)}...`;
}

export async function generateMetadata({
  params
}: CommunityDetailLayoutProps): Promise<Metadata> {
  const { locale, id } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const routePath = `/community/${id}`;
  const baseMetadata = buildPageMetadata({
    locale: normalizedLocale,
    path: "/community",
    pageKey: "community"
  });

  let post: PostSeoRow | null = null;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("posts")
      .select("title,content,created_at,updated_at")
      .eq("id", id)
      .maybeSingle<PostSeoRow>();
    post = data ?? null;
  } catch {
    post = null;
  }

  const hasPost = !!post?.title;
  const title = hasPost ? `${post.title} | ${SITE_NAME}` : baseMetadata.title;
  const description = hasPost
    ? buildDescription(post.content)
    : baseMetadata.description;
  const publishedTime = post?.created_at ?? undefined;
  const modifiedTime = post?.updated_at ?? post?.created_at ?? undefined;

  return {
    ...baseMetadata,
    title,
    description,
    alternates: {
      canonical: localePath(normalizedLocale, routePath),
      languages: {
        ko: `/community/${id}`,
        en: `/en/community/${id}`,
        ja: `/ja/community/${id}`,
        "x-default": `/community/${id}`
      }
    },
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      title,
      description,
      publishedTime,
      modifiedTime
    },
    twitter: {
      ...baseMetadata.twitter,
      title: hasPost && post?.title ? post.title : undefined,
      description
    },
    robots: hasPost
      ? baseMetadata.robots
      : {
          index: false,
          follow: false
        }
  };
}

export default function CommunityDetailLayout({
  children
}: CommunityDetailLayoutProps) {
  return children;
}
