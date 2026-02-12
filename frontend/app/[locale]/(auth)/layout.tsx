import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const tCommon = await getTranslations("Common");

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
        {children}
      </main>
      <div className="mx-auto w-full max-w-md px-6 pb-10">
        <section className="rounded-xl border border-[#1152d4]/10 bg-white/70 p-4 text-xs text-[#1e293b]/60">
          <p className="font-semibold text-[#1152d4]/70">
            {tCommon("disclaimerTitle")}
          </p>
          <p className="mt-2">{tCommon("disclaimerBody")}</p>
          <p className="mt-2">{tCommon("disclaimerNote")}</p>
        </section>
      </div>
    </div>
  );
}
