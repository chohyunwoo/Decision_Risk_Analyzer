"use client";

import { LEGAL_INFO } from "@/lib/legal";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            Terms of Service / 서비스 약관
          </h1>
          <p className="mt-2 text-xs text-[#1e293b]/50">
            Last updated: 2026-02-11
          </p>
          <div className="mt-4 grid gap-1 text-sm text-[#1e293b]/90">
            <p>Service: {LEGAL_INFO.serviceName}</p>
            <p>Website: {LEGAL_INFO.serviceUrl}</p>
            <p>Operator: {LEGAL_INFO.operatorName}</p>
            <p>Operating country: {LEGAL_INFO.operatorCountry}</p>
            <p>Contact: {LEGAL_INFO.contactEmail}</p>
          </div>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            1. Service and Acceptance / 서비스 및 동의
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              {LEGAL_INFO.serviceName} is a digital SaaS service for
              decision-support scoring and optional AI summaries.
            </li>
            <li>
              By creating an account or using the Service, you agree to these
              Terms and related policies.
            </li>
            <li>
              본 서비스는 디지털 소프트웨어 서비스이며 실물 상품을 판매하지
              않습니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            2. Eligibility and Account / 이용 자격 및 계정
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              You must be the age of legal majority in your jurisdiction, or
              have valid guardian consent where legally permitted.
            </li>
            <li>
              You are responsible for account credentials and all activities
              under your account.
            </li>
            <li>
              허위 정보 제공, 계정 양도, 무단 접근 시 서비스 이용이 제한될 수
              있습니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            3. Billing, Renewals, and Cancellation / 결제, 자동갱신, 해지
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              Paid plans are subscription-based and may renew automatically
              unless canceled before the next billing date.
            </li>
            <li>
              Polar processes payments as Merchant of Record, including tax
              handling for applicable digital sales.
            </li>
            <li>
              Canceling stops future renewals and does not automatically refund
              elapsed billing periods except where required by law.
            </li>
            <li>
              환불 세부 기준은 환불 규정을 따릅니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            4. Acceptable Use / 허용 사용 범위
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              You must comply with applicable laws and must not use the Service
              for unlawful, abusive, fraudulent, or security-violating
              activities.
            </li>
            <li>
              You may not reverse engineer, resell, or bulk-extract Service
              content without written authorization.
            </li>
            <li>
              결과물은 참고용 정보로서 의료, 법률, 금융 자문이 아닙니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            5. Intellectual Property / 지식재산권
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              The Service software, branding, and documentation are owned by
              {` ${LEGAL_INFO.operatorName}`} or licensors.
            </li>
            <li>
              A limited, non-exclusive, non-transferable license is granted for
              personal or internal business use.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            6. Disclaimer and Liability / 면책 및 책임 제한
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              The Service is provided "as is" and "as available" to the maximum
              extent permitted by law.
            </li>
            <li>
              We do not guarantee uninterrupted service, perfect accuracy, or
              fitness for a particular purpose.
            </li>
            <li>
              To the maximum extent permitted by law, indirect or consequential
              damages are excluded.
            </li>
            <li>
              다만, 고의 또는 중대한 과실 등 강행법상 제한할 수 없는 책임은
              제외됩니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            7. Governing Law and Disputes / 준거법 및 분쟁 해결
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              These Terms are governed by the laws of {LEGAL_INFO.operatorCountry},
              excluding conflict-of-law principles.
            </li>
            <li>
              Disputes will be handled by the competent court in the operator's
              primary jurisdiction, unless mandatory local consumer law provides
              otherwise.
            </li>
            <li>
              소비자에게 적용되는 국가별 강행규정이 있는 경우 해당 법령이
              우선합니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            8. Contact / 문의
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#1e293b]/90">
            Legal and support inquiries: {LEGAL_INFO.contactEmail}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#1e293b]/90">
            Response target: {LEGAL_INFO.supportResponseWindow}
          </p>
        </section>
      </main>
    </div>
  );
}
