"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

type PostDetail = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
};

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const t = useTranslations("CommunityPage");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const postId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [post, setPost] = useState<PostDetail | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [likedByViewer, setLikedByViewer] = useState(false);
  const [liking, setLiking] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const isOwner = !!viewerId && viewerId === post?.user_id;

  const loadPost = async () => {
    if (!postId) return;
    const { data, error: selectError } = await supabase
      .from("posts")
      .select("id,user_id,title,content,created_at,like_count")
      .eq("id", postId)
      .single();

    if (selectError || !data) {
      setPost(null);
      setError(t("notFoundBody"));
      return;
    }

    const nextPost = data as PostDetail;
    setPost(nextPost);
    setEditTitle(nextPost.title);
    setEditContent(nextPost.content);
    setError("");
  };

  const loadLikeStatus = async () => {
    if (!postId || !viewerId) {
      setLikedByViewer(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setLikedByViewer(false);
      return;
    }

    const response = await fetch(
      `/api/community/like?postId=${encodeURIComponent(postId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      setLikedByViewer(false);
      return;
    }

    const payload = (await response.json()) as { liked?: boolean };
    setLikedByViewer(!!payload.liked);
  };

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setViewerId(data.session?.user?.id ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setViewerId(session?.user?.id ?? null);
    });

    loadPost().finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [postId]);

  useEffect(() => {
    loadLikeStatus();
  }, [postId, viewerId]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));

  const handleLike = async () => {
    if (!viewerId) {
      setError(t("loginRequiredBody"));
      return;
    }
    if (!post || likedByViewer || liking) return;

    setLiking(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError(t("saveError"));
        return;
      }

      const response = await fetch("/api/community/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ postId: post.id })
      });

      if (!response.ok) {
        setError(t("saveError"));
        return;
      }

      const payload = (await response.json()) as {
        likeCount?: number;
        alreadyLiked?: boolean;
      };

      if (payload.alreadyLiked) {
        setLikedByViewer(true);
        setError(t("alreadyLiked"));
        return;
      }

      setPost((prev) => {
        if (!prev) return prev;
        return { ...prev, like_count: payload.likeCount ?? prev.like_count };
      });
      setLikedByViewer(true);
      setError("");
    } catch {
      setError(t("saveError"));
    } finally {
      setLiking(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!post || !isOwner) return;
    if (!editTitle.trim()) {
      setError(t("titleRequired"));
      return;
    }
    if (!editContent.trim()) {
      setError(t("contentRequired"));
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: editTitle.trim(),
        content: editContent.trim()
      })
      .eq("id", post.id)
      .eq("user_id", viewerId);

    if (updateError) {
      setError(t("saveError"));
      setSaving(false);
      return;
    }

    await loadPost();
    setEditMode(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!post || !isOwner) return;
    if (!window.confirm(t("deleteConfirm"))) return;

    setSaving(true);
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id)
      .eq("user_id", viewerId);

    if (deleteError) {
      setError(t("saveError"));
      setSaving(false);
      return;
    }

    router.replace("/community");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0ff,_#f8fafc_55%)] text-[#0f172a]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-24 pt-8">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
            {tCommon("appName")}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight">{t("detailTitle")}</h1>
        </header>

        <Link
          href="/community"
          className="w-fit rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          {t("backToList")}
        </Link>

        {loading ? (
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{tCommon("processing")}</p>
          </section>
        ) : !post ? (
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-700">{t("notFound")}</h2>
            <p className="text-sm text-slate-600">{t("notFoundBody")}</p>
          </section>
        ) : (
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            {editMode ? (
              <>
                <label className="grid gap-2 text-xs font-semibold text-slate-700">
                  {t("titleLabel")}
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
                    maxLength={120}
                  />
                </label>
                <label className="grid gap-2 text-xs font-semibold text-slate-700">
                  {t("contentLabel")}
                  <textarea
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    className="min-h-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
                    maxLength={4000}
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="rounded-lg bg-[#1152d4] px-4 py-2 text-sm font-semibold text-white disabled:bg-[#1152d4]/60"
                  >
                    {saving ? tCommon("processing") : t("saveButton")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900">{post.title}</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatDate(post.created_at)}</span>
                  <span>{t("likes", { count: post.like_count ?? 0 })}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    onClick={handleLike}
                    disabled={!viewerId || likedByViewer || liking}
                  >
                    {likedByViewer ? t("likedButton") : t("likeButton")}
                  </button>
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        onClick={() => setEditMode(true)}
                      >
                        {t("editButton")}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                        onClick={handleDelete}
                        disabled={saving}
                      >
                        {t("deleteButton")}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </section>
        )}
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
