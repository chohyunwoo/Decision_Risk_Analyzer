"use client";

import { useLocale } from "next-intl";
import { LEGAL_INFO } from "@/lib/legal";

type LocaleKey = "ko" | "en" | "ja";

type TermsCopy = {
  home: string;
  title: string;
  updated: string;
  labels: {
    service: string;
    website: string;
    operator: string;
    country: string;
    contact: string;
  };
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

const TERMS_COPY: Record<LocaleKey, TermsCopy> = {
  ko: {
    home: "홈으로",
    title: "서비스 약관",
    updated: "최종 업데이트: 2026-02-11",
    labels: {
      service: "서비스",
      website: "웹사이트",
      operator: "운영자",
      country: "운영 국가",
      contact: "문의"
    },
    sections: [
      {
        title: "1. 서비스 및 동의",
        items: [
          "Riskly는 의사결정 보조 점수 및 AI 요약을 제공하는 디지털 SaaS 서비스입니다.",
          "계정 생성 또는 서비스 이용 시 본 약관 및 관련 정책에 동의한 것으로 봅니다.",
          "본 서비스는 디지털 서비스이며 실물 상품을 판매하지 않습니다."
        ]
      },
      {
        title: "2. 이용 자격 및 계정",
        items: [
          "이용자는 관할 법령상 성년이거나 법적으로 유효한 보호자 동의를 받아야 합니다.",
          "계정 자격 증명 및 계정 내 활동에 대한 책임은 이용자에게 있습니다.",
          "허위 정보 제공, 계정 양도, 무단 접근 시 서비스 이용이 제한될 수 있습니다."
        ]
      },
      {
        title: "3. 결제, 자동 갱신, 해지",
        items: [
          "유료 플랜은 월 $5.50 구독 기반이며 다음 결제일 이전 해지하지 않으면 자동 갱신될 수 있습니다.",
          "결제는 Polar(Merchant of Record)를 통해 처리되며 관련 디지털 세금이 포함될 수 있습니다.",
          "해지는 이후 갱신 결제를 중단하며, 법령상 의무가 없는 한 경과 기간 소급 환불은 제공되지 않습니다."
        ]
      },
      {
        title: "4. 허용 사용 범위",
        items: [
          "이용자는 관련 법령을 준수해야 하며 불법, 악용, 사기, 보안 침해 목적의 사용을 금지합니다.",
          "사전 서면 승인 없이 역설계, 재판매, 대량 추출을 할 수 없습니다.",
          "서비스 결과는 참고 정보이며 의료, 법률, 금융 자문이 아닙니다."
        ]
      },
      {
        title: "5. 지식재산권",
        items: [
          "소프트웨어, 상표, 문서 및 서비스 구성 요소의 권리는 운영자 또는 라이선스 제공자에게 있습니다.",
          "이용자에게는 개인 또는 내부 업무 목적의 제한적, 비독점적, 양도 불가 사용권만 부여됩니다."
        ]
      },
      {
        title: "6. 면책 및 책임 제한",
        items: [
          "서비스는 관련 법령이 허용하는 범위에서 현 상태(as is)로 제공됩니다.",
          "운영자는 무중단 제공, 완전한 정확성, 특정 목적 적합성을 보장하지 않습니다.",
          "관련 법령이 허용하는 범위에서 간접, 부수, 결과적 손해에 대한 책임은 제한됩니다.",
          "단, 고의 또는 중대한 과실 등 강행법상 제한할 수 없는 책임은 제외됩니다."
        ]
      },
      {
        title: "7. 준거법 및 분쟁 해결",
        items: [
          "본 약관은 법률 충돌 원칙을 제외하고 운영 국가의 법률을 따릅니다.",
          "분쟁은 운영자 관할의 법원에서 해결하며, 소비자 강행법상 별도 규정이 있으면 해당 법령이 우선합니다."
        ]
      },
      {
        title: "8. 문의",
        items: [
          `법무 및 지원 문의: ${LEGAL_INFO.contactEmail}`,
          `응답 목표: ${LEGAL_INFO.supportResponseWindow}`
        ]
      }
    ]
  },
  en: {
    home: "Home",
    title: "Terms of Service",
    updated: "Last updated: 2026-02-17",
    labels: {
      service: "Service",
      website: "Website",
      operator: "Operator",
      country: "Operating country",
      contact: "Contact"
    },
    sections: [
      {
        title: "1. Service and Acceptance",
        items: [
          "Riskly is a digital SaaS service that provides decision-support scoring and optional AI summaries.",
          "By creating an account or using the Service, you agree to these Terms and related policies.",
          "This is a digital service and does not sell physical goods."
        ]
      },
      {
        title: "2. Eligibility and Account",
        items: [
          "You must be the age of legal majority in your jurisdiction, or have valid guardian consent where permitted by law.",
          "You are responsible for your account credentials and all activities under your account.",
          "Access may be restricted for false information, account transfer, or unauthorized access."
        ]
      },
      {
        title: "3. Billing, Renewals, and Cancellation",
        items: [
          "Paid plans are subscription-based ($5.50/month) and may renew automatically unless canceled before the next billing date.",
          "Billing is processed by Polar as Merchant of Record, including applicable digital tax handling.",
          "Cancellation prevents future renewals and does not retroactively refund elapsed periods unless required by law."
        ]
      },
      {
        title: "4. Acceptable Use",
        items: [
          "You must comply with applicable laws and must not use the Service for unlawful, abusive, fraudulent, or security-violating activities.",
          "You may not reverse engineer, resell, or bulk-extract service content without prior written authorization.",
          "Outputs are informational only and not medical, legal, or financial advice.",
          "Community content may be reported for rights infringement, privacy exposure, harassment, spam, or illegal content; reported content may be restricted or removed after review."
        ]
      },
      {
        title: "5. Intellectual Property",
        items: [
          "Software, branding, documentation, and service components are owned by the operator or its licensors.",
          "A limited, non-exclusive, non-transferable license is granted for personal or internal business use only."
        ]
      },
      {
        title: "6. Disclaimer and Liability",
        items: [
          "The Service is provided on an as-is basis to the extent permitted by applicable law.",
          "We do not guarantee uninterrupted operation, perfect accuracy, or fitness for a specific purpose.",
          "To the maximum extent permitted by law, indirect, incidental, and consequential damages are excluded.",
          "Nothing limits liability that cannot be excluded under mandatory law."
        ]
      },
      {
        title: "7. Governing Law and Dispute Resolution",
        items: [
          "These Terms are governed by the laws of the operator country, excluding conflict-of-law rules.",
          "Disputes are handled by the courts of the operator jurisdiction unless mandatory consumer law provides otherwise."
        ]
      },
      {
        title: "8. Contact",
        items: [
          `Legal and support inquiries: ${LEGAL_INFO.contactEmail}`,
          `Response target: ${LEGAL_INFO.supportResponseWindow}`,
          "For legal takedown or rights-infringement notices, use the community report intake page or contact the support email above."
        ]
      }
    ]
  },
  ja: {
    home: "ホーム",
    title: "利用規約",
    updated: "最終更新日: 2026-02-11",
    labels: {
      service: "サービス",
      website: "ウェブサイト",
      operator: "運営者",
      country: "運営国",
      contact: "お問い合わせ"
    },
    sections: [
      {
        title: "1. サービスと同意",
        items: [
          "Riskly は、意思決定支援スコアと任意のAI要約を提供するデジタルSaaSサービスです。",
          "アカウント作成またはサービス利用により、本規約および関連ポリシーに同意したものとみなします。",
          "本サービスはデジタルサービスであり、物理的商品の販売は行いません。"
        ]
      },
      {
        title: "2. 利用資格とアカウント",
        items: [
          "利用者は、居住地の法令に基づく成年であるか、法的に有効な保護者同意を得ている必要があります。",
          "アカウント認証情報およびアカウント内で行われる行為については利用者が責任を負います。",
          "虚偽情報、アカウント譲渡、不正アクセスが確認された場合、利用が制限されることがあります。"
        ]
      },
      {
        title: "3. 決済・自動更新・解約",
        items: [
          "有料プランは月$5.50のサブスクリプション方式で、次回請求日前に解約しない限り自動更新される場合があります。",
          "決済は Merchant of Record として Polar が処理し、該当するデジタル税務処理を含みます。",
          "解約すると将来の更新課金は停止されますが、法令上必要な場合を除き、経過期間の遡及返金は行いません。"
        ]
      },
      {
        title: "4. 許容される利用",
        items: [
          "利用者は適用法令を遵守し、違法・濫用・詐欺・セキュリティ侵害目的で本サービスを使用してはいけません。",
          "事前の書面許可なく、リバースエンジニアリング、再販売、大量抽出を行うことはできません。",
          "出力は参考情報であり、医療・法律・金融アドバイスではありません。"
        ]
      },
      {
        title: "5. 知的財産権",
        items: [
          "ソフトウェア、ブランド、文書およびサービス構成要素に関する権利は、運営者またはライセンサーに帰属します。",
          "利用者には、個人利用または社内業務利用のための限定的・非独占的・譲渡不可の利用権のみが付与されます。"
        ]
      },
      {
        title: "6. 免責と責任制限",
        items: [
          "本サービスは、適用法令で認められる範囲で現状有姿で提供されます。",
          "運営者は無停止運用、完全な正確性、特定目的適合性を保証しません。",
          "適用法令で認められる最大範囲で、間接損害・付随損害・結果損害に対する責任を制限します。",
          "ただし、強行法規により除外できない責任はこの限りではありません。"
        ]
      },
      {
        title: "7. 準拠法と紛争解決",
        items: [
          "本規約は、法の抵触に関する原則を除き、運営国の法令に準拠します。",
          "紛争は運営者の管轄裁判所で解決します。ただし、消費者保護の強行法規がある場合はそれに従います。"
        ]
      },
      {
        title: "8. お問い合わせ",
        items: [
          `法務・サポート窓口: ${LEGAL_INFO.contactEmail}`,
          `一次回答目標: ${LEGAL_INFO.supportResponseWindow}`
        ]
      }
    ]
  }
};

export default function TermsPage() {
  const locale = useLocale();
  const key: LocaleKey =
    locale === "en" || locale === "ja" ? locale : "ko";
  const copy = TERMS_COPY[key];

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
              {copy.labels.service}: {LEGAL_INFO.serviceName}
            </p>
            <p>
              {copy.labels.website}: {LEGAL_INFO.serviceUrl}
            </p>
            <p>
              {copy.labels.operator}: {LEGAL_INFO.operatorName}
            </p>
            <p>
              {copy.labels.country}: {LEGAL_INFO.operatorCountry}
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
