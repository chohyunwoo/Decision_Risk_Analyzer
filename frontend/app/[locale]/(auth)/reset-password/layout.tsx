import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type ResetPasswordLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: ResetPasswordLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/reset-password",
    pageKey: "home",
    robots: {
      index: false,
      follow: false
    }
  });
}

export default function ResetPasswordLayout({
  children
}: ResetPasswordLayoutProps) {
  return children;
}
