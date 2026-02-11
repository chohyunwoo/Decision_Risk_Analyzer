export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        {children}
      </div>
    </main>
  );
}
