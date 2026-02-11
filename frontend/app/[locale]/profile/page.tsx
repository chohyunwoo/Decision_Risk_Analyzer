"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

type Notice = { type: "error" | "success"; message: string } | null;

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data.user) {
        setEmail(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUserId(data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, name, nickname, role")
        .eq("id", data.user.id)
        .single();

      if (!active) return;

      if (profileError) {
        setEmail(data.user.email ?? null);
        setName("");
        setNickname("");
        setRole(null);
        setLoading(false);
        return;
      }

      setEmail(profile.email ?? data.user.email ?? null);
      setName(profile.name ?? "");
      setNickname(profile.nickname ?? "");
      setRole(profile.role ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    if (!userId) {
      setNotice({ type: "error", message: t("notSignedIn") });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        nickname: nickname.trim()
      })
      .eq("id", userId);

    if (error) {
      setNotice({ type: "error", message: error.message });
      setSaving(false);
      return;
    }

    setNotice({ type: "success", message: t("saveSuccess") });
    setSaving(false);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <nav className="sticky top-0 z-50 border-b border-[#1152d4]/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold leading-none text-[#1152d4]">
              DRA
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/60">
              Risk Analyzer
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-[#1152d4]/5 p-1 text-[10px] font-semibold">
              {[
                { code: "ko", label: "KR", href: "/" },
                { code: "en", label: "EN", href: "/en" },
                { code: "ja", label: "JA", href: "/ja" }
              ].map((lang) => {
                const active = locale === lang.code;
                return (
                  <a
                    key={lang.code}
                    href={lang.href}
                    className={`rounded-md px-2 py-0.5 ${
                      active
                        ? "bg-white text-[#1152d4] shadow-sm"
                        : "text-[#1e293b]/50"
                    }`}
                  >
                    {lang.label}
                  </a>
                );
              })}
            </div>
            <span className="text-[10px] font-semibold text-[#1e293b]/60">
              {loading
                ? tCommon("processing")
                : email
                ? tCommon("loggedInAs", { email })
                : tCommon("loggedOut")}
            </span>
            {!loading && !email ? (
              <>
                <a
                  href="./login"
                  className="min-w-[72px] rounded-lg border border-[#1152d4]/20 px-3 py-1.5 text-center text-sm font-semibold text-[#1152d4]"
                >
                  {tCommon("login")}
                </a>
                <a
                  href="./signup"
                  className="min-w-[84px] rounded-lg bg-[#1152d4] px-3 py-1.5 text-center text-sm font-semibold text-white"
                >
                  {tCommon("signup")}
                </a>
              </>
            ) : email ? (
              <button
                type="button"
                className="min-w-[84px] whitespace-nowrap rounded-lg border border-[#1152d4]/20 px-3 py-1.5 text-sm font-semibold text-[#1152d4]"
                onClick={handleSignOut}
                disabled={authLoading}
              >
                {authLoading ? tCommon("processing") : tCommon("logout")}
              </button>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        {loading && (
          <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
            <p className="text-sm text-[#1e293b]/70">
              {tCommon("processing")}
            </p>
          </section>
        )}

        {!loading && !email && (
          <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
            <h1 className="text-2xl font-extrabold text-[#0f172a]">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-[#1e293b]/70">
              {t("notSignedIn")}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-lg border border-[#1152d4]/20 px-4 py-2 text-sm font-semibold text-[#1152d4]"
            >
              {t("goToLogin")}
            </Link>
          </section>
        )}

        {!loading && email && (
          <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
            <header className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
                {tCommon("appName")}
              </p>
              <h1 className="text-2xl font-extrabold text-[#0f172a]">
                {t("title")}
              </h1>
              <p className="text-sm text-[#1e293b]/70">{t("subtitle")}</p>
            </header>

            <form className="mt-6 grid gap-4" onSubmit={handleSave}>
              <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("emailLabel")}
                <input
                  type="email"
                  className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm text-[#1e293b]/70"
                  value={email}
                  readOnly
                />
              </label>

              <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("nameLabel")}
                <input
                  type="text"
                  className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("namePlaceholder")}
                />
              </label>

              <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("nicknameLabel")}
                <input
                  type="text"
                  className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder={t("nicknamePlaceholder")}
                />
              </label>

              <div className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                <span>{t("roleLabel")}</span>
                <div className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm text-[#1e293b]/70">
                  {role ?? "user"}
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#1152d4] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#1152d4]/60"
                disabled={saving}
              >
                {saving ? tCommon("processing") : t("saveButton")}
              </button>
            </form>

            {notice && (
              <p
                className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                  notice.type === "error"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {notice.message}
              </p>
            )}

            {role === "admin" && (
              <a
                href="./admin"
                className="mt-4 inline-flex rounded-lg border border-[#1152d4]/20 px-4 py-2 text-sm font-semibold text-[#1152d4]"
              >
                {t("adminLink")}
              </a>
            )}
          </section>
        )}

        <div className="h-24" />
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1152d4]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 pb-6 pt-3 text-[10px] font-bold uppercase tracking-tight text-[#1e293b]/40">
          {[
            { label: tCommon("home"), href: "./", active: false },
            { label: tCommon("explore"), href: "#", active: false },
            { label: tCommon("trends"), href: "#", active: false },
            { label: tCommon("profile"), href: "./profile", active: true }
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
