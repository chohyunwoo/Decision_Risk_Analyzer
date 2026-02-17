import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { LocaleCookie } from "@/components/LocaleCookie";
import {
  SITE_NAME,
  SITE_URL,
  buildPageMetadata,
  getSiteDescription,
  normalizeLocale
} from "@/lib/seo";
import "../globals.css";

export const runtime = "edge";

const OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE ?? `${SITE_URL}/og.png`;

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);

  return {
    ...buildPageMetadata({
      locale: normalizedLocale,
      path: "/",
      pageKey: "home",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1
        }
      }
    }),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico"
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: getSiteDescription(normalizedLocale),
      url: `${SITE_URL}${normalizedLocale === "ko" ? "/" : `/${normalizedLocale}`}`,
      images: OG_IMAGE
        ? [
            {
              url: OG_IMAGE,
              width: 1200,
              height: 630,
              alt: SITE_NAME
            }
          ]
        : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: getSiteDescription(normalizedLocale),
      images: OG_IMAGE ? [OG_IMAGE] : undefined
    }
  };
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  const messages = await getMessages();
  const siteDescription = getSiteDescription(locale);

  return (
    <html lang={locale}>
      <body>
        <AnalyticsScripts gaId="G-G1QWJC7WQZ" clarityId="vgm3ujvbbf" />
        <Script id="ld-json-website" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            alternateName: "Decision Risk Analyzer",
            description: siteDescription,
            url: SITE_URL
          })}
        </Script>
        <Script id="ld-json-organization" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            alternateName: "Decision Risk Analyzer",
            url: SITE_URL
          })}
        </Script>
        <LocaleCookie locale={locale} />
        <CookieConsentBanner locale={locale} />
        <CookieSettingsButton locale={locale} />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
