"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const RECORDS_KEY = "dra_records_v1";
const POLAR_PRODUCT_ID = "22e349c2-7a82-4082-8f5e-2debd5e31587";

type RiskLabelKey = "low" | "medium" | "high";

type Region = "KR" | "US" | "JP";

type DecisionRecord = {
  id: string;
  date: string;
  createdAt: number;
  menu: string;
  price: number;
  people: number;
  timeMinutes: number | null;
  region: Region;
  riskScore: number;
  riskLabelKey: RiskLabelKey;
};

const REGION_CONFIG: Record<
  Region,
  {
    labelKey: "regionKR" | "regionUS" | "regionJP";
    baseOrderAmount: number;
    currency: "KRW" | "USD" | "JPY";
    pricePlaceholderKey:
      | "pricePlaceholderKR"
      | "pricePlaceholderUS"
      | "pricePlaceholderJP";
  }
> = {
  KR: {
    labelKey: "regionKR",
    baseOrderAmount: 26216,
    currency: "KRW",
    pricePlaceholderKey: "pricePlaceholderKR"
  },
  US: {
    labelKey: "regionUS",
    baseOrderAmount: 31.09,
    currency: "USD",
    pricePlaceholderKey: "pricePlaceholderUS"
  },
  JP: {
    labelKey: "regionJP",
    baseOrderAmount: 1500,
    currency: "JPY",
    pricePlaceholderKey: "pricePlaceholderJP"
  }
};

const PRICE_WEIGHT = 0.5;
const TIME_WEIGHT = 0.3;
const PEOPLE_WEIGHT = 0.2;

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

function formatCurrency(amount: number, region: Region, locale: string) {
  const currency =
    region === "US" ? "USD" : region === "JP" ? "JPY" : "KRW";
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: region === "US" ? 2 : 0
  });

  return formatter.format(amount);
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

function getPriceBandScore(perPersonPrice: number, baseOrderAmount: number) {
  const lowThreshold = baseOrderAmount * 0.8;
  const highThreshold = baseOrderAmount * 1.2;

  if (perPersonPrice < lowThreshold) return 20;
  if (perPersonPrice < highThreshold) return 50;
  return 80;
}

function getTimeBandScore(timeMinutes: number) {
  if (timeMinutes < 20) return 20;
  if (timeMinutes < 60) return 50;
  return 80;
}

function getPeopleBandScore(people: number) {
  if (people <= 1) return 20;
  if (people <= 2) return 40;
  if (people <= 4) return 60;
  return 80;
}

function computeRiskScore(
  priceValue: number,
  timeValue: number,
  people: number,
  baseOrderAmount: number
) {
  const safePeople = Math.max(1, people);
  const perPersonPrice = priceValue / safePeople;
  const priceScore = getPriceBandScore(perPersonPrice, baseOrderAmount);
  const timeScore = getTimeBandScore(timeValue);
  const peopleScore = getPeopleBandScore(safePeople);
  const total = Math.round(
    priceScore * PRICE_WEIGHT +
      timeScore * TIME_WEIGHT +
      peopleScore * PEOPLE_WEIGHT
  );

  return Math.min(Math.max(total, 0), 100);
}

function riskLabelKey(score: number): RiskLabelKey {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

function normalizeRiskLabelKey(value: unknown, score: number): RiskLabelKey {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  if (typeof value === "string") {
    const lowered = value.toLowerCase();
    if (lowered.includes("low")) return "low";
    if (lowered.includes("medium")) return "medium";
    if (lowered.includes("high")) return "high";
  }
  return riskLabelKey(score);
}

export default function Home() {
  const t = useTranslations("HomePage");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [menu, setMenu] = useState("");
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("1");
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>("KR");
  const [score, setScore] = useState<number | null>(null);
  const [labelKey, setLabelKey] = useState<RiskLabelKey | null>(null);
  const [message, setMessage] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [weeklyAiText, setWeeklyAiText] = useState("");
  const [weeklyAiLoading, setWeeklyAiLoading] = useState(false);
  const [weeklyAiError, setWeeklyAiError] = useState<string | null>(null);
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    const loadProfile = async (userId: string | null | undefined) => {
      if (!userId) {
        setPlan("free");
        setPlanLoading(false);
        setPlanError(null);
        setDisplayName(null);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        await fetch("/api/polar/restore", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, name, nickname")
        .eq("id", userId)
        .single();
      if (!active) return;
      if (error) {
        setPlan("free");
        setPlanError(error.message);
        setDisplayName(null);
      } else {
        setPlan(data?.plan === "pro" ? "pro" : "free");
        setPlanError(null);
        const candidate = data?.nickname?.trim() || data?.name?.trim() || null;
        setDisplayName(candidate);
      }
      setPlanLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthEmail(data.session?.user?.email ?? null);
      setAuthUserId(data.session?.user?.id ?? null);
      loadProfile(data.session?.user?.id ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthEmail(session?.user?.email ?? null);
      setAuthUserId(session?.user?.id ?? null);
      loadProfile(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(RECORDS_KEY);
    const parsed = stored ? (JSON.parse(stored) as DecisionRecord[]) : [];
    const normalized = Array.isArray(parsed)
      ? parsed.map((record) => ({
          ...record,
          people: record.people ?? 1,
          region: (record.region ?? "KR") as Region,
          riskLabelKey: normalizeRiskLabelKey(
            (record as { riskLabelKey?: RiskLabelKey; riskLabel?: string })
              .riskLabelKey ??
              (record as { riskLabelKey?: RiskLabelKey; riskLabel?: string })
                .riskLabel,
            record.riskScore
          )
        }))
      : [];
    setRecords(normalized);
  }, []);

  useEffect(() => {
    setSelectedDate(null);
  }, [region]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => (record.region ?? "KR") === region);
  }, [records, region]);

  const groupedRecords = useMemo(() => {
    return filteredRecords.reduce<Record<string, DecisionRecord[]>>(
      (acc, record) => {
        if (!acc[record.date]) acc[record.date] = [];
        acc[record.date].push(record);
        return acc;
      },
      {}
    );
  }, [filteredRecords]);

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
        items.reduce((sum, r) => sum + r.riskScore, 0) / items.length
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

    const recent = filteredRecords.filter((record) => {
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
      count: recent.length
    };
  }, [filteredRecords]);

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
              items.reduce((sum, r) => sum + r.riskScore, 0) / items.length
            );
      days.push({
        date: dateKey,
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        avgRisk,
        count: items.length
      });
    }

    return days;
  }, [groupedRecords]);

  const hasTimelineData = useMemo(
    () => timelineData.some((day) => day.count > 0),
    [timelineData]
  );

  const recentMenus = useMemo(() => {
    const unique: string[] = [];
    for (const record of filteredRecords) {
      if (!record.menu.trim()) continue;
      if (!unique.includes(record.menu)) {
        unique.push(record.menu);
      }
      if (unique.length >= 3) break;
    }
    return unique;
  }, [filteredRecords]);

  const lastRecord = useMemo(
    () => filteredRecords[0] ?? null,
    [filteredRecords]
  );

  const getRiskLabel = (key: RiskLabelKey) => {
    if (key === "low") return t("riskLabelLow");
    if (key === "medium") return t("riskLabelMedium");
    return t("riskLabelHigh");
  };

  const regionConfig = REGION_CONFIG[region];
  const isPro = plan === "pro";

  const checkoutUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("products", POLAR_PRODUCT_ID);
    if (authEmail) params.set("customerEmail", authEmail);
    if (authUserId) params.set("customerExternalId", authUserId);
    if (authEmail || authUserId) {
      params.set(
        "metadata",
        JSON.stringify({ userId: authUserId, email: authEmail })
      );
    }
    return `/api/polar/checkout?${params.toString()}`;
  }, [authEmail, authUserId]);

  const aiExplanation = useMemo(() => {
    if (!isPro || !labelKey || score === null) return "";
    const priceValue = Number.parseInt(price, 10);
    const timeValue = time.trim().length > 0 ? Number.parseInt(time, 10) : null;
    const peopleValue = Number.parseInt(people, 10);
    if (
      Number.isNaN(priceValue) ||
      Number.isNaN(peopleValue) ||
      peopleValue <= 0
    ) {
      return "";
    }
    const perPerson = priceValue / peopleValue;
    if (timeValue === null) {
      return t("aiExplanationBodyNoTime", {
        pricePerPerson: formatCurrency(perPerson, region, locale),
        label: getRiskLabel(labelKey)
      });
    }

    return t("aiExplanationBody", {
      pricePerPerson: formatCurrency(perPerson, region, locale),
      time: timeValue,
      label: getRiskLabel(labelKey)
    });
  }, [isPro, labelKey, score, price, time, people, region, locale, t]);

  const handleSignOut = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
    setAuthLoading(false);
  };

  const handleAnalyze = () => {
    setMessage("");
    setAiError(null);
    setWeeklyAiError(null);

    if (!authUserId) {
      setMessage(t("messageLoginRequired"));
      return;
    }

    if (!menu.trim() || !price.trim() || !time.trim() || !people.trim()) {
      setMessage(t("messageMissing"));
      return;
    }

    const priceValue = Number.parseInt(price, 10);
    const timeValue = Number.parseInt(time, 10);
    const peopleValue = Number.parseInt(people, 10);

    if (
      Number.isNaN(priceValue) ||
      Number.isNaN(peopleValue) ||
      peopleValue <= 0
    ) {
      setMessage(t("messageInvalid"));
      return;
    }
    if (Number.isNaN(timeValue)) {
      setMessage(t("messageInvalid"));
      return;
    }

    const computedScore = computeRiskScore(
      priceValue,
      timeValue,
      peopleValue,
      regionConfig.baseOrderAmount
    );
    const computedLabelKey = riskLabelKey(computedScore);

    const now = new Date();
    if (isPro) {
      const record: DecisionRecord = {
        id: crypto.randomUUID(),
        date: formatLocalDate(now),
        createdAt: now.getTime(),
        menu: menu.trim(),
        price: priceValue,
        people: peopleValue,
        timeMinutes: timeValue,
        region,
        riskScore: computedScore,
        riskLabelKey: computedLabelKey
      };

      const nextRecords = [record, ...records];
      localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
      setRecords(nextRecords);
      setSelectedDate(record.date);
    }
    setScore(computedScore);
    setLabelKey(computedLabelKey);

    if (!isPro) {
      setAiText("");
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        setAiError(t("aiExplanationError"));
        return;
      }
      setAiLoading(true);
      try {
        const response = await fetch("/api/ai/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            menu,
            price: priceValue,
            time: timeValue,
            people: peopleValue,
            region,
            score: computedScore,
            label: getRiskLabel(computedLabelKey),
            locale
          })
        });
        if (!response.ok) {
          setAiError(t("aiExplanationError"));
          setAiText("");
          return;
        }
        const payload = (await response.json()) as { text?: string };
        setAiText(payload.text ?? "");
      } catch {
        setAiError(t("aiExplanationError"));
        setAiText("");
      } finally {
        setAiLoading(false);
      }
    });
  };

  const handleWeeklyAi = async () => {
    setWeeklyAiError(null);
    if (!isPro || weeklySummary.count === 0) {
      setWeeklyAiText("");
      return;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setWeeklyAiError(t("aiWeeklyError"));
      return;
    }
    setWeeklyAiLoading(true);
    try {
      const response = await fetch("/api/ai/weekly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          locale,
          region,
          totalSpend: weeklySummary.totalSpend,
          avgRisk: weeklySummary.avgRisk,
          maxRisk: weeklySummary.maxRisk,
          count: weeklySummary.count,
          trend: timelineData.map((day) => day.avgRisk)
        })
      });
      if (!response.ok) {
        setWeeklyAiError(t("aiWeeklyError"));
        setWeeklyAiText("");
        return;
      }
      const payload = (await response.json()) as { text?: string };
      if (!payload.text) {
        setWeeklyAiError(t("aiWeeklyError"));
        setWeeklyAiText("");
        return;
      }
      setWeeklyAiText(payload.text);
    } catch {
      setWeeklyAiError(t("aiWeeklyError"));
      setWeeklyAiText("");
    } finally {
      setWeeklyAiLoading(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-[#1152d4]/5 p-1 text-[10px] font-semibold">
              {[
                { code: "ko", label: "KR" },
                { code: "en", label: "EN" },
                { code: "ja", label: "JA" }
              ].map((lang) => {
                const active = locale === lang.code;
                return (
                  <Link
                    key={lang.code}
                    href="/"
                    locale={lang.code as "ko" | "en" | "ja"}
                    className={`rounded-md px-2 py-0.5 ${
                      active
                        ? "bg-white text-[#1152d4] shadow-sm"
                        : "text-[#1e293b]/50"
                    }`}
                  >
                    {lang.label}
                  </Link>
                );
              })}
            </div>
            <span className="text-[10px] font-semibold text-[#1e293b]/60">
              {authEmail
                ? tCommon("loggedInAs", {
                    name: displayName ?? authEmail
                  })
                : tCommon("loggedOut")}
            </span>
            <span className="text-[10px] font-semibold text-[#1e293b]/60">
              Plan: {planLoading ? "..." : plan}
            </span>
            {!authEmail ? (
              <>
                <a
                  href="./login"
                  className="min-w-[72px] rounded-lg border border-[#1152d4]/20 px-3 py-1.5 text-center text-sm font-semibold text-[#1152d4]"
                >
                  {tCommon("login")}
                </a>
                <a
                  href="./signup"
                  className="min-w-[84px] rounded-lg bg-[#1152d4] px-3 py-1.5 text-center text-sm font-semibold text-white"
                >
                  {tCommon("signup")}
                </a>
              </>
            ) : (
              <button
                type="button"
                className="min-w-[84px] rounded-lg border border-[#1152d4]/20 px-3 py-1.5 text-sm font-semibold text-[#1152d4] whitespace-nowrap"
                onClick={handleSignOut}
                disabled={authLoading}
              >
                {authLoading ? tCommon("processing") : tCommon("logout")}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-24 pt-8">
        <header className="mb-10 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
            {tCommon("appName")}
          </p>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold leading-[1.2] text-[#0f172a]">
                {t("headline")}
              </h1>
              <p className="text-sm leading-relaxed text-[#1e293b]/70">
                {t("subhead")}
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-[#1152d4]/5 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleAnalyze();
            }}
          >
            <div className="grid gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("regionLabel")}
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#f6f6f8] p-1">
                {Object.entries(REGION_CONFIG).map(([value, config]) => {
                  const selected = region === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`rounded-md py-2.5 text-sm font-semibold transition ${
                        selected
                          ? "bg-white text-[#1152d4] shadow-sm"
                          : "text-[#1e293b]/50"
                      }`}
                      onClick={() => setRegion(value as Region)}
                    >
                      {t(config.labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("menuLabel")}
              </label>
              <input
                className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                placeholder={t("menuPlaceholder")}
                value={menu}
                onChange={(event) => setMenu(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("priceLabel", { currency: regionConfig.currency })}
              </label>
              <input
                className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder={t(regionConfig.pricePlaceholderKey)}
                inputMode="numeric"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("timeLabel")}
              </label>
              <input
                className="rounded-lg bg-[#f6f6f8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                placeholder={t("timePlaceholder")}
                inputMode="numeric"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#1152d4]">
                {t("peopleLabel")}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-lg bg-white text-lg font-semibold text-[#1152d4] shadow-sm"
                  onClick={() =>
                    setPeople((prev) => {
                      const value = Number.parseInt(prev, 10);
                      if (Number.isNaN(value) || value <= 1) return "1";
                      return String(value - 1);
                    })
                  }
                  aria-label={t("peopleDecrease")}
                >
                  -
                </button>
                <input
                  className="w-20 rounded-lg bg-[#f6f6f8] px-3 py-2 text-center text-sm outline-none focus:ring-2 focus:ring-[#1152d4]/40"
                  value={people}
                  onChange={(event) => {
                    const next = event.target.value.replace(/\D/g, "");
                    if (!next) {
                      setPeople("1");
                      return;
                    }
                    setPeople(String(Math.max(1, Number.parseInt(next, 10))));
                  }}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className="h-10 w-10 rounded-lg bg-[#1152d4] text-lg font-semibold text-white shadow-md"
                  onClick={() =>
                    setPeople((prev) => {
                      const value = Number.parseInt(prev, 10);
                      if (Number.isNaN(value)) return "2";
                      return String(value + 1);
                    })
                  }
                  aria-label={t("peopleIncrease")}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-[#1e293b]/60">{t("peopleDefaultHint")}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="rounded-xl bg-[#1152d4] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#1152d4]/60"
              >
                {t("analyze")}
              </button>
              <a
                href={authUserId ? checkoutUrl : "./login"}
                className="rounded-xl border border-[#1152d4]/20 px-4 py-3 text-center text-sm font-semibold text-[#1152d4] transition-all active:scale-[0.98]"
              >
                {t("upgrade")}
              </a>
            </div>
          </form>

          {recentMenus.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{t("recentMenus")}</span>
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

          {lastRecord && lastRecord.menu.trim().length > 0 && (
            <button
              type="button"
              className="mt-3 text-xs font-medium text-slate-600 underline-offset-4 hover:underline"
              onClick={() => {
                setMenu(lastRecord.menu);
                setPrice(String(lastRecord.price));
                setTime(
                  lastRecord.timeMinutes === null
                    ? ""
                    : String(lastRecord.timeMinutes),
                );
                setPeople(String(lastRecord.people));
                setRegion(lastRecord.region ?? "KR");
              }}
            >
              {t("useLastInput")}
            </button>
          )}

          {message && (
            <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {message}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white/70 p-4 text-xs text-[#1e293b]/60">
          <p className="font-semibold text-[#1152d4]/70">
            {tCommon("disclaimerTitle")}
          </p>
          <p className="mt-2">{tCommon("disclaimerBody")}</p>
          <p className="mt-2">{tCommon("disclaimerNote")}</p>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#1152d4]/5 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4]/10 text-[#1152d4]">
              <span className="text-sm font-bold">⏱</span>
            </div>
            <h3 className="mb-1 text-xs font-bold text-[#0f172a]">
              Recent Calcs
            </h3>
            <p className="text-[10px] text-[#1e293b]/60">
              View your last 10 risk scores and insights.
            </p>
          </div>
          <div className="rounded-xl border border-[#1152d4]/5 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <span className="text-sm font-bold">✓</span>
            </div>
            <h3 className="mb-1 text-xs font-bold text-[#0f172a]">
              How it Works
            </h3>
            <p className="text-[10px] text-[#1e293b]/60">
              Learn about our data-driven methodology.
            </p>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>{t("riskScore")}</span>
            <span className="text-lg font-semibold text-slate-900">
              {score ?? "-"}
            </span>
          </div>
          <p className="text-base font-medium text-slate-800">
            {score === null || !labelKey ? t("noScore") : getRiskLabel(labelKey)}
          </p>
          <p>{t("riskFormula")}</p>
        </section>

        {score !== null && labelKey && (
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("reportTitle")}</h2>
              <span className="text-xs font-semibold text-[#1152d4]">
                {t("reportBadge")}
              </span>
            </div>
            <div className="grid gap-3 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-800">
                {t("reportSummary", { label: getRiskLabel(labelKey), score })}
              </p>
              <div className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{t("reportInputs")}</p>
                <p>
                  {t("reportInputLine", {
                    menu: menu.trim() || t("noMenu"),
                    price: price.trim() || "-",
                    time: time.trim() || "-",
                    people: people.trim() || "-"
                  })}
                </p>
                <p className="text-xs text-slate-500">{t("reportRegion")}: {region}</p>
              </div>
              <p className="text-xs text-slate-500">{t("reportTip")}</p>
            </div>
            {!authUserId && (
              <div className="rounded-xl border border-[#1152d4]/15 bg-[#1152d4]/5 px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold text-[#0f172a]">
                  {t("guestCtaTitle")}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {t("guestCtaBody")}
                </p>
                <Link
                  href="./login"
                  className="mt-3 inline-flex rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
                >
                  {t("guestCtaButton")}
                </Link>
              </div>
            )}
          </section>
        )}

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("riskTimeline")}</h2>
            <span className="text-xs text-slate-500">{t("last7Days")}</span>
          </div>
          {hasTimelineData ? (
            <div className="grid gap-2">
              <div className="flex items-end gap-2">
                {timelineData.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center">
                    <div className="flex h-24 w-full items-end justify-center">
                      <div
                        className="w-4 rounded-full bg-slate-900/80"
                        style={{
                          height: `${Math.max(8, day.avgRisk)}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{day.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">{t("timelineHint")}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t("timelineEmpty")}</p>
          )}
        </section>

        {isPro ? (
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("weeklySummary")}</h2>
              <span className="text-xs text-slate-500">{t("last7Days")}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{t("totalSpend")}</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(weeklySummary.totalSpend, region, locale)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{t("avgRisk")}</p>
                <p className="text-lg font-semibold">{weeklySummary.avgRisk}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{t("maxRisk")}</p>
                <p className="text-lg font-semibold">{weeklySummary.maxRisk}</p>
              </div>
            </div>
            <div className="grid gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {t("aiWeeklyTitle")}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
                  onClick={handleWeeklyAi}
                  disabled={weeklyAiLoading || weeklySummary.count === 0}
                >
                  {weeklyAiLoading
                    ? t("aiWeeklyLoading")
                    : t("aiWeeklyButton")}
                </button>
              </div>
              <p className="text-sm text-slate-600">
                {weeklyAiText ||
                  (weeklySummary.count === 0
                    ? t("aiWeeklyEmpty")
                    : t("aiWeeklyHint"))}
              </p>
              {weeklyAiError && (
                <p className="text-xs text-rose-600">{weeklyAiError}</p>
              )}
            </div>
          </section>
        ) : (
          <section className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("weeklySummary")}</h2>
              <span className="text-xs font-semibold text-[#1152d4]">PRO</span>
            </div>
            <p className="text-sm text-slate-500">{t("weeklySummaryLocked")}</p>
            <a
              href={checkoutUrl}
              className="w-fit rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
            >
              {t("upgradeToUnlock")}
            </a>
            <p className="text-xs text-slate-500">{t("proPrice")}</p>
            <p className="text-[11px] text-slate-400">{t("proCancelAnytime")}</p>
          </section>
        )}

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("aiExplanationTitle")}</h2>
            {!planLoading && !isPro && (
              <span className="text-xs font-semibold text-[#1152d4]">PRO</span>
            )}
          </div>
          {isPro ? (
            <p className="text-sm text-slate-600">
              {aiLoading
                ? t("aiExplanationLoading")
                : aiText || aiExplanation || t("aiExplanationEmpty")}
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">{t("aiExplanationLocked")}</p>
              <div className="flex flex-col items-end gap-1">
                <a
                  href={checkoutUrl}
                  className="rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
                >
                  {t("upgradeToUnlock")}
                </a>
                <p className="text-[11px] text-slate-500">{t("proPrice")}</p>
                <p className="text-[10px] text-slate-400">
                  {t("proCancelAnytime")}
                </p>
              </div>
            </div>
          )}
          {aiError && (
            <p className="text-xs text-rose-600">{aiError}</p>
          )}
        </section>

        {isPro ? (
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t("calendar")}</h2>
                <p className="text-xs text-slate-500">{t("calendarHint")}</p>
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
                        1
                      )
                    )
                  }
                >
                  {t("prev")}
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
                        1
                      )
                    )
                  }
                >
                  {t("next")}
                </button>
              </div>
            </div>
            {records.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {t("noRecordsCalendar")}
              </div>
            )}
            <div className="grid grid-cols-7 gap-2 text-xs text-slate-500">
              {[
                t("weekdaySun"),
                t("weekdayMon"),
                t("weekdayTue"),
                t("weekdayWed"),
                t("weekdayThu"),
                t("weekdayFri"),
                t("weekdaySat")
              ].map((day) => (
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
                          {formatCurrency(stats.totalSpend, region, locale)}
                        </p>
                        <p>
                          {t("risk")} {stats.avgRisk}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {t("noRecord")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("calendar")}</h2>
              <span className="text-xs font-semibold text-[#1152d4]">PRO</span>
            </div>
            <p className="text-sm text-slate-500">{t("calendarLocked")}</p>
            <a
              href={checkoutUrl}
              className="w-fit rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
            >
              {t("upgradeToUnlock")}
            </a>
            <p className="text-xs text-slate-500">{t("proPrice")}</p>
            <p className="text-[11px] text-slate-400">{t("proCancelAnytime")}</p>
          </section>
        )}

        {isPro ? (
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("records")}</h2>
              <span className="text-xs text-slate-500">
                {t("recordsCount", { count: filteredRecords.length })}
              </span>
            </div>

            {sortedDates.length === 0 ? (
              <p className="text-sm text-slate-500">{t("noRecords")}</p>
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
                      {t("recordsForDate", { date: selectedDate })}
                    </h3>
                    <div className="grid gap-2">
                      {selectedRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {record.menu.trim().length > 0
                                ? record.menu
                                : t("noMenu")}
                            </span>
                            <span className="text-xs text-slate-500">
                              {t("recordMeta", {
                                price: formatCurrency(
                                  record.price,
                                  record.region,
                                  locale
                                ),
                                time: record.timeMinutes ?? "-",
                                people: record.people
                              })}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{t("risk")}</p>
                            <p className="font-semibold text-slate-900">
                              {getRiskLabel(record.riskLabelKey)}
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
        ) : (
          <section className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("records")}</h2>
              <span className="text-xs font-semibold text-[#1152d4]">PRO</span>
            </div>
            <p className="text-sm text-slate-500">{t("recordsLocked")}</p>
            <a
              href={checkoutUrl}
              className="w-fit rounded-full border border-[#1152d4]/20 px-3 py-1 text-xs font-semibold text-[#1152d4]"
            >
              {t("upgradeToUnlock")}
            </a>
            <p className="text-xs text-slate-500">{t("proPrice")}</p>
            <p className="text-[11px] text-slate-400">{t("proCancelAnytime")}</p>
          </section>
        )}

        <section className="grid gap-2 rounded-xl border border-[#1152d4]/10 bg-white/70 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1152d4]/80">
            Legal
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <a
              className="rounded-lg border border-[#1152d4]/20 bg-[#1152d4]/5 px-3 py-2 text-center text-xs font-semibold text-[#1152d4]"
              href="./terms"
            >
              {tCommon("terms")}
            </a>
            <a
              className="rounded-lg border border-[#1152d4]/20 bg-[#1152d4]/5 px-3 py-2 text-center text-xs font-semibold text-[#1152d4]"
              href="./refund"
            >
              {tCommon("refund")}
            </a>
            <a
              className="rounded-lg border border-[#1152d4]/20 bg-[#1152d4]/5 px-3 py-2 text-center text-xs font-semibold text-[#1152d4]"
              href="./privacy"
            >
              {tCommon("privacy")}
            </a>
          </div>
        </section>

        <div className="h-24" />
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1152d4]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 pb-6 pt-3 text-[10px] font-bold uppercase tracking-tight text-[#1e293b]/40">
          {[
            { label: tCommon("home"), href: "./" },
            { label: tCommon("explore"), href: "./explore" },
            { label: tCommon("trends"), href: "#" },
            { label: tCommon("profile"), href: "./profile" }
          ].map((item, index) => {
            const isHome = index === 0;
            return (
              <a
                key={item.label}
                href={item.href}
                className={isHome ? "text-[#1152d4]" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="mx-auto mb-4 h-1.5 w-32 rounded-full bg-[#1e293b]/10" />
      </div>
  </div>
  );
}
