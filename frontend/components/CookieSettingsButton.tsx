"use client";

import { useMemo } from "react";

type CookieSettingsButtonProps = {
  locale: string;
};

const LABEL: Record<"ko" | "en" | "ja", string> = {
  ko: "쿠키 설정",
  en: "Cookie settings",
  ja: "Cookie settings"
};

export function CookieSettingsButton({ locale }: CookieSettingsButtonProps) {
  const key = useMemo(
    () => (locale === "en" || locale === "ja" ? locale : "ko"),
    [locale]
  );

  return (
    <button
      type="button"
      className="fixed bottom-4 right-4 z-[65] rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg"
      onClick={() => window.dispatchEvent(new Event("riskly-open-consent"))}
    >
      {LABEL[key]}
    </button>
  );
}
