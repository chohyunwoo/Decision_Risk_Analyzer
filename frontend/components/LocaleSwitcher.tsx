"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const LOCALES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" }
] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Common");

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className="uppercase tracking-[0.2em]">{t("language")}</span>
      <div className="flex items-center gap-1">
        {LOCALES.map((item) => (
          <Link
            key={item.code}
            href={pathname}
            locale={item.code}
            className={`rounded-full border px-2 py-1 transition ${
              locale === item.code
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
            aria-current={locale === item.code ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}