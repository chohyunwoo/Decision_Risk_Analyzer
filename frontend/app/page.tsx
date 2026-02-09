"use client";

import { useEffect, useMemo, useState } from "react";

const TRIAL_KEY = "dra_trial_count_v1";
const MAX_TRIALS = 3;

function computeRiskScore(menu: string, priceValue: number, timeValue: number) {
  let score = 0;

  if (menu.trim().length > 0) {
    score += 20;
  }

  if (priceValue < 10000) score += 10;
  else if (priceValue < 30000) score += 30;
  else score += 50;

  if (timeValue < 20) score += 10;
  else if (timeValue < 60) score += 20;
  else score += 30;

  return Math.min(score, 100);
}

function riskLabel(score: number) {
  if (score < 40) return "낮은 리스크";
  if (score < 70) return "보통 리스크";
  return "높은 리스크";
}

export default function Home() {
  const [menu, setMenu] = useState("");
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [trialCount, setTrialCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(TRIAL_KEY);
    const parsed = stored ? Number.parseInt(stored, 10) : 0;
    setTrialCount(Number.isNaN(parsed) ? 0 : parsed);
  }, []);

  const remainingTrials = useMemo(
    () => Math.max(0, MAX_TRIALS - trialCount),
    [trialCount],
  );

  const handleAnalyze = () => {
    setMessage("");

    if (!menu.trim() || !price.trim() || !time.trim()) {
      setMessage("모든 항목을 입력해 주세요.");
      return;
    }

    if (trialCount >= MAX_TRIALS) {
      setMessage("무료 체험 3회가 모두 소진되었습니다.");
      return;
    }

    const nextCount = trialCount + 1;
    localStorage.setItem(TRIAL_KEY, String(nextCount));
    setTrialCount(nextCount);

    const priceValue = Number.parseInt(price, 10);
    const timeValue = Number.parseInt(time, 10);

    if (Number.isNaN(priceValue) || Number.isNaN(timeValue)) {
      setMessage("가격과 시간은 숫자로 입력해 주세요.");
      return;
    }

    setScore(computeRiskScore(menu, priceValue, timeValue));
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Decision Risk Analyzer
          </p>
          <h1 className="text-3xl font-semibold">결정 전에 리스크를 점검하세요</h1>
          <p className="text-slate-600">
            간단한 입력으로 현재 상황의 리스크 점수를 계산합니다.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleAnalyze();
            }}
          >
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                메뉴
              </label>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                placeholder="예: 김치찌개, 삼겹살, 파스타"
                value={menu}
                onChange={(event) => setMenu(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                가격 (원)
              </label>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="예: 12000"
                inputMode="numeric"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                예상 시간 (분)
              </label>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                placeholder="예: 30"
                inputMode="numeric"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Analyze
              </button>
              <span className="text-xs text-slate-500">
                무료 체험 잔여 {remainingTrials}회
              </span>
            </div>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {message}
            </p>
          )}
        </section>

        <section className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Risk Score</span>
            <span className="text-lg font-semibold text-slate-900">
              {score ?? "-"}
            </span>
          </div>
          <p className="text-base font-medium text-slate-800">
            {score === null ? "결과가 여기에 표시됩니다." : riskLabel(score)}
          </p>
          <p>
            가격과 시간 입력값 구간, 메뉴 입력 유무를 고정 가중치로 계산합니다.
          </p>
        </section>
      </div>
    </main>
  );
}
