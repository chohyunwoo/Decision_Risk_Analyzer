"use client";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            Refund Policy
          </h1>
          <p className="mt-2 text-xs text-[#1e293b]/50">Last updated: 2026-02-11</p>

          <div className="mt-6 grid gap-4 text-sm leading-relaxed text-[#1e293b]/80">
            <p>
              This is a digital SaaS subscription. We do not provide physical
              goods or offline services.
            </p>
            <p>
              Refunds are considered on a case-by-case basis within 7 days of
              the charge date, provided that the service has not been
              materially used. If provisioning fails after a successful
              payment, we automatically issue a refund.
            </p>
            <p>
              Subscription renewals are billed automatically. You can cancel at
              any time to stop future charges.
            </p>
            <p>
              Payments and refunds are processed by Polar as the merchant of
              record.
            </p>
            <p>Contact: support@your-domain.com</p>
          </div>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">환불 규정 (한국어)</h2>
          <p className="mt-2 text-xs text-[#1e293b]/50">최종 업데이트: 2026-02-11</p>

          <div className="mt-6 grid gap-4 text-sm leading-relaxed text-[#1e293b]/80">
            <p>
              본 서비스는 디지털 SaaS 구독 서비스이며 물리적 상품이나
              오프라인 서비스는 제공하지 않습니다.
            </p>
            <p>
              환불은 결제일로부터 7일 이내, 서비스가 실질적으로 사용되지 않은
              경우에 한해 개별 심사 후 처리됩니다. 결제 성공 후 권한 부여에
              실패한 경우에는 자동 환불이 진행됩니다.
            </p>
            <p>
              구독은 자동 갱신되며, 언제든지 해지하여 다음 결제를 중단할 수
              있습니다.
            </p>
            <p>
              결제 및 환불 처리는 Polar가 판매자(Merchant of Record)로
              수행합니다.
            </p>
            <p>문의: support@your-domain.com</p>
          </div>
        </section>
      </main>
    </div>
  );
}
