"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

type MealCategory = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

type MealItem = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

type CategoryResponse = {
  categories: MealCategory[];
};

type MealsResponse = {
  meals: MealItem[] | null;
};

type MealDetail = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  [key: string]: string | null;
};

type MealDetailResponse = {
  meals: MealDetail[] | null;
};

type IngredientItem = {
  name: string;
  measure: string;
};

function parseIngredients(detail: MealDetail): IngredientItem[] {
  const items: IngredientItem[] = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = (detail[`strIngredient${index}`] ?? "").trim();
    const measure = (detail[`strMeasure${index}`] ?? "").trim();
    if (!ingredient) continue;
    items.push({ name: ingredient, measure });
  }
  return items;
}

export default function ExplorePage() {
  const t = useTranslations("ExplorePage");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedMealDetail, setSelectedMealDetail] = useState<MealDetail | null>(
    null
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setError("");
      try {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/categories.php",
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("categories request failed");
        }

        const payload = (await response.json()) as CategoryResponse;
        if (!active) return;

        const nextCategories = payload.categories ?? [];
        setCategories(nextCategories);
        if (nextCategories.length > 0) {
          setSelectedCategory(nextCategories[0].strCategory);
        }
      } catch {
        if (!active) return;
        setError(t("loadError"));
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();
    return () => {
      active = false;
      controller.abort();
    };
  }, [locale]);

  useEffect(() => {
    if (!selectedCategory) return;

    let active = true;
    const controller = new AbortController();

    const loadMeals = async () => {
      setMealsLoading(true);
      setError("");
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(selectedCategory)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("meals request failed");
        }

        const payload = (await response.json()) as MealsResponse;
        if (!active) return;
        const nextMeals = payload.meals ?? [];
        setMeals(nextMeals);
        if (
          selectedMealId &&
          !nextMeals.some((meal) => meal.idMeal === selectedMealId)
        ) {
          setSelectedMealId(null);
          setSelectedMealDetail(null);
        }
      } catch {
        if (!active) return;
        setError(t("loadError"));
      } finally {
        if (active) {
          setMealsLoading(false);
        }
      }
    };

    loadMeals();
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedCategory, locale]);

  useEffect(() => {
    if (!selectedMealId) return;

    let active = true;
    const controller = new AbortController();

    const loadMealDetail = async () => {
      setDetailLoading(true);
      setError("");
      setSelectedMealDetail(null);
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(selectedMealId)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("meal detail request failed");
        }
        const payload = (await response.json()) as MealDetailResponse;
        if (!active) return;
        setSelectedMealDetail(payload.meals?.[0] ?? null);
      } catch {
        if (!active) return;
        setError(t("loadError"));
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    };

    loadMealDetail();
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedMealId, locale]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0ff,_#f8fafc_55%)] text-[#0f172a]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-24 pt-8">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1152d4]/70">
            {tCommon("appName")}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight">{t("title")}</h1>
          <p className="text-sm text-slate-600">{t("subtitle")}</p>
        </header>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">{t("categoryLabel")}</h2>
          {categoriesLoading ? (
            <p className="text-sm text-slate-500">{t("loadingCategories")}</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-slate-500">{t("emptyCategories")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = category.strCategory === selectedCategory;
                return (
                  <button
                    key={category.idCategory}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-[#1152d4] bg-[#1152d4] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                    onClick={() => setSelectedCategory(category.strCategory)}
                  >
                    {category.strCategory}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">{t("recipesLabel")}</h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {mealsLoading ? (
            <p className="text-sm text-slate-500">{t("loadingRecipes")}</p>
          ) : meals.length === 0 ? (
            <p className="text-sm text-slate-500">{t("emptyRecipes")}</p>
          ) : (
            <div className="grid gap-3">
              {meals.map((meal) => {
                const isSelected = selectedMealId === meal.idMeal;
                const showDetail = isSelected;

                return (
                  <div key={meal.idMeal} className="grid gap-2">
                    <button
                      type="button"
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-[#1152d4]/40 bg-[#1152d4]/5"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                      onClick={() => {
                        setSelectedMealId((prev) =>
                          prev === meal.idMeal ? null : meal.idMeal
                        );
                        setError("");
                      }}
                    >
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="h-16 w-16 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="grid gap-1">
                        <p className="text-sm font-semibold text-slate-800">{meal.strMeal}</p>
                        <p className="text-xs text-[#1152d4]">{t("viewDetails")}</p>
                      </div>
                    </button>

                    {showDetail && (
                      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="text-sm font-semibold text-slate-700">
                          {t("detailTitle")}
                        </h2>
                        {detailLoading ? (
                          <p className="text-sm text-slate-500">{t("loadingDetails")}</p>
                        ) : !selectedMealDetail ? (
                          <p className="text-sm text-slate-500">{t("emptyDetails")}</p>
                        ) : (
                          <div className="grid gap-3">
                            <img
                              src={selectedMealDetail.strMealThumb}
                              alt={selectedMealDetail.strMeal}
                              className="h-44 w-full rounded-xl object-cover"
                              loading="lazy"
                            />
                            <h3 className="text-base font-bold text-slate-800">
                              {selectedMealDetail.strMeal}
                            </h3>
                            <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {t("ingredientsTitle")}
                              </p>
                              <ul className="grid gap-1 text-sm text-slate-700">
                                {parseIngredients(selectedMealDetail).map((item) => (
                                  <li key={`${item.name}-${item.measure}`}>
                                    {item.name}
                                    {item.measure ? ` - ${item.measure}` : ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {t("instructionsTitle")}
                              </p>
                              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                                {selectedMealDetail.strInstructions || t("emptyDetails")}
                              </p>
                            </div>
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1152d4]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 pb-6 pt-3 text-[10px] font-bold uppercase tracking-tight text-[#1e293b]/40">
          {[
            { label: tCommon("home"), href: "./", active: false },
            { label: tCommon("explore"), href: "./explore", active: true },
            { label: tCommon("trends"), href: "#", active: false },
            { label: tCommon("profile"), href: "./profile", active: false }
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={item.active ? "text-[#1152d4]" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="mx-auto mb-4 h-1.5 w-32 rounded-full bg-[#1e293b]/10" />
      </div>
    </div>
  );
}
