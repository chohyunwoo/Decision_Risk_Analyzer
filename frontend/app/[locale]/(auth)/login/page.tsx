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
    <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
      <header className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
          {tCommon("appName")}
        </p>
        <h1 className="text-2xl font-extrabold text-[#0f172a]">
          {t("loginTitle")}
        </h1>
        <p className="text-sm text-[#1e293b]/70">{t("loginSubtitle")}</p>
      </header>

      <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
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
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-[#1152d4] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#1152d4]/60"
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-[#1e293b]/70">
        <span>
          {t("noAccount")}{" "}
          <Link className="font-semibold text-[#1152d4]" href="/signup">
            {t("signupButton")}
          </Link>
        </span>
        <Link className="text-[#1e293b]/50 hover:text-[#1e293b]" href="/">
          {tCommon("home")}
        </Link>
      </div>


    </section>
  );
}
