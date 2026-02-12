"use client";

import { useEffect } from "react";

type LocaleCookieProps = {
  locale: string;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function LocaleCookie({ locale }: LocaleCookieProps) {
  useEffect(() => {
    document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}`;
  }, [locale]);

  return null;
}
