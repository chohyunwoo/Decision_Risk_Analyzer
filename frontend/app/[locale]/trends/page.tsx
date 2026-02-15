"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function TrendsPage() {
  const router = useRouter();
  const t = useTranslations("CommunityPage");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    router.replace("/community");
  }, [router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0ff,_#f8fafc_55%)] text-[#0f172a]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-24 pt-8">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
            {tCommon("appName")}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight">{t("title")}</h1>
          <p className="text-sm text-slate-600">{tCommon("processing")}</p>
        </header>
      </main>
    </div>
  );
}
