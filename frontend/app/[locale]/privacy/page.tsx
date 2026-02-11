"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-xl shadow-[#1152d4]/5">
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-[#1e293b]/50">Last updated: 2026-02-11</p>

          <div className="mt-6 grid gap-4 text-sm leading-relaxed text-[#1e293b]/80">
            <p>
              We collect information you provide (email, profile details, and
              decision inputs) to operate the service, maintain your account,
              and provide personalized outputs.
            </p>
            <p>
              Payment information is processed by Polar as the merchant of
              record. We do not store full payment card data.
            </p>
            <p>
              We use third-party processors to provide core functionality,
              including Supabase (authentication/database), Cloudflare
              (hosting/edge), and OpenAI (AI text generation for Pro users).
            </p>
            <p>
              We retain data as long as your account is active or as required
              for legal and business purposes. You may request deletion of your
              account and data.
            </p>
            <p>Contact: support@your-domain.com</p>
          </div>
        </section>

        <section className="rounded-xl border border-[#1152d4]/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0f172a]">개인정보 처리방침 (한국어)</h2>
          <p className="mt-2 text-xs text-[#1e293b]/50">최종 업데이트: 2026-02-11</p>

          <div className="mt-6 grid gap-4 text-sm leading-relaxed text-[#1e293b]/80">
            <p>
              서비스 운영을 위해 이메일, 프로필 정보, 의사결정 입력값을
              수집·처리합니다.
            </p>
            <p>
              결제 정보는 Polar가 판매자(Merchant of Record)로 처리하며, 당사는
              카드 정보를 저장하지 않습니다.
            </p>
            <p>
              서비스 제공을 위해 Supabase(인증/DB), Cloudflare(호스팅/엣지),
              OpenAI(Pro 사용자 AI 설명 생성) 등 제3자 처리자를 이용합니다.
            </p>
            <p>
              데이터는 계정 활성 기간 및 법적/사업적 필요 기간 동안 보관되며,
              계정 및 데이터 삭제를 요청할 수 있습니다.
            </p>
            <p>문의: support@your-domain.com</p>
          </div>
        </section>
      </main>
    </div>
  );
}
