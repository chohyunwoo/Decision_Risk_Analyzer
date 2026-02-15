"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";

type PostItem = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
};

const PAGE_SIZE = 10;

export default function CommunityPage() {
  const router = useRouter();
  const t = useTranslations("CommunityPage");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const keyword = (searchParams.get("q") ?? "").trim();
  const sort = searchParams.get("sort") === "popular" ? "popular" : "latest";
  const periodRaw = searchParams.get("period");
  const period = periodRaw === "week" || periodRaw === "month" ? periodRaw : "all";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [queryInput, setQueryInput] = useState(keyword);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsSignedIn(!!data.session?.user?.id);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user?.id);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setQueryInput(keyword);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    const loadPosts = async () => {
      setLoading(true);
      setError("");
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("posts")
        .select("id,user_id,title,content,created_at,like_count", { count: "exact" })
        .range(from, to);

      const sanitizedKeyword = keyword.replace(/[(),]/g, " ").trim();
      if (sanitizedKeyword) {
        const pattern = `%${sanitizedKeyword}%`;
        query = query.or(`title.ilike.${pattern},content.ilike.${pattern}`);
      }

      if (period !== "all") {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - (period === "week" ? 7 : 30));
        query = query.gte("created_at", fromDate.toISOString());
      }

      if (sort === "popular") {
        query = query
          .order("like_count", { ascending: false })
          .order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error: selectError, count } = await query;

      if (!active) return;

      if (selectError) {
        setError(t("loadError"));
        setPosts([]);
        setTotalCount(0);
      } else {
        setPosts((data as PostItem[]) ?? []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    };

    loadPosts();
    return () => {
      active = false;
    };
  }, [keyword, page, period, sort, t]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount]
  );

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(value));

  const listHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (sort !== "latest") params.set("sort", sort);
    if (period !== "all") params.set("period", period);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/community?${query}` : "/community";
  };

  const applyQuery = (next: {
    q?: string;
    sort?: "latest" | "popular";
    period?: "all" | "week" | "month";
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextQ = (next.q ?? keyword).trim();
    const nextSort = next.sort ?? sort;
    const nextPeriod = next.period ?? period;
    const nextPage = next.page ?? page;

    if (nextQ) params.set("q", nextQ);
    else params.delete("q");

    if (nextSort !== "latest") params.set("sort", nextSort);
    else params.delete("sort");

    if (nextPeriod !== "all") params.set("period", nextPeriod);
    else params.delete("period");

    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");

    const nextQuery = params.toString();
    router.push(nextQuery ? `/community?${nextQuery}` : "/community");
  };

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

        <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">
            {t("pageLabel", { page, totalPages })}
          </p>
          {isSignedIn ? (
            <Link
              href="/community/new"
              className="rounded-full bg-[#1152d4] px-3 py-1.5 text-xs font-semibold text-white"
            >
              {t("writeButton")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[#1152d4]/20 px-3 py-1.5 text-xs font-semibold text-[#1152d4]"
            >
              {t("loginToWrite")}
            </Link>
          )}
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">{t("filtersTitle")}</h2>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              applyQuery({ q: queryInput, page: 1 });
            }}
          >
            <input
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {t("searchButton")}
            </button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs font-semibold text-slate-700">
              {t("sortLabel")}
              <select
                value={sort}
                onChange={(event) =>
                  applyQuery({
                    sort: event.target.value === "popular" ? "popular" : "latest",
                    page: 1
                  })
                }
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-[#1152d4]"
              >
                <option value="latest">{t("sortLatest")}</option>
                <option value="popular">{t("sortPopular")}</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-700">
              {t("periodLabel")}
              <select
                value={period}
                onChange={(event) => {
                  const value = event.target.value;
                  applyQuery({
                    period:
                      value === "week" || value === "month" ? value : "all",
                    page: 1
                  });
                }}
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-[#1152d4]"
              >
                <option value="all">{t("periodAll")}</option>
                <option value="week">{t("periodWeek")}</option>
                <option value="month">{t("periodMonth")}</option>
              </select>
            </label>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">{t("listTitle")}</h2>
          {loading ? (
            <p className="text-sm text-slate-500">{tCommon("processing")}</p>
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-slate-500">
              {keyword || sort !== "latest" || period !== "all"
                ? t("emptyFiltered")
                : t("empty")}
            </p>
          ) : (
            <div className="grid gap-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300"
                >
                  <p className="text-base font-semibold text-slate-800">{post.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{t("likes", { count: post.like_count ?? 0 })}</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <Link
            href={listHref(page - 1)}
            className={`rounded-full px-3 py-1.5 ${
              page <= 1
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "border border-slate-200 text-slate-700"
            }`}
          >
            {t("prev")}
          </Link>
          <span className="text-xs text-slate-500">
            {t("pageLabel", { page, totalPages })}
          </span>
          <Link
            href={listHref(page + 1)}
            className={`rounded-full px-3 py-1.5 ${
              page >= totalPages
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "border border-slate-200 text-slate-700"
            }`}
          >
            {t("next")}
          </Link>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1152d4]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 pb-6 pt-3 text-[10px] font-bold uppercase tracking-tight text-[#1e293b]/40">
          {[
            { label: tCommon("home"), href: "./", active: false },
            { label: tCommon("explore"), href: "./explore", active: false },
            { label: tCommon("community"), href: "./community", active: true },
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
