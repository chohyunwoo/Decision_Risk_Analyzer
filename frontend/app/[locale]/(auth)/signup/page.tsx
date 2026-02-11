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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {tCommon("appName")}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("signupTitle")}
        </h1>
        <p className="text-sm text-slate-600">{t("signupSubtitle")}</p>
      </header>

      <form className="mt-6 grid gap-4" onSubmit={handleSignup}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          {t("email")}
          <input
            type="email"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          {t("password")}
          <input
            type="password"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="????????"
            autoComplete="new-password"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          {t("passwordConfirm")}
          <input
            type="password"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="????????"
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={state.loading}
        >
          {state.loading ? tCommon("processing") : t("signupButton")}
        </button>
      </form>

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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <span>
          {t("haveAccount")} {" "}
          <Link className="font-medium text-slate-900" href="/login">
            {t("loginButton")}
          </Link>
        </span>
        <Link className="text-slate-500 hover:text-slate-700" href="/">
          {tCommon("home")}
        </Link>
      </div>
    </section>
  );
}
