export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Decision Risk Analyzer
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          빠르게 리스크를 비교하세요
        </h1>
        <p className="text-slate-600">
          식사 결정 전에 간단한 입력으로 리스크 점수를 확인합니다.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">메뉴/가게</label>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            placeholder="예: 김치찌개, 근처 맛집"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">예상 시간</label>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            placeholder="예: 30분"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">가격</label>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            placeholder="예: 12,000원"
          />
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
          Analyze
        </button>
      </section>

      <section className="grid gap-2 rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Risk Score</span>
          <span className="font-semibold text-slate-900">-</span>
        </div>
        <p>입력 후 리스크 점수와 설명이 표시됩니다.</p>
      </section>
    </main>
  );
}
