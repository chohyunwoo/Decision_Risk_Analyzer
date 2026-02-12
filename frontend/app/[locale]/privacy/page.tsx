"use client";

import { useLocale } from "next-intl";
import { DATA_RETENTION, LEGAL_INFO } from "@/lib/legal";

type LocaleKey = "ko" | "en" | "ja";

type PrivacyCopy = {
  home: string;
  title: string;
  updated: string;
  labels: {
    controller: string;
    service: string;
    website: string;
    contact: string;
  };
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

const PRIVACY_COPY: Record<LocaleKey, PrivacyCopy> = {
  ko: {
    home: "홈으로",
    title: "개인정보 처리방침",
    updated: "최종 업데이트: 2026-02-11",
    labels: {
      controller: "개인정보처리자",
      service: "서비스",
      website: "웹사이트",
      contact: "문의"
    },
    sections: [
      {
        title: "1. 처리하는 개인정보",
        items: [
          "계정 정보: 이메일, 사용자 ID, 인증 상태",
          "서비스 이용 정보: 지역 선택, 입력값, 리스크 점수, 이용 기록",
          "결제 정보: Polar(Merchant of Record)에서 전달되는 구독/주문 상태",
          "기술/보안 정보: IP 메타데이터, 접근 로그, 오류 로그",
          "신용카드 전체 번호/CVV는 당사 시스템에 저장되지 않습니다."
        ]
      },
      {
        title: "2. 처리 목적 및 법적 근거",
        items: [
          "계약 이행: 계정 운영 및 유료 기능 제공",
          "정당한 이익: 서비스 품질 개선, 악용 방지, 보안",
          "법적 의무: 세무/회계, 분쟁 대응, 감사 대응",
          "동의 기반 처리: 법령상 동의가 필요한 선택적 커뮤니케이션"
        ]
      },
      {
        title: "3. 처리위탁 및 제공",
        items: [
          "Supabase: 인증 및 데이터베이스 인프라",
          "Cloudflare Pages/Edge: 호스팅 및 엣지 런타임",
          "OpenAI: 해당 기능 이용 시 AI 텍스트 생성",
          "Polar: Merchant of Record로서 결제 및 환불 처리",
          "당사는 금전적 대가를 위한 개인정보 판매를 하지 않습니다."
        ]
      },
      {
        title: "4. 국외 이전",
        items: [
          "서비스 제공을 위해 개인정보가 국외에서 처리될 수 있습니다.",
          "관련 법령이 요구하는 경우 계약상 보호조치 등 이전 보호장치를 적용합니다."
        ]
      },
      {
        title: "5. 보관 기간",
        items: [
          `계정/프로필 정보: ${DATA_RETENTION.account}`,
          `분석 기록 정보: ${DATA_RETENTION.analytics}`,
          `보안/접근 로그: ${DATA_RETENTION.securityLogs}`,
          `결제/인보이스 기록: ${DATA_RETENTION.billingRecords}`
        ]
      },
      {
        title: "6. 정보주체 권리",
        items: [
          "관할 법령(GDPR/UK GDPR/CCPA-CPRA 포함)에 따라 열람, 정정, 삭제, 이동, 처리 제한, 이의제기, 동의철회를 요청할 수 있습니다.",
          "요청은 본인 확인 및 악용 방지 절차 후 처리됩니다.",
          "표준 응답 목표는 30일 이내이며, 현지 법령이 더 짧은 기한을 요구하면 해당 기한을 따릅니다.",
          "감독기관에 민원을 제기할 수 있습니다."
        ]
      },
      {
        title: "7. 쿠키 및 로컬 저장소",
        items: [
          "로그인/세션 유지 및 핵심 기능 동작을 위해 필수 저장 기술(로컬 스토리지 포함)을 사용합니다.",
          "본 서비스는 제3자 광고 추적 쿠키를 운영하지 않습니다."
        ]
      },
      {
        title: "8. 문의",
        items: [
          `개인정보 문의: ${LEGAL_INFO.contactEmail}`,
          `운영자: ${LEGAL_INFO.operatorName} (${LEGAL_INFO.operatorCountry})`
        ]
      }
    ]
  },
  en: {
    home: "Home",
    title: "Privacy Policy",
    updated: "Last updated: 2026-02-11",
    labels: {
      controller: "Data controller",
      service: "Service",
      website: "Website",
      contact: "Contact"
    },
    sections: [
      {
        title: "1. Data We Process",
        items: [
          "Account data: email, user ID, authentication status",
          "Service usage data: selected region, inputs, risk scores, usage records",
          "Billing data: subscription/order status provided by Polar (Merchant of Record)",
          "Technical and security data: IP metadata, access logs, error logs",
          "Full payment card number and CVV are not stored in our systems."
        ]
      },
      {
        title: "2. Purposes and Legal Bases",
        items: [
          "Contract performance: account operation and paid feature delivery",
          "Legitimate interests: service quality improvement, abuse prevention, security",
          "Legal obligations: tax/accounting, dispute handling, audit response",
          "Consent-based processing: optional communications where consent is required"
        ]
      },
      {
        title: "3. Processors and Sharing",
        items: [
          "Supabase: authentication and database infrastructure",
          "Cloudflare Pages/Edge: hosting and edge runtime",
          "OpenAI: AI text generation for eligible features",
          "Polar: billing and refund processing as Merchant of Record",
          "We do not sell personal information for monetary consideration."
        ]
      },
      {
        title: "4. International Transfers",
        items: [
          "Personal data may be processed outside your country to provide the Service.",
          "Where required, we apply transfer safeguards such as contractual protections."
        ]
      },
      {
        title: "5. Retention Periods",
        items: [
          `Account/profile data: ${DATA_RETENTION.account}`,
          `Analytics records: ${DATA_RETENTION.analytics}`,
          `Security/access logs: ${DATA_RETENTION.securityLogs}`,
          `Billing/invoice records: ${DATA_RETENTION.billingRecords}`
        ]
      },
      {
        title: "6. Your Rights",
        items: [
          "Depending on local law (including GDPR/UK GDPR/CCPA-CPRA), you may request access, correction, deletion, portability, restriction, objection, and consent withdrawal.",
          "Requests are processed after identity verification and abuse checks.",
          "Standard response target is within 30 days unless local law requires a shorter period.",
          "You may lodge a complaint with your local supervisory authority."
        ]
      },
      {
        title: "7. Cookies and Local Storage",
        items: [
          "We use required storage technologies (including local storage) for login/session continuity and core functions.",
          "This Service does not use third-party ad tracking cookies."
        ]
      },
      {
        title: "8. Contact",
        items: [
          `Privacy inquiries: ${LEGAL_INFO.contactEmail}`,
          `Operator: ${LEGAL_INFO.operatorName} (${LEGAL_INFO.operatorCountry})`
        ]
      }
    ]
  },
  ja: {
    home: "ホーム",
    title: "プライバシーポリシー",
    updated: "最終更新日: 2026-02-11",
    labels: {
      controller: "個人情報管理者",
      service: "サービス",
      website: "ウェブサイト",
      contact: "お問い合わせ"
    },
    sections: [
      {
        title: "1. 取得・処理する情報",
        items: [
          "アカウント情報: メール、ユーザーID、認証状態",
          "利用情報: 地域選択、入力値、リスクスコア、利用履歴",
          "決済情報: Polar（Merchant of Record）から提供される購読/注文状態",
          "技術・セキュリティ情報: IPメタデータ、アクセスログ、エラーログ",
          "カード番号全体やCVVは当社システムに保存されません。"
        ]
      },
      {
        title: "2. 利用目的と法的根拠",
        items: [
          "契約履行: アカウント運用と有料機能提供",
          "正当な利益: 品質改善、不正利用防止、セキュリティ確保",
          "法的義務: 税務/会計、紛争対応、監査対応",
          "同意に基づく処理: 法令上同意が必要な任意連絡"
        ]
      },
      {
        title: "3. 委託先と提供",
        items: [
          "Supabase: 認証およびデータベース基盤",
          "Cloudflare Pages/Edge: ホスティングとエッジランタイム",
          "OpenAI: 対象機能におけるAIテキスト生成",
          "Polar: Merchant of Recordとしての決済・返金処理",
          "当社は金銭対価を目的とした個人情報販売を行いません。"
        ]
      },
      {
        title: "4. 国外移転",
        items: [
          "サービス提供のため、個人情報が国外で処理される場合があります。",
          "法令で必要な場合、契約上の保護措置など適切な移転保護を適用します。"
        ]
      },
      {
        title: "5. 保存期間",
        items: [
          `アカウント/プロフィール情報: ${DATA_RETENTION.account}`,
          `分析履歴: ${DATA_RETENTION.analytics}`,
          `セキュリティ/アクセスログ: ${DATA_RETENTION.securityLogs}`,
          `決済/請求関連記録: ${DATA_RETENTION.billingRecords}`
        ]
      },
      {
        title: "6. 利用者の権利",
        items: [
          "適用法令（GDPR/UK GDPR/CCPA-CPRAを含む）に応じて、開示、訂正、削除、移転、処理制限、異議申立て、同意撤回を請求できます。",
          "請求は本人確認と不正防止手続の後に処理されます。",
          "通常の回答目標は30日以内ですが、現地法令がより短い期限を定める場合はそれに従います。",
          "監督機関へ苦情を申し立てることができます。"
        ]
      },
      {
        title: "7. Cookie とローカルストレージ",
        items: [
          "ログイン/セッション維持および主要機能のために必要な保存技術（ローカルストレージを含む）を使用します。",
          "本サービスは第三者広告トラッキングCookieを運用していません。"
        ]
      },
      {
        title: "8. お問い合わせ",
        items: [
          `個人情報に関するお問い合わせ: ${LEGAL_INFO.contactEmail}`,
          `運営者: ${LEGAL_INFO.operatorName} (${LEGAL_INFO.operatorCountry})`
        ]
      }
    ]
  }
};

export default function PrivacyPolicyPage() {
  const locale = useLocale();
  const key: LocaleKey =
    locale === "en" || locale === "ja" ? locale : "ko";
  const copy = PRIVACY_COPY[key];

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <section className="flex items-center justify-between">
          <a
            href="./"
            className="rounded-lg border border-[#1152d4]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1152d4]"
          >
            {copy.home}
          </a>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            {copy.title}
          </h1>
          <p className="mt-2 text-xs text-[#1e293b]/50">{copy.updated}</p>
          <div className="mt-4 grid gap-1 text-sm text-[#1e293b]/90">
            <p>
              {copy.labels.controller}: {LEGAL_INFO.operatorName}
            </p>
            <p>
              {copy.labels.service}: {LEGAL_INFO.serviceName}
            </p>
            <p>
              {copy.labels.website}: {LEGAL_INFO.serviceUrl}
            </p>
            <p>
              {copy.labels.contact}: {LEGAL_INFO.contactEmail}
            </p>
          </div>
        </section>

        {copy.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-[#0f172a]">
              {section.title}
            </h2>
            <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
