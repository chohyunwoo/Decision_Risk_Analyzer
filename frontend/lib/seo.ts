import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riskly.store";

export const SITE_NAME = "Riskly";
export const LOCALES = ["ko", "en", "ja"] as const;
export type AppLocale = (typeof LOCALES)[number];

type PageSeoCopy = {
  title: string;
  description: string;
};

const SEO_COPY: Record<
  AppLocale,
  {
    siteDescription: string;
    pages: Record<string, PageSeoCopy>;
  }
> = {
  ko: {
    siteDescription:
      "식사, 시간, 인원 정보를 기반으로 선택 리스크를 분석하고 더 나은 결정을 돕는 서비스입니다.",
    pages: {
      home: {
        title: "식사 선택 리스크 분석기",
        description:
          "메뉴, 가격, 소요 시간을 입력하면 선택 리스크 점수를 계산해 일상 의사결정을 돕습니다."
      },
      explore: {
        title: "메뉴 탐색",
        description:
          "카테고리별 메뉴를 탐색하고 선택 전 참고할 수 있는 정보를 빠르게 확인하세요."
      },
      community: {
        title: "커뮤니티",
        description:
          "다른 사용자의 선택 경험과 리스크 사례를 공유하고 확인할 수 있는 커뮤니티입니다."
      },
      trends: {
        title: "트렌드",
        description:
          "사용자 선택 데이터 기반의 리스크 트렌드를 확인하고 의사결정 패턴을 파악하세요."
      },
      terms: {
        title: "이용약관",
        description: "Riskly 서비스 이용약관입니다."
      },
      refund: {
        title: "환불정책",
        description: "Riskly 서비스 결제 및 환불 정책 안내입니다."
      },
      privacy: {
        title: "개인정보처리방침",
        description: "Riskly 서비스의 개인정보 수집 및 처리 방침입니다."
      }
    }
  },
  en: {
    siteDescription:
      "Analyze decision risk from meal price, time, and group size to make better everyday choices.",
    pages: {
      home: {
        title: "Meal Decision Risk Analyzer",
        description:
          "Enter menu, price, and time to calculate a risk score and improve everyday decision-making."
      },
      explore: {
        title: "Explore Meals",
        description:
          "Browse meal categories and quickly review useful details before making a choice."
      },
      community: {
        title: "Community",
        description:
          "Share and discover real decision cases and risk experiences from other users."
      },
      trends: {
        title: "Decision Trends",
        description:
          "Check risk trends from user behavior data and identify decision-making patterns."
      },
      terms: {
        title: "Terms of Service",
        description: "Terms of Service for using the Riskly platform."
      },
      refund: {
        title: "Refund Policy",
        description: "Payment and refund policy for Riskly subscriptions."
      },
      privacy: {
        title: "Privacy Policy",
        description: "How Riskly collects, uses, and protects personal data."
      }
    }
  },
  ja: {
    siteDescription:
      "メニュー価格・時間・人数から意思決定リスクを分析し、日常の選択を支援します。",
    pages: {
      home: {
        title: "食事選択リスク分析",
        description:
          "メニュー・価格・時間を入力してリスクスコアを算出し、日常の意思決定を支援します。"
      },
      explore: {
        title: "メニュー探索",
        description:
          "カテゴリ別にメニューを探し、選択前に役立つ情報をすばやく確認できます。"
      },
      community: {
        title: "コミュニティ",
        description:
          "他ユーザーの意思決定事例やリスク体験を共有・閲覧できるコミュニティです。"
      },
      trends: {
        title: "トレンド",
        description:
          "ユーザーデータに基づくリスクトレンドを確認し、意思決定パターンを把握できます。"
      },
      terms: {
        title: "利用規約",
        description: "Riskly サービスの利用規約です。"
      },
      refund: {
        title: "返金ポリシー",
        description: "Riskly サービスの決済および返金ポリシーです。"
      },
      privacy: {
        title: "プライバシーポリシー",
        description: "Riskly サービスの個人情報保護方針です。"
      }
    }
  }
};

export function normalizeLocale(locale: string): AppLocale {
  if (LOCALES.includes(locale as AppLocale)) return locale as AppLocale;
  return "ko";
}

export function localePath(locale: AppLocale, path: string): string {
  if (locale === "ko") return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export function languageAlternates(path: string): Record<string, string> {
  return {
    ko: localePath("ko", path),
    en: localePath("en", path),
    ja: localePath("ja", path),
    "x-default": localePath("ko", path)
  };
}

type BuildPageMetadataParams = {
  locale: string;
  path: string;
  pageKey: keyof (typeof SEO_COPY)["ko"]["pages"];
  robots?: Metadata["robots"];
};

export function buildPageMetadata({
  locale,
  path,
  pageKey,
  robots
}: BuildPageMetadataParams): Metadata {
  const normalized = normalizeLocale(locale);
  const copy = SEO_COPY[normalized];
  const page = copy.pages[pageKey];
  const canonicalPath = localePath(normalized, path);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: page.title,
    description: page.description,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(path)
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: normalized,
      url: canonicalUrl,
      title: page.title,
      description: page.description,
      images: [
        {
          url: `${SITE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} preview image`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${SITE_URL}/og.png`]
    },
    robots
  };
}

export function getSiteDescription(locale: string): string {
  return SEO_COPY[normalizeLocale(locale)].siteDescription;
}
