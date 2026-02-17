"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

type Reason = "spam" | "harassment" | "copyright" | "privacy" | "illegal" | "other";

type Copy = {
  title: string;
  subtitle: string;
  postId: string;
  reason: string;
  detail: string;
  email: string;
  submit: string;
  submitting: string;
  success: string;
  fail: string;
  reasons: Record<Reason, string>;
};

const COPY: Record<"ko" | "en" | "ja", Copy> = {
  ko: {
    title: "커뮤니티 신고 접수",
    subtitle: "권리침해, 명예훼손, 불법성 의심 게시물을 신고할 수 있습니다.",
    postId: "게시글 ID",
    reason: "신고 사유",
    detail: "상세 설명",
    email: "회신 이메일 (선택)",
    submit: "신고 제출",
    submitting: "제출 중...",
    success: "신고가 접수되었습니다. 운영팀이 검토 후 조치합니다.",
    fail: "신고 접수에 실패했습니다. 잠시 후 다시 시도하세요.",
    reasons: {
      spam: "스팸/광고",
      harassment: "괴롭힘/혐오",
      copyright: "저작권 침해",
      privacy: "개인정보 노출",
      illegal: "불법/유해 내용",
      other: "기타"
    }
  },
  en: {
    title: "Community report intake",
    subtitle: "Report posts involving rights infringement, harassment, privacy exposure, or illegal content.",
    postId: "Post ID",
    reason: "Reason",
    detail: "Details",
    email: "Reply email (optional)",
    submit: "Submit report",
    submitting: "Submitting...",
    success: "Report submitted. Our team will review and take action.",
    fail: "Unable to submit report. Please try again shortly.",
    reasons: {
      spam: "Spam/ads",
      harassment: "Harassment/hate",
      copyright: "Copyright infringement",
      privacy: "Privacy exposure",
      illegal: "Illegal/harmful content",
      other: "Other"
    }
  },
  ja: {
    title: "コミュニティ通報受付",
    subtitle: "権利侵害、嫌がらせ、個人情報露出、違法コンテンツを通報できます。",
    postId: "投稿 ID",
    reason: "通報理由",
    detail: "詳細説明",
    email: "返信用メール (任意)",
    submit: "通報を送信",
    submitting: "送信中...",
    success: "通報を受け付けました。運営チームが確認して対応します。",
    fail: "通報送信に失敗しました。時間をおいて再試行してください。",
    reasons: {
      spam: "スパム/広告",
      harassment: "嫌がらせ/ヘイト",
      copyright: "著作権侵害",
      privacy: "個人情報露出",
      illegal: "違法/有害コンテンツ",
      other: "その他"
    }
  }
};

export default function CommunityReportPage() {
  const locale = useLocale();
  const key = locale === "en" || locale === "ja" ? locale : "ko";
  const copy = COPY[key];
  const searchParams = useSearchParams();

  const initialPostId = useMemo(() => searchParams.get("postId") ?? "", [searchParams]);

  const [postId, setPostId] = useState(initialPostId);
  const [reason, setReason] = useState<Reason>("privacy");
  const [detail, setDetail] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postId.trim(),
          reason,
          detail: detail.trim(),
          reporterEmail: reporterEmail.trim() || undefined
        })
      });
      if (!response.ok) {
        setError(copy.fail);
        return;
      }
      setNotice(copy.success);
      setDetail("");
      setReporterEmail("");
    } catch {
      setError(copy.fail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1e293b]">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-5 py-10">
        <h1 className="text-2xl font-extrabold text-[#0f172a]">{copy.title}</h1>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>

        <form
          onSubmit={onSubmit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <label className="grid gap-1 text-sm font-semibold">
            {copy.postId}
            <input
              type="text"
              value={postId}
              onChange={(event) => setPostId(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold">
            {copy.reason}
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as Reason)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
            >
              {(Object.keys(copy.reasons) as Reason[]).map((reasonKey) => (
                <option key={reasonKey} value={reasonKey}>
                  {copy.reasons[reasonKey]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-semibold">
            {copy.detail}
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              className="min-h-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
              minLength={10}
              maxLength={2000}
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold">
            {copy.email}
            <input
              type="email"
              value={reporterEmail}
              onChange={(event) => setReporterEmail(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1152d4]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#1152d4] px-4 py-2 text-sm font-semibold text-white disabled:bg-[#1152d4]/60"
          >
            {loading ? copy.submitting : copy.submit}
          </button>

          {notice && <p className="text-sm text-emerald-700">{notice}</p>}
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </form>
      </main>
    </div>
  );
}
