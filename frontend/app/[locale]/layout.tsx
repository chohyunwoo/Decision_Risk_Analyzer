import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { LocaleCookie } from "@/components/LocaleCookie";
import "../globals.css";

export const runtime = "edge";

const SITE_NAME = "Riskly";
const SITE_DESCRIPTION =
  "Riskly? ???????? ????? ?? ???? ???? ????? ?? ?? ?????.";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riskly.store";
const OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE ?? `${SITE_URL}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  alternates: {
    languages: {
      ko: "/",
      en: "/en",
      ja: "/ja",
      "x-default": "/"
    }
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
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
    description: SITE_DESCRIPTION,
    images: OG_IMAGE ? [OG_IMAGE] : undefined
  },
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
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  }
};

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

  return (
    <html lang={locale}>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G1QWJC7WQZ"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G1QWJC7WQZ');
          `}
        </Script>
        <Script id="ld-json-website" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            alternateName: "Decision Risk Analyzer",
            description: SITE_DESCRIPTION,
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
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
