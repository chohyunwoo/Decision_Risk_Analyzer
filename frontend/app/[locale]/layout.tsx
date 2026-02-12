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
  "Riskly는 가격·시간·인원 입력만으로 일상 의사결정 리스크를 점수화하는 결정 지원 도구입니다.";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riskly.store";
const OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE ?? `${SITE_URL}/og.png`;
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

const verification: Metadata["verification"] = {};
if (GOOGLE_VERIFICATION) {
  verification.google = GOOGLE_VERIFICATION;
}
if (NAVER_VERIFICATION) {
  verification.other = { "naver-site-verification": NAVER_VERIFICATION };
}

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
  verification:
    Object.keys(verification).length > 0 ? verification : undefined,
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
