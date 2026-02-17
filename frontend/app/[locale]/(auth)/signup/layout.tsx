import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type SignupLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: SignupLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/signup",
    pageKey: "home",
    robots: {
      index: false,
      follow: false
    }
  });
}

export default function SignupLayout({ children }: SignupLayoutProps) {
  return children;
}
