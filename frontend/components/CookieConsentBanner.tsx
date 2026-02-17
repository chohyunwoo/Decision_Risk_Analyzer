"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  oneYearSeconds,
  type ConsentStatus
} from "@/lib/consent";

type CookieConsentBannerProps = {
  locale: string;
};

type Copy = {
  title: string;
  body: string;
  accept: string;
  deny: string;
  privacy: string;
};

const COPY: Record<"ko" | "en" | "ja", Copy> = {
  ko: {
    title: "분석 쿠키 사용 동의",
    body: "서비스 개선을 위해 Google Analytics 및 Microsoft Clarity를 사용할 수 있습니다. 동의는 언제든 철회할 수 있습니다.",
    accept: "동의",
    deny: "거부",
    privacy: "개인정보처리방침"
  },
  en: {
    title: "Consent for analytics cookies",
    body: "We use Google Analytics and Microsoft Clarity to improve the service. You can change this choice at any time.",
    accept: "Accept",
    deny: "Decline",
    privacy: "Privacy Policy"
  },
  ja: {
    title: "分析クッキーの同意",
    body: "サービス改善のため、Google Analytics と Microsoft Clarity を使用します。選択はいつでも変更できます。",
    accept: "同意する",
    deny: "拒否する",
    privacy: "プライバシーポリシー"
  }
};

function readConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (saved === "granted" || saved === "denied") return saved;
  return null;
}

export function CookieConsentBanner({ locale }: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);
  const key = locale === "en" || locale === "ja" ? locale : "ko";
  const copy = COPY[key];
  const privacyHref = useMemo(
    () => (key === "ko" ? "/privacy" : `/${key}/privacy`),
    [key]
  );

  useEffect(() => {
    setVisible(readConsent() === null);
    const open = () => setVisible(true);
    window.addEventListener("riskly-open-consent", open);
    return () => {
      window.removeEventListener("riskly-open-consent", open);
    };
  }, []);

  const updateConsent = (status: ConsentStatus) => {
    const maxAge = oneYearSeconds();
    window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
    document.cookie = `${CONSENT_COOKIE_NAME}=${status}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    window.dispatchEvent(new Event("riskly-consent-changed"));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] w-[min(92vw,52rem)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
      <p className="text-sm font-semibold text-slate-900">{copy.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{copy.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-lg bg-[#1152d4] px-3 py-1.5 text-xs font-semibold text-white"
          onClick={() => updateConsent("granted")}
        >
          {copy.accept}
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          onClick={() => updateConsent("denied")}
        >
          {copy.deny}
        </button>
        <a
          href={privacyHref}
          className="text-xs font-semibold text-[#1152d4] underline underline-offset-2"
        >
          {copy.privacy}
        </a>
      </div>
    </div>
  );
}
