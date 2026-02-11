type AuthLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <nav className="sticky top-0 z-50 border-b border-[#1152d4]/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold leading-none text-[#1152d4]">
              DRA
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/60">
              Risk Analyzer
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-[#1152d4]/5 p-1 text-[10px] font-semibold">
              {[
                { code: "ko", label: "KR", href: "/" },
                { code: "en", label: "EN", href: "/en" },
                { code: "ja", label: "JA", href: "/ja" }
              ].map((lang) => {
                const active = locale === lang.code;
                return (
                  <a
                    key={lang.code}
                    href={lang.href}
                    className={`rounded-md px-2 py-0.5 ${
                      active
                        ? "bg-white text-[#1152d4] shadow-sm"
                        : "text-[#1e293b]/50"
                    }`}
                  >
                    {lang.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        {children}
      </main>
    </div>
  );
}
