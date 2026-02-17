import type { MetadataRoute } from "next";
import { LOCALES, SITE_URL, languageAlternates, localePath } from "@/lib/seo";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => {
    const normalizedLocale = locale;
    return ROUTES.map((route) => ({
      url: `${SITE_URL}${localePath(normalizedLocale, route.path)}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: languageAlternates(route.path)
      }
    }));
  });

  return entries;
}
