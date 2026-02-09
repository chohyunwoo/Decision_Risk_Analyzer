"use client";

import { useEffect, useMemo, useState } from "react";

const TRIAL_KEY = "dra_trial_count_v1";
const RECORDS_KEY = "dra_records_v1";
const MAX_TRIALS = 3;

type RiskLabel = "낮은 리스크" | "보통 리스크" | "높은 리스크";

type DecisionRecord = {
  id: string;
  date: string;
  createdAt: number;
  menu: string;
  price: number;
  timeMinutes: number;
  riskScore: number;
  riskLabel: RiskLabel;
};

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildMonthGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return { year, month, cells };
}

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

function riskLabel(score: number): RiskLabel {
  if (score < 40) return "낮은 리스크";
  if (score < 70) return "보통 리스크";
  return "높은 리스크";
}

export default function Home() {
  const [menu, setMenu] = useState("");
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [label, setLabel] = useState<RiskLabel | null>(null);
  const [message, setMessage] = useState("");
  const [trialCount, setTrialCount] = useState(0);
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  useEffect(() => {
    const stored = localStorage.getItem(TRIAL_KEY);
    const parsed = stored ? Number.parseInt(stored, 10) : 0;
    setTrialCount(Number.isNaN(parsed) ? 0 : parsed);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(RECORDS_KEY);
    const parsed = stored ? (JSON.parse(stored) as DecisionRecord[]) : [];
    setRecords(Array.isArray(parsed) ? parsed : []);
  }, []);

  const remainingTrials = useMemo(
    () => Math.max(0, MAX_TRIALS - trialCount),
    [trialCount],
  );

  const groupedRecords = useMemo(() => {
    return records.reduce<Record<string, DecisionRecord[]>>((acc, record) => {
      if (!acc[record.date]) acc[record.date] = [];
      acc[record.date].push(record);
      return acc;
    }, {});
  }, [records]);

  const monthKey = useMemo(() => toMonthKey(currentMonth), [currentMonth]);

  const monthStats = useMemo(() => {
    const stats: Record<
      string,
      { totalSpend: number; avgRisk: number; count: number }
    > = {};

    Object.entries(groupedRecords).forEach(([date, items]) => {
      if (!date.startsWith(monthKey)) return;
      const totalSpend = items.reduce((sum, r) => sum + r.price, 0);
      const avgRisk = Math.round(
        items.reduce((sum, r) => sum + r.riskScore, 0) / items.length,
      );
      stats[date] = { totalSpend, avgRisk, count: items.length };
    });

    return stats;
  }, [groupedRecords, monthKey]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedRecords).sort((a, b) => (a < b ? 1 : -1));
  }, [groupedRecords]);

  const selectedRecords = useMemo(() => {
    if (!selectedDate) return [];
    return groupedRecords[selectedDate] ?? [];
  }, [groupedRecords, selectedDate]);

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);

    const recent = records.filter((record) => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= weekAgo && recordDate <= now;
    });

    if (recent.length === 0) {
      return { totalSpend: 0, avgRisk: 0, maxRisk: 0, count: 0 };
    }

    const totalSpend = recent.reduce((sum, r) => sum + r.price, 0);
    const totalRisk = recent.reduce((sum, r) => sum + r.riskScore, 0);
    const maxRisk = Math.max(...recent.map((r) => r.riskScore));

    return {
      totalSpend,
      avgRisk: Math.round(totalRisk / recent.length),
      maxRisk,
      count: recent.length,
    };
  }, [records]);

  const timelineData = useMemo(() => {
    const now = new Date();
    const days: Array<{
      date: string;
      label: string;
      avgRisk: number;
      count: number;
    }> = [];

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dateKey = formatLocalDate(day);
      const items = groupedRecords[dateKey] ?? [];
      const avgRisk =
        items.length === 0
          ? 0
          : Math.round(
              items.reduce((sum, r) => sum + r.riskScore, 0) / items.length,
            );
      days.push({
        date: dateKey,
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        avgRisk,
        count: items.length,
      });
    }

    return days;
  }, [groupedRecords]);

  const hasTimelineData = useMemo(
    () => timelineData.some((day) => day.count > 0),
    [timelineData],
  );

  const recentMenus = useMemo(() => {
    const unique: string[] = [];
    for (const record of records) {
      if (!unique.includes(record.menu)) {
        unique.push(record.menu);
      }
      if (unique.length >= 3) break;
    }
    return unique;
  }, [records]);

  const lastRecord = useMemo(() => records[0] ?? null, [records]);

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

    const computedScore = computeRiskScore(menu, priceValue, timeValue);
    const computedLabel = riskLabel(computedScore);

    const now = new Date();
    const record: DecisionRecord = {
      id: crypto.randomUUID(),
      date: formatLocalDate(now),
      createdAt: now.getTime(),
      menu: menu.trim(),
      price: priceValue,
      timeMinutes: timeValue,
      riskScore: computedScore,
      riskLabel: computedLabel,
    };

    const nextRecords = [record, ...records];
    localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
    setRecords(nextRecords);
    setSelectedDate(record.date);
    setScore(computedScore);
    setLabel(computedLabel);
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

          {recentMenus.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>최근 메뉴</span>
              {recentMenus.map((menuItem) => (
                <button
                  key={menuItem}
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-400"
                  onClick={() => setMenu(menuItem)}
                >
                  {menuItem}
                </button>
              ))}
            </div>
          )}

          {lastRecord && (
            <button
              type="button"
              className="mt-3 text-xs font-medium text-slate-600 underline-offset-4 hover:underline"
              onClick={() => {
                setMenu(lastRecord.menu);
                setPrice(String(lastRecord.price));
                setTime(String(lastRecord.timeMinutes));
              }}
            >
              마지막 입력 복사
            </button>
          )}

          {message && (
            <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {message}
            </p>
          )}
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">이번 주 요약</h2>
            <span className="text-xs text-slate-500">최근 7일</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">총 지출</p>
              <p className="text-lg font-semibold">
                {weeklySummary.totalSpend.toLocaleString()}원
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">평균 리스크</p>
              <p className="text-lg font-semibold">{weeklySummary.avgRisk}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">최고 리스크</p>
              <p className="text-lg font-semibold">{weeklySummary.maxRisk}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Risk Score</span>
            <span className="text-lg font-semibold text-slate-900">
              {score ?? "-"}
            </span>
          </div>
          <p className="text-base font-medium text-slate-800">
            {score === null ? "결과가 여기에 표시됩니다." : label}
          </p>
          <p>
            가격과 시간 입력값 구간, 메뉴 입력 유무를 고정 가중치로 계산합니다.
          </p>
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">리스크 타임라인</h2>
            <span className="text-xs text-slate-500">최근 7일</span>
          </div>
          {hasTimelineData ? (
            <div className="grid gap-2">
              <div className="flex items-end gap-2">
                {timelineData.map((day) => (
                  <div
                    key={day.date}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div className="flex h-24 w-full items-end justify-center">
                      <div
                        className="w-4 rounded-full bg-slate-900/80"
                        style={{
                          height: `${Math.max(8, day.avgRisk)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                평균 리스크가 높을수록 막대가 길어집니다.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              아직 기록이 없어 타임라인이 비어 있습니다.
            </p>
          )}
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">캘린더</h2>
              <p className="text-xs text-slate-500">
                날짜를 선택해 기록을 확인하세요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-400"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
              >
                이전
              </button>
              <span className="text-sm font-medium text-slate-700">
                {monthKey}
              </span>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-400"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
              >
                다음
              </button>
            </div>
          </div>
          {records.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              아직 기록이 없습니다. 분석을 실행하면 캘린더에 자동으로
              표시됩니다.
            </div>
          )}
          <div className="grid grid-cols-7 gap-2 text-xs text-slate-500">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {buildMonthGrid(currentMonth).cells.map((cell, index) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-20 rounded-xl border border-dashed border-slate-100 bg-slate-50/60"
                  />
                );
              }

              const dateKey = `${monthKey}-${String(cell).padStart(2, "0")}`;
              const stats = monthStats[dateKey];

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`flex h-20 flex-col items-start justify-between rounded-xl border px-2 py-2 text-left text-xs transition ${
                    selectedDate === dateKey
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                  onClick={() => setSelectedDate(dateKey)}
                >
                  <span className="text-xs font-semibold">{cell}</span>
                  {stats ? (
                    <div className="text-[10px]">
                      <p>
                        {stats.totalSpend.toLocaleString()}원
                      </p>
                      <p>리스크 {stats.avgRisk}</p>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">기록 없음</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">기록</h2>
            <span className="text-xs text-slate-500">
              {records.length}건
            </span>
          </div>

          {sortedDates.length === 0 ? (
            <p className="text-sm text-slate-500">
              아직 기록이 없습니다. 분석을 실행하면 자동으로 저장됩니다.
            </p>
          ) : (
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {sortedDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      selectedDate === date
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {date}
                  </button>
                ))}
              </div>

              {selectedDate && (
                <div className="grid gap-2">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {selectedDate} 기록
                  </h3>
                  <div className="grid gap-2">
                    {selectedRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {record.menu}
                          </span>
                          <span className="text-xs text-slate-500">
                            {record.price.toLocaleString()}원 ·{" "}
                            {record.timeMinutes}분
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">리스크</p>
                          <p className="font-semibold text-slate-900">
                            {record.riskLabel}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
