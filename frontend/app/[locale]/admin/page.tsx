"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";

type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  nickname: string | null;
  role: "user" | "admin";
  created_at: string | null;
};

export default function AdminPage() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError(t("accessDenied"));
      setLoading(false);
      return;
    }
    const response = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      setError(t("accessDenied"));
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as { users?: AdminUser[] };
    setUsers(payload.users ?? []);
    setLoading(false);
  };

  const handleRoleChange = async (id: string, role: "user" | "admin") => {
    setSavingId(id);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setSavingId(null);
      return;
    }
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id, role })
    });
    if (!response.ok) {
      setSavingId(null);
      return;
    }
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role } : user)),
    );
    setSavingId(null);
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
            {tCommon("appName")}
          </p>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            {t("title")}
          </h1>
          <p className="text-sm text-[#1e293b]/70">{t("subtitle")}</p>
        </header>

        {loading && (
          <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
            <p className="text-sm text-[#1e293b]/70">{tCommon("processing")}</p>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
            <p className="text-sm text-rose-600">{error}</p>
          </section>
        )}

        {!loading && !error && (
          <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
            <div className="grid gap-3 text-[11px] font-semibold uppercase tracking-widest text-[#1152d4]">
              <div className="grid grid-cols-4 gap-3 text-[10px] text-[#1e293b]/50">
                <span>{t("email")}</span>
                <span>{t("name")}</span>
                <span>{t("nickname")}</span>
                <span>{t("role")}</span>
              </div>
              <div className="grid gap-3 text-sm text-[#1e293b]">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-4 gap-3 rounded-lg bg-[#f6f6f8] px-3 py-2 text-xs text-[#1e293b]/80"
                  >
                    <span className="truncate">{user.email ?? "-"}</span>
                    <span className="truncate">{user.name ?? "-"}</span>
                    <span className="truncate">{user.nickname ?? "-"}</span>
                    <select
                      className="rounded-md border border-[#1152d4]/20 bg-white px-2 py-1 text-xs font-semibold text-[#1152d4]"
                      value={user.role}
                      onChange={(event) =>
                        handleRoleChange(
                          user.id,
                          event.target.value as "user" | "admin",
                        )
                      }
                      disabled={savingId === user.id}
                    >
                      <option value="user">{t("roleUser")}</option>
                      <option value="admin">{t("roleAdmin")}</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
