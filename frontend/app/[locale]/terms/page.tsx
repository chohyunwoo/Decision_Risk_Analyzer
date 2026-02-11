"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-[#1e293b]/50">Last updated: 2026-02-11</p>

          <div className="mt-6 grid gap-4 text-sm leading-relaxed text-[#1e293b]/80">
            <p>
              Decision Risk Analyzer is a digital SaaS web application that
              provides decision-support scores and optional AI explanations for
              meal choices. The service does not sell physical goods or provide
              offline services.
            </p>
            <p>
              By using this service, you agree to use it for lawful purposes
              only. Scores and explanations are informational and are not
              medical, financial, or legal advice.
            </p>
            <p>
              Access to Pro features is granted through a paid subscription.
              Payments are processed by Polar as the merchant of record.
            </p>
            <p>
              We may update the service, features, or pricing at any time.
              Continued use after changes constitutes acceptance of the updated
              terms.
            </p>
            <p>
              Contact: support@your-domain.com
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">서비스 약관 (한국어)</h2>
          <p className="mt-2 text-xs text-[#1e293b]/50">최종 업데이트: 2026-02-11</p>

          <div className="mt-6 grid gap-4 text-sm leading-relaxed text-[#1e293b]/80">
            <p>
              Decision Risk Analyzer는 음식 선택을 위한 의사결정 지원 점수와
              AI 설명을 제공하는 디지털 SaaS 웹앱입니다. 물리적 상품 판매 및
              오프라인 서비스는 제공하지 않습니다.
            </p>
            <p>
              본 서비스는 합법적인 목적에 한해 사용해야 하며, 점수 및 설명은
              참고용 정보로서 의료·금융·법률 자문이 아닙니다.
            </p>
            <p>
              Pro 기능은 유료 구독을 통해 제공되며, 결제는 Polar가 판매자
              (Merchant of Record)로 처리합니다.
            </p>
            <p>
              서비스, 기능, 가격은 필요에 따라 변경될 수 있으며, 변경 이후
              서비스 이용은 변경된 약관에 동의한 것으로 간주됩니다.
            </p>
            <p>문의: support@your-domain.com</p>
          </div>
        </section>
      </main>
    </div>
  );
}
