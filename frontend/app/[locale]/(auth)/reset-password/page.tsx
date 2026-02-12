"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

const emptyNotice = { type: "idle", message: "" } as const;
type Notice = typeof emptyNotice | { type: "error" | "success"; message: string };

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(emptyNotice);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
    });
    return () => {
      active = false;
    };
  }, []);

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(emptyNotice);

    if (!hasSession) {
      setNotice({ type: "error", message: t("resetNoSession") });
      return;
    }
    if (!password || !confirmPassword) {
      setNotice({ type: "error", message: t("resetMissing") });
      return;
    }
    if (password !== confirmPassword) {
      setNotice({ type: "error", message: t("errorPasswordMismatch") });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setNotice({ type: "error", message: t("resetError") });
      setLoading(false);
      return;
    }
    setNotice({ type: "success", message: t("resetSuccess") });
    setLoading(false);
  };

  return (
    <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
      <header className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
          {tCommon("appName")}
        </p>
        <h1 className="text-2xl font-extrabold text-[#0f172a]">
          {t("resetTitle")}
        </h1>
        <p className="text-sm text-[#1e293b]/70">{t("resetSubtitle")}</p>
      </header>

      <form className="mt-6 grid gap-4" onSubmit={handleReset}>
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
          disabled={loading}
        >
          {loading ? tCommon("processing") : t("resetButton")}
        </button>
      </form>

      {notice.message && (
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
    </section>
  );
}
