"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";

export default function TrendsPage() {
  const t = useTranslations("TrendsPage");
  const tCommon = useTranslations("Common");
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsSignedIn(!!data.session?.user?.id);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user?.id);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0ff,_#f8fafc_55%)] text-[#0f172a]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-24 pt-8">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
            {tCommon("appName")}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight">{t("title")}</h1>
          <p className="text-sm text-slate-600">{t("subtitle")}</p>
        </header>

        {authLoading ? (
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{tCommon("processing")}</p>
          </section>
        ) : !isSignedIn ? (
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-700">{t("loginRequiredTitle")}</h2>
            <p className="text-sm text-slate-600">{t("loginRequiredBody")}</p>
            <Link
              href="/login"
              className="w-fit rounded-full border border-[#1152d4]/20 px-3 py-1.5 text-xs font-semibold text-[#1152d4]"
            >
              {t("goToLogin")}
            </Link>
          </section>
        ) : (
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-700">{t("comingSoon")}</p>
          </section>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1152d4]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 pb-6 pt-3 text-[10px] font-bold uppercase tracking-tight text-[#1e293b]/40">
          {[
            { label: tCommon("home"), href: "./", active: false },
            { label: tCommon("explore"), href: "./explore", active: false },
            { label: tCommon("trends"), href: "./trends", active: true },
            { label: tCommon("profile"), href: "./profile", active: false }
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={item.active ? "text-[#1152d4]" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="mx-auto mb-4 h-1.5 w-32 rounded-full bg-[#1e293b]/10" />
      </div>
    </div>
  );
}
