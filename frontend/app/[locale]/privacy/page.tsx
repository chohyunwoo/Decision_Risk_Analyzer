"use client";

import { DATA_RETENTION, LEGAL_INFO } from "@/lib/legal";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <section className="flex justify-end">
          <LocaleSwitcher />
        </section>
        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            Privacy Policy / 개인정보 처리방침
          </h1>
          <p className="mt-2 text-xs text-[#1e293b]/50">
            Last updated: 2026-02-11
          </p>
          <div className="mt-4 grid gap-1 text-sm text-[#1e293b]/90">
            <p>Data controller: {LEGAL_INFO.operatorName}</p>
            <p>Service: {LEGAL_INFO.serviceName}</p>
            <p>Website: {LEGAL_INFO.serviceUrl}</p>
            <p>Contact: {LEGAL_INFO.contactEmail}</p>
          </div>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            1. Data We Process / 처리하는 개인정보
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>Account data: email, user ID, authentication status.</li>
            <li>
              Service data: selected region, input values, risk scores, usage
              records.
            </li>
            <li>
              Billing data: subscription/order status from Polar (Merchant of
              Record).
            </li>
            <li>
              Technical/security data: IP metadata, logs, request diagnostics.
            </li>
            <li>
              신용카드 전체 번호/CVV는 당사 시스템에 저장되지 않습니다.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            2. Purposes and Legal Bases / 처리 목적 및 법적 근거
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>Contract performance: account operation and paid features.</li>
            <li>
              Legitimate interests: service quality, abuse prevention, security.
            </li>
            <li>Legal obligations: tax/accounting, dispute and audit response.</li>
            <li>
              Consent-based processing: optional communications where consent is
              required by local law.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            3. Processors and Sharing / 처리위탁 및 제공
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>Supabase: authentication and database infrastructure.</li>
            <li>Cloudflare Pages/Edge: hosting, delivery, edge runtime.</li>
            <li>OpenAI: AI text generation for eligible users/features.</li>
            <li>Polar: billing and refund processing as Merchant of Record.</li>
            <li>
              We do not sell personal information for monetary consideration.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            4. International Transfers / 국외 이전
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#1e293b]/90">
            Data may be processed outside your country through our processors.
            Where legally required, we apply transfer safeguards such as
            contractual protections and equivalent technical controls.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#1e293b]/90">
            개인정보는 서비스 제공을 위해 국외에서 처리될 수 있으며, 관련
            법령이 요구하는 이전 보호조치를 적용합니다.
          </p>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            5. Retention Periods / 보관 기간
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>Account/profile data: {DATA_RETENTION.account}.</li>
            <li>Decision analytics records: {DATA_RETENTION.analytics}.</li>
            <li>Security and access logs: {DATA_RETENTION.securityLogs}.</li>
            <li>Billing and invoice records: {DATA_RETENTION.billingRecords}.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            6. Your Rights / 정보주체 권리
          </h2>
          <ul className="mt-4 list-disc pl-5 text-sm leading-relaxed text-[#1e293b]/90">
            <li>
              Depending on local law (including GDPR/UK GDPR/CCPA-CPRA), you
              may request access, correction, deletion, portability, objection,
              restriction, and consent withdrawal.
            </li>
            <li>
              Requests are handled after identity verification and abuse checks.
            </li>
            <li>
              Standard response target: within 30 days, unless local law
              requires a shorter period.
            </li>
            <li>
              You may lodge complaints with your local supervisory authority.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            7. Cookies and Local Storage / 쿠키 및 로컬 저장소
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#1e293b]/90">
            We use technical storage mechanisms required for login/session
            continuity and core feature operation (including browser local
            storage for user records). We do not operate third-party ad tracking
            cookies in this Service.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#1e293b]/90">
            서비스 운영에 필수적인 저장 기술만 사용하며, 광고 목적의 제3자
            추적 쿠키는 운영하지 않습니다.
          </p>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            8. Contact / 문의
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#1e293b]/90">
            Privacy requests: {LEGAL_INFO.contactEmail}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#1e293b]/90">
            Operator: {LEGAL_INFO.operatorName} ({LEGAL_INFO.operatorCountry})
          </p>
        </section>
      </main>
    </div>
  );
}
