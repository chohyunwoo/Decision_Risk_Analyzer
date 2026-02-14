"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";

type Notice = { type: "error" | "success"; message: string } | null;

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data.user) {
        setEmail(null);
        setRole(null);
        setPlan(null);
        setAuthProvider(null);
        setLoading(false);
        return;
      }
      const provider =
        data.user.app_metadata?.provider ??
        data.user.identities?.[0]?.provider ??
        null;
      setAuthProvider(provider);

      setUserId(data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, name, nickname, role, plan")
        .eq("id", data.user.id)
        .single();

      if (!active) return;

      if (profileError) {
        setEmail(data.user.email ?? null);
        setName("");
        setNickname("");
        setRole(null);
        setPlan("free");
        setLoading(false);
        return;
      }

      setEmail(profile.email ?? data.user.email ?? null);
      setName(profile.name ?? "");
      setNickname(profile.nickname ?? "");
      setRole(profile.role ?? null);
      setPlan(profile.plan === "pro" ? "pro" : "free");
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
      setAuthLoading(false);
      return;
    }
    setUserId(null);
    setEmail(null);
    setName("");
    setNickname("");
    setRole(null);
    setPlan(null);
    setLoading(false);
    setAuthLoading(false);
    router.replace("/");
  };

  const handleManageSubscription = async () => {
    setManageLoading(true);
    setNotice(null);
    if (plan !== "pro") {
      setNotice({ type: "error", message: t("manageSubscriptionNoPlan") });
      setManageLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setNotice({ type: "error", message: t("manageSubscriptionError") });
      setManageLoading(false);
      return;
    }
    const response = await fetch("/api/polar/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      setNotice({ type: "error", message: t("manageSubscriptionError") });
      setManageLoading(false);
      return;
    }
    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      setNotice({ type: "error", message: t("manageSubscriptionError") });
      setManageLoading(false);
      return;
    }
    window.location.href = payload.url;
  };

  const handleResetPassword = async () => {
    if (authProvider && authProvider !== "email") {
      setNotice({ type: "error", message: t("passwordProviderLocked") });
      return;
    }
    if (!newPassword || !confirmNewPassword) {
      setNotice({ type: "error", message: t("resetPasswordError") });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNotice({ type: "error", message: t("errorPasswordMismatch") });
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) {
      setNotice({ type: "error", message: t("resetPasswordError") });
      return;
    }
    setNewPassword("");
    setConfirmNewPassword("");
    setNotice({ type: "success", message: t("resetPasswordSuccess") });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("deleteAccountConfirm"));
    if (!confirmed) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setNotice({ type: "error", message: t("deleteAccountError") });
      return;
    }
    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      setNotice({ type: "error", message: t("deleteAccountError") });
      return;
    }
    await supabase.auth.signOut();
    setNotice({ type: "success", message: t("deleteAccountSuccess") });
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <nav className="sticky top-0 z-50 border-b border-[#1152d4]/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-extrabold leading-none text-[#1152d4]">
              DRA
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/60">
              Risk Analyzer
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-[#1e293b]/60">
              {loading
                ? tCommon("processing")
                : email
                ? tCommon("loggedInAs", {
                    name: nickname?.trim() || name?.trim() || email
                  })
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

              <button
                type="submit"
                className="rounded-xl bg-[#1152d4] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#1152d4]/60"
                disabled={saving}
              >
                {saving ? tCommon("processing") : t("saveButton")}
              </button>
            </form>

            <section className="mt-8 grid gap-4">
              <div className="rounded-xl border border-[#1152d4]/10 bg-white p-4">
                <h2 className="text-sm font-semibold text-[#0f172a]">
                  {t("subscriptionTitle")}
                </h2>
                <p className="mt-1 text-xs text-[#1e293b]/60">
                  {plan === "pro"
                    ? t("subscriptionActive")
                    : t("subscriptionInactive")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#1152d4]/20 px-3 py-2 text-xs font-semibold text-[#1152d4]"
                    onClick={handleManageSubscription}
                    disabled={manageLoading}
                  >
                    {manageLoading
                      ? tCommon("processing")
                      : t("manageSubscriptionButton")}
                  </button>
                  {plan !== "pro" && (
                    <Link
                      href="/"
                      className="rounded-lg bg-[#1152d4] px-3 py-2 text-xs font-semibold text-white"
                    >
                      {t("upgradeToProButton")}
                    </Link>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-[#1152d4]/10 bg-white p-4">
                <h2 className="text-sm font-semibold text-[#0f172a]">
                  {t("resetPasswordTitle")}
                </h2>
                <p className="mt-1 text-xs text-[#1e293b]/60">
                  {t("resetPasswordDescription")}
                </p>
                {authProvider && authProvider !== "email" && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">
                    {t("passwordProviderLocked")}
                  </p>
                )}
                {(!authProvider || authProvider === "email") && (
                  <div className="mt-4 grid gap-3">
                    <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                      {t("newPasswordLabel")}
                      <input
                        type="password"
                        className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder={t("passwordPlaceholder")}
                        autoComplete="new-password"
                      />
                    </label>
                    <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                      {t("newPasswordConfirmLabel")}
                      <input
                        type="password"
                        className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                        value={confirmNewPassword}
                        onChange={(event) =>
                          setConfirmNewPassword(event.target.value)
                        }
                        placeholder={t("passwordConfirmPlaceholder")}
                        autoComplete="new-password"
                      />
                    </label>
                    <button
                      type="button"
                      className="rounded-lg border border-[#1152d4]/20 px-3 py-2 text-xs font-semibold text-[#1152d4]"
                      onClick={handleResetPassword}
                    >
                      {t("changePasswordButton")}
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <h2 className="text-sm font-semibold text-rose-700">
                  {t("deleteAccountTitle")}
                </h2>
                <p className="mt-1 text-xs text-rose-700/80">
                  {t("deleteAccountDescription")}
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                  onClick={handleDeleteAccount}
                >
                  {t("deleteAccountButton")}
                </button>
              </div>
            </section>

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
            { label: tCommon("explore"), href: "./explore", active: false },
            { label: tCommon("trends"), href: "./trends", active: false },
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
