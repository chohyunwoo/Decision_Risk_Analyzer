"use client";

import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

const emptyNotice = { type: "idle", message: "" } as const;

type Notice = typeof emptyNotice | { type: "error" | "success"; message: string };

type AuthState = {
  email: string | null;
  loading: boolean;
  notice: Notice;
};

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState<AuthState>({
    email: null,
    loading: false,
    notice: emptyNotice
  });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuth((prev) => ({
        ...prev,
        email: data.session?.user?.email ?? null
      }));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth((prev) => ({
        ...prev,
        email: session?.user?.email ?? null
      }));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setAuth((prev) => ({
        ...prev,
        notice: { type: "error", message: t("errorMissingEmailPassword") }
      }));
      return;
    }

    setAuth((prev) => ({ ...prev, loading: true, notice: emptyNotice }));
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuth((prev) => ({
        ...prev,
        loading: false,
        notice: { type: "error", message: error.message }
      }));
      return;
    }

    setAuth((prev) => ({
      ...prev,
      loading: false,
      notice: { type: "success", message: t("loginSuccess") }
    }));
    router.push("/");
  };

  const handleSignOut = async () => {
    setAuth((prev) => ({ ...prev, loading: true, notice: emptyNotice }));
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuth((prev) => ({
        ...prev,
        loading: false,
        notice: { type: "error", message: error.message }
      }));
      return;
    }

    setAuth((prev) => ({
      ...prev,
      loading: false,
      notice: { type: "success", message: t("logoutSuccess") }
    }));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {tCommon("appName")}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("loginTitle")}
        </h1>
        <p className="text-sm text-slate-600">{t("loginSubtitle")}</p>
      </header>

      <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
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
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={auth.loading}
        >
          {auth.loading ? tCommon("processing") : t("loginButton")}
        </button>
      </form>

      {auth.notice.message && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            auth.notice.type === "error"
              ? "bg-rose-50 text-rose-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {auth.notice.message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <span>
          {t("noAccount")} {" "}
          <Link className="font-medium text-slate-900" href="/signup">
            {t("signupButton")}
          </Link>
        </span>
        <Link className="text-slate-500 hover:text-slate-700" href="/">
          {tCommon("home")}
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-600">
        <p className="font-medium text-slate-700">{t("currentSession")}</p>
        <p className="mt-1">
          {auth.email
            ? t("sessionLoggedIn", { email: auth.email })
            : t("sessionLoggedOut")}
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-400"
          onClick={handleSignOut}
          disabled={auth.loading || !auth.email}
        >
          {t("logoutButton")}
        </button>
      </div>
    </section>
  );
}
