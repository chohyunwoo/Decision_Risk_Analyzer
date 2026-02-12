"use client";

import { useLocale } from "next-intl";
import { LEGAL_INFO } from "@/lib/legal";

type LocaleKey = "ko" | "en" | "ja";

type RefundCopy = {
  home: string;
  title: string;
  updated: string;
  labels: {
    service: string;
    website: string;
    operator: string;
    contact: string;
  };
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

const REFUND_COPY: Record<LocaleKey, RefundCopy> = {
  ko: {
    home: "홈으로",
    title: "환불 규정",
    updated: "최종 업데이트: 2026-02-11",
    labels: {
      service: "서비스",
      website: "웹사이트",
      operator: "운영자",
      contact: "문의"
    },
    sections: [
      {
        title: "1. 적용 범위",
        items: [
          "본 정책은 디지털 구독 서비스에만 적용됩니다.",
          "실물 배송이 필요한 상품 거래에는 적용되지 않습니다."
        ]
      },
      {
        title: "2. 기본 환불 원칙",
        items: [
          "이미 시작된 과금 기간의 요금은 원칙적으로 환불되지 않습니다.",
          "다만, 관련 법령 또는 본 정책이 정한 예외 사유가 있으면 환불됩니다.",
          "중복 결제, 결제 오류, 결제 후 서비스 제공 실패 등은 환불 검토 대상입니다."
        ]
      },
      {
        title: "3. 신청 기한 및 제출 정보",
        items: [
          "분쟁 결제일로부터 14일 이내 환불 요청을 접수해 주세요.",
          "단, 현지 법령이 더 긴 의무 기간을 보장하면 해당 기간을 따릅니다.",
          "요청 시 계정 이메일, 주문/인보이스 ID, 결제일, 사유를 포함해야 합니다.",
          "사기 방지 및 본인 확인 절차가 필요할 수 있습니다."
        ]
      },
      {
        title: "4. 자동 갱신 및 해지",
        items: [
          "구독은 다음 결제일 이전 해지하지 않으면 자동 갱신될 수 있습니다.",
          "해지 시 이후 갱신 결제는 중단되며, 이미 경과한 기간은 원칙적으로 소급 환불되지 않습니다."
        ]
      },
      {
        title: "5. 결제 처리 및 반영 시점",
        items: [
          "결제 및 환불 처리는 Polar(Merchant of Record)를 통해 진행됩니다.",
          "실제 환불 반영 시점은 카드사/결제수단 정책에 따라 달라질 수 있습니다."
        ]
      },
      {
        title: "6. 소비자 강행 권리",
        items: [
          "본 정책은 각국 소비자보호법상 강행되는 철회/해지/환불 권리를 제한하지 않습니다."
        ]
      },
      {
        title: "7. 문의",
        items: [
          `환불 문의: ${LEGAL_INFO.contactEmail}`,
          `응답 목표: ${LEGAL_INFO.supportResponseWindow}`
        ]
      }
    ]
  },
  en: {
    home: "Home",
    title: "Refund Policy",
    updated: "Last updated: 2026-02-11",
    labels: {
      service: "Service",
      website: "Website",
      operator: "Operator",
      contact: "Contact"
    },
    sections: [
      {
        title: "1. Scope",
        items: [
          "This policy applies only to digital subscription services.",
          "It does not apply to transactions involving physical shipment."
        ]
      },
      {
        title: "2. General Refund Rule",
        items: [
          "Charges for billing periods already started are generally non-refundable.",
          "Refunds may still apply where required by law or where this policy provides an exception.",
          "Duplicate charges, incorrect charges, or service provisioning failures after payment may be eligible."
        ]
      },
      {
        title: "3. Request Window and Required Information",
        items: [
          "Please submit refund requests within 14 days of the disputed charge date.",
          "If local law provides a longer mandatory period, that period applies.",
          "Include account email, order/invoice ID, charge date, and reason.",
          "Identity verification and anti-fraud checks may be required."
        ]
      },
      {
        title: "4. Auto-Renewal and Cancellation",
        items: [
          "Subscriptions may renew automatically unless canceled before the next billing date.",
          "Cancellation stops future renewals, but elapsed periods are not retroactively refunded unless required by law."
        ]
      },
      {
        title: "5. Payment Processing and Settlement Timing",
        items: [
          "Payments and refunds are processed through Polar as Merchant of Record.",
          "Actual settlement timing depends on payment method and issuing bank policy."
        ]
      },
      {
        title: "6. Mandatory Consumer Rights",
        items: [
          "Nothing in this policy limits mandatory withdrawal, cancellation, or refund rights under applicable consumer law."
        ]
      },
      {
        title: "7. Contact",
        items: [
          `Refund inquiries: ${LEGAL_INFO.contactEmail}`,
          `Response target: ${LEGAL_INFO.supportResponseWindow}`
        ]
      }
    ]
  },
  ja: {
    home: "ホーム",
    title: "返金ポリシー",
    updated: "最終更新日: 2026-02-11",
    labels: {
      service: "サービス",
      website: "ウェブサイト",
      operator: "運営者",
      contact: "お問い合わせ"
    },
    sections: [
      {
        title: "1. 適用範囲",
        items: [
          "本ポリシーはデジタルサブスクリプションサービスにのみ適用されます。",
          "物理的配送を伴う取引には適用されません。"
        ]
      },
      {
        title: "2. 返金の基本方針",
        items: [
          "すでに開始された課金期間の料金は原則として返金されません。",
          "ただし、法令上の義務または本ポリシー上の例外がある場合は返金されます。",
          "重複請求、誤請求、決済後の提供失敗などは返金審査対象となります。"
        ]
      },
      {
        title: "3. 申請期限と必要情報",
        items: [
          "異議対象の請求日から14日以内に返金申請を行ってください。",
          "現地法令でより長い強行期間がある場合はその期間を優先します。",
          "申請時には、アカウントメール、注文/請求ID、請求日、理由を記載してください。",
          "不正防止および本人確認手続きが必要となる場合があります。"
        ]
      },
      {
        title: "4. 自動更新と解約",
        items: [
          "サブスクリプションは次回請求日前に解約しない限り自動更新される場合があります。",
          "解約後は将来の更新課金は停止されますが、法令上必要な場合を除き経過期間の遡及返金は行いません。"
        ]
      },
      {
        title: "5. 決済処理と反映時期",
        items: [
          "決済および返金は Merchant of Record として Polar が処理します。",
          "返金反映時期はカード会社や決済手段のポリシーにより異なります。"
        ]
      },
      {
        title: "6. 消費者の強行法上の権利",
        items: [
          "本ポリシーは、各国の消費者保護法に基づく強行的な撤回・解約・返金権を制限しません。"
        ]
      },
      {
        title: "7. お問い合わせ",
        items: [
          `返金に関するお問い合わせ: ${LEGAL_INFO.contactEmail}`,
          `一次回答目標: ${LEGAL_INFO.supportResponseWindow}`
        ]
      }
    ]
  }
};

export default function RefundPolicyPage() {
  const locale = useLocale();
  const key: LocaleKey =
    locale === "en" || locale === "ja" ? locale : "ko";
  const copy = REFUND_COPY[key];

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
