"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  type ConsentStatus
} from "@/lib/consent";

type AnalyticsScriptsProps = {
  gaId: string;
  clarityId: string;
};

function readConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (saved === "granted" || saved === "denied") return saved;

  const matched = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!matched) return null;

  const value = matched.split("=")[1];
  if (value === "granted" || value === "denied") return value;
  return null;
}

export function AnalyticsScripts({ gaId, clarityId }: AnalyticsScriptsProps) {
  const [consent, setConsent] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    const update = () => setConsent(readConsent());
    update();
    window.addEventListener("riskly-consent-changed", update);
    return () => {
      window.removeEventListener("riskly-consent-changed", update);
    };
  }, []);

  if (consent !== "granted") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
      <Script id="clarity-init" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");
        `}
      </Script>
    </>
  );
}
