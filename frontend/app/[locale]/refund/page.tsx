"use client";

import { LEGAL_INFO } from "@/lib/legal";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <section className="flex justify-end">
          <LocaleSwitcher />
        </section>
        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            Refund Policy / 환불 규정
          </h1>
          <p className="mt-2 text-xs text-[#1e293b]/50">
            Last updated: 2026-02-11
          </p>
          <div className="mt-4 grid gap-1 text-sm text-[#1e293b]/90">
            <p>Service: {LEGAL_INFO.serviceName}</p>
            <p>Website: {LEGAL_INFO.serviceUrl}</p>
            <p>Operator: {LEGAL_INFO.operatorName}</p>
            <p>Contact: {LEGAL_INFO.contactEmail}</p>
          </div>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            1. Digital Service Scope / 디지털 서비스 범위
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              This policy applies to digital subscription services only. No
              physical shipment is involved.
            </li>
            <li>
              본 정책은 디지털 구독 서비스에 적용되며, 실물 배송 거래에는
              적용되지 않습니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            2. General Refund Rule / 기본 환불 원칙
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              Charges for already-started billing periods are generally
              non-refundable except as required by applicable law or this
              policy.
            </li>
            <li>
              Proven duplicate/incorrect charge, failed provisioning after
              payment, or material service failure may qualify for refund.
            </li>
            <li>
              이미 개시된 과금 기간은 원칙적으로 환불되지 않으며, 법령상 강행
              규정 또는 본 정책상 예외 사유가 있을 때 환불됩니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            3. Request Window and Required Info / 신청 기한 및 제출 정보
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              Submit requests within 14 days from the disputed charge date,
              unless local law grants a longer mandatory period.
            </li>
            <li>
              Include account email, order/invoice ID, charge date, and reason.
            </li>
            <li>
              Fraud prevention and identity verification steps may be required.
            </li>
            <li>
              접수 후 통상 {LEGAL_INFO.supportResponseWindow} 이내 1차 회신을
              제공합니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            4. Auto-Renewal and Cancellation / 자동갱신 및 해지
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              Subscriptions may renew automatically unless canceled before the
              next billing date.
            </li>
            <li>
              Cancellation prevents future charges and does not retroactively
              refund elapsed periods unless required by law.
            </li>
            <li>
              다음 결제일 이전 해지 시 이후 갱신 결제는 중단됩니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            5. Merchant of Record and Settlement / 결제 주체 및 반영 시점
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              Billing and refunds are processed through Polar as Merchant of
              Record.
            </li>
            <li>
              Actual settlement timing depends on card network, issuer bank, and
              payment method policies.
            </li>
            <li>
              결제 취소 반영 시점은 카드사/결제사 정책에 따라 달라질 수
              있습니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            6. Mandatory Consumer Rights / 강행 소비자 권리
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#1e293b]/90">
            Nothing in this policy limits mandatory withdrawal, cancellation, or
            refund rights under your local consumer protection law.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#1e293b]/90">
            본 정책은 각국 소비자보호법상 강행되는 환불/철회/해지 권리를
            제한하지 않습니다.
          </p>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            7. Contact / 문의
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#1e293b]/90">
            Refund requests: {LEGAL_INFO.contactEmail}
          </p>
        </section>
      </main>
    </div>
  );
}
