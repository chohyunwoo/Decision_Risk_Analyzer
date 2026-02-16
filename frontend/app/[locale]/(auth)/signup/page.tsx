"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

const emptyNotice = { type: "idle", message: "" } as const;

type Notice = typeof emptyNotice | { type: "error" | "success"; message: string };

type FormState = {
  loading: boolean;
  notice: Notice;
};

export default function SignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<FormState>({
    loading: false,
    notice: emptyNotice
  });
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setState({
        loading: false,
        notice: { type: "error", message: t("errorMissingEmailPassword") }
      });
      return;
    }
    if (!nickname.trim()) {
      setState({
        loading: false,
        notice: { type: "error", message: t("errorMissingNickname") }
      });
      return;
    }

    if (password !== confirmPassword) {
      setState({
        loading: false,
        notice: { type: "error", message: t("errorPasswordMismatch") }
      });
      return;
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const localePrefix = locale === "ko" ? "" : `/${locale}`;
    const webLoginRedirectTo = `${siteUrl}${localePrefix}/login?verified=1`;
    const appLoginDeepLink = process.env.NEXT_PUBLIC_APP_LOGIN_DEEPLINK?.trim();
    const isNativeApp =
      typeof window !== "undefined" &&
      (!!(window as { ReactNativeWebView?: unknown }).ReactNativeWebView ||
        !!(window as { Capacitor?: unknown }).Capacitor);
    const loginRedirectTo =
      isNativeApp && appLoginDeepLink ? appLoginDeepLink : webLoginRedirectTo;

    setState({ loading: true, notice: emptyNotice });

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: loginRedirectTo,
        data: {
          nickname: nickname.trim()
        }
      }
    });

    if (error) {
      setState({
        loading: false,
        notice: { type: "error", message: error.message }
      });
      return;
    }

    // Supabase can return user without session/identities for already-registered emails.
    const identities = (data.user as { identities?: unknown[] } | null)?.identities;
    const looksLikeDuplicate =
      !data.session && Array.isArray(identities) && identities.length === 0;
    if (looksLikeDuplicate || !data.session) {
      setState({
        loading: false,
        notice: {
          type: "success",
          message: t("signupSuccessVerifyNeutral")
        }
      });
      return;
    }

    setState({
      loading: false,
      notice: { type: "success", message: t("signupSuccess") }
    });
    router.push("/");
  };

  const handleGoogleSignup = async () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const localePrefix = locale === "ko" ? "" : `/${locale}`;
    const homeRedirectTo = `${siteUrl}${localePrefix}/`;

    setOauthLoading(true);
    setState((prev) => ({ ...prev, notice: emptyNotice }));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: homeRedirectTo
      }
    });
    if (error) {
      setState((prev) => ({
        ...prev,
        notice: { type: "error", message: error.message }
      }));
      setOauthLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
      <header className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
          {tCommon("appName")}
        </p>
        <h1 className="text-2xl font-extrabold text-[#0f172a]">
          {t("signupTitle")}
        </h1>
        <p className="text-sm text-[#1e293b]/70">{t("signupSubtitle")}</p>
      </header>

      <form className="mt-6 grid gap-4" onSubmit={handleSignup}>
        <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
          {t("email")}
          <input
            type="email"
            className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
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
            autoComplete="nickname"
          />
        </label>

        <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
          {t("password")}
          <input
            type="password"
            className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("passwordPlaceholder")}
            autoComplete="new-password"
          />
        </label>

        <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
          {t("passwordConfirm")}
          <input
            type="password"
            className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={t("passwordConfirmPlaceholder")}
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-[#1152d4] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#1152d4]/60"
          disabled={state.loading}
        >
          {state.loading ? tCommon("processing") : t("signupButton")}
        </button>
      </form>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          className="rounded-xl border border-[#1152d4]/20 px-4 py-3 text-sm font-semibold text-[#1152d4] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:text-[#1152d4]/50"
          onClick={handleGoogleSignup}
          disabled={oauthLoading}
        >
          {oauthLoading ? tCommon("processing") : t("signupWithGoogle")}
        </button>
      </div>

      {state.notice.message && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            state.notice.type === "error"
              ? "bg-rose-50 text-rose-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.notice.message}
        </p>
      )}

      {state.notice.type === "success" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            className="inline-flex rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
            href="/login"
          >
            {t("loginButton")}
          </Link>
          <Link
            className="inline-flex rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
            href="/login"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-[#1e293b]/70">
        <span>
          {t("haveAccount")}{" "}
          <Link className="font-semibold text-[#1152d4]" href="/login">
            {t("loginButton")}
          </Link>
        </span>
        <Link className="text-[#1e293b]/50 hover:text-[#1e293b]" href="/">
          {tCommon("home")}
        </Link>
      </div>
    </section>
  );
}
