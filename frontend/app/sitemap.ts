import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riskly.store";

const LOCALES = ["ko", "en", "ja"] as const;

const ROUTES = ["/", "/community", "/login", "/signup", "/terms", "/refund", "/privacy"];

function buildLocalePath(locale: string, route: string) {
  if (locale === "ko") return route;
  return route === "/" ? `/${locale}` : `/${locale}${route}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${SITE_URL}${buildLocalePath(locale, route)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.6
    }))
  );

  return entries;
}
