import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type LoginLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: LoginLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/login",
    pageKey: "home",
    robots: {
      index: false,
      follow: false
    }
  });
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return children;
}
