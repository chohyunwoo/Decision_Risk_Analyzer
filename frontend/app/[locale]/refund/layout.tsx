import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type RefundLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params
}: RefundLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/refund",
    pageKey: "refund"
  });
}

export default function RefundLayout({ children }: RefundLayoutProps) {
  return children;
}
