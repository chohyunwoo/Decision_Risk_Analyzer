import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en", "ja"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false
});
