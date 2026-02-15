"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

export default function CommunityNewPage() {
  const router = useRouter();
  const t = useTranslations("CommunityPage");
  const tCommon = useTranslations("Common");
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUserId(data.session?.user?.id ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      setError(t("loginRequiredBody"));
      return;
    }
    if (!title.trim()) {
      setError(t("titleRequired"));
      return;
    }
    if (!content.trim()) {
      setError(t("contentRequired"));
      return;
    }

    setSubmitting(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        title: title.trim(),
        content: content.trim()
      })
      .select("id")
      .single();

    if (insertError || !data?.id) {
      setError(t("saveError"));
      setSubmitting(false);
      return;
    }

    router.replace(`/community/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0ff,_#f8fafc_55%)] text-[#0f172a]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-24 pt-8">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
            {tCommon("appName")}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight">{t("newTitle")}</h1>
          <p className="text-sm text-slate-600">{t("newSubtitle")}</p>
        </header>

        {loading ? (
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{tCommon("processing")}</p>
          </section>
        ) : !userId ? (
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
          <form
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            onSubmit={handleSubmit}
          >
            <label className="grid gap-2 text-xs font-semibold text-slate-700">
              {t("titleLabel")}
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
                placeholder={t("titlePlaceholder")}
                maxLength={120}
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-slate-700">
              {t("contentLabel")}
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
                placeholder={t("contentPlaceholder")}
                maxLength={4000}
              />
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#1152d4] px-4 py-2 text-sm font-semibold text-white disabled:bg-[#1152d4]/60"
                disabled={submitting}
              >
                {submitting ? tCommon("processing") : t("submitButton")}
              </button>
              <Link
                href="/community"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {t("cancel")}
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
