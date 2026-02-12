"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

const emptyNotice = { type: "idle", message: "" } as const;

type Notice = typeof emptyNotice | { type: "error" | "success"; message: string };

type FormState = {
  loading: boolean;
  notice: Notice;
};

export default function SignupPage() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const [email, setEmail] = useState("");
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

    if (password !== confirmPassword) {
      setState({
        loading: false,
        notice: { type: "error", message: t("errorPasswordMismatch") }
      });
      return;
    }

    setState({ loading: true, notice: emptyNotice });
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setState({
        loading: false,
        notice: { type: "error", message: error.message }
      });
      return;
    }

    if (!data.session) {
      setState({
        loading: false,
        notice: {
          type: "success",
          message: t("signupSuccessVerify")
        }
      });
      return;
    }

    setState({
      loading: false,
      notice: { type: "success", message: t("signupSuccess") }
    });
  };

  const handleGoogleSignup = async () => {
    setOauthLoading(true);
    setState((prev) => ({ ...prev, notice: emptyNotice }));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google"
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
          {t("password")}
          <input
            type="password"
            className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="????????"
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
            placeholder="????????"
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
