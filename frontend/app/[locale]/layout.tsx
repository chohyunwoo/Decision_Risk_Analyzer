import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { LocaleCookie } from "@/components/LocaleCookie";
import "../globals.css";

export const runtime = "edge";
export const metadata: Metadata = {
  title: {
    default: "Riskly",
    template: "%s | Riskly"
  },
  description:
    "Decision Risk Analyzer helps you score everyday decision risk with clear, data-driven guidance.",
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
        <LocaleCookie locale={locale} />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
