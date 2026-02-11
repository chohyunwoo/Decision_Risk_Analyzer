"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function CheckoutCancelPage() {
  const t = useTranslations("Checkout");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            {t("cancelTitle")}
          </h1>
          <p className="mt-2 text-sm text-[#1e293b]/70">{t("cancelBody")}</p>
          <p className="mt-2 text-sm text-[#1e293b]/60">{t("cancelNote")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/api/polar/checkout?products=22e349c2-7a82-4082-8f5e-2debd5e31587"
              className="rounded-xl bg-[#1152d4] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1152d4]/20"
            >
              {t("retryButton")}
            </a>
            <button
              type="button"
              className="rounded-xl border border-[#1152d4]/20 px-4 py-2 text-sm font-semibold text-[#1152d4]"
              onClick={() => router.push("/")}
            >
              {t("homeButton")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
