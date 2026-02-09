"use client";

import { useEffect, useMemo, useState } from "react";

type PriceLevel = "low" | "mid" | "high" | "";
type TimeOfDay = "off-peak" | "peak" | "";

const TRIAL_KEY = "dra_trial_count_v1";
const MAX_TRIALS = 3;

function computeRiskScore(url: string, price: PriceLevel, time: TimeOfDay) {
  let score = 0;

  if (url.trim().length > 0) {
    score += 20;
  }

  if (price === "low") score += 10;
  if (price === "mid") score += 30;
  if (price === "high") score += 50;

  if (time === "off-peak") score += 10;
  if (time === "peak") score += 30;

  return Math.min(score, 100);
}

function riskLabel(score: number) {
  if (score < 40) return "낮은 리스크";
  if (score < 70) return "보통 리스크";
  return "높은 리스크";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState<PriceLevel>("");
  const [time, setTime] = useState<TimeOfDay>("");
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

    if (!url.trim() || !price || !time) {
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

    setScore(computeRiskScore(url, price, time));
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
                URL
              </label>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                placeholder="예: https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                가격 수준
              </label>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                value={price}
                onChange={(event) => setPrice(event.target.value as PriceLevel)}
              >
                <option value="">선택</option>
                <option value="low">낮음</option>
                <option value="mid">중간</option>
                <option value="high">높음</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                시간대
              </label>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                value={time}
                onChange={(event) => setTime(event.target.value as TimeOfDay)}
              >
                <option value="">선택</option>
                <option value="off-peak">비수기</option>
                <option value="peak">피크</option>
              </select>
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
            가격과 시간대 가중치, 입력 URL 유무를 고정 가중치로 계산합니다.
          </p>
        </section>
      </div>
    </main>
  );
}
