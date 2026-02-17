import type { MetadataRoute } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL, languageAlternates, localePath } from "@/lib/seo";

const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/explore", changeFrequency: "daily", priority: 0.9 },
  { path: "/community", changeFrequency: "daily", priority: 0.9 },
  { path: "/trends", changeFrequency: "weekly", priority: 0.8 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/refund", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 }
];

type PostSitemapRow = {
  id: string;
  updated_at: string | null;
  created_at: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((route) => ({
      url: `${SITE_URL}${localePath("ko", route.path)}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: languageAlternates(route.path)
      }
    }));

  let posts: PostSitemapRow[] = [];
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("posts")
      .select("id,updated_at,created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    posts = (data as PostSitemapRow[] | null) ?? [];
  } catch {
    posts = [];
  }

  const dynamicPostEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const routePath = `/community/${post.id}`;
    return {
      url: `${SITE_URL}${localePath("ko", routePath)}`,
      lastModified: post.updated_at ?? post.created_at ?? now.toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: languageAlternates(routePath)
      }
    };
  });

  return [...staticEntries, ...dynamicPostEntries];
}
