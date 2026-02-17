# Legal Review Packet (One-time)

Date: 2026-02-17  
Service: Riskly (`https://riskly.store`)  
Prepared by: Engineering

## Scope

- Cookie consent gating for analytics scripts
- Community abuse/takedown report intake
- Policy text alignment (Terms/Privacy) with runtime behavior
- SEO/indexing safeguards around user-generated content

## Implemented Controls

1. Consent before analytics:
- Google Analytics and Microsoft Clarity are loaded only when consent is `granted`.
- Consent values are persisted via cookie/localStorage.
- User can reopen consent modal via `Cookie settings` button and change preference.

2. Content report/takedown workflow:
- New report intake page: `/community/report`
- API endpoint: `POST /api/community/report`
- Report fields: post ID, reason, detail, optional reporter email.
- Intended storage table: `community_reports` (schema in `docs/community-reports-schema.sql`).

3. Policy-to-product consistency:
- Terms updated to include report-driven moderation/takedown handling.
- Privacy updated to state consent-based analytics activation and withdrawal path.

## Required External Counsel Sign-off

- Confirm GDPR/ePrivacy interpretation for analytics + session storage by jurisdiction.
- Confirm UGC notice-and-takedown SLA and evidence retention period.
- Confirm regional consumer law language in Terms/Refund is sufficient for target markets.

## Open Compliance Actions

- Execute `docs/community-reports-schema.sql` in Supabase production.
- Define internal moderation SLA:
  - Initial response target
  - Escalation path for legal notices
  - Audit log retention duration
- Designate official legal notice mailbox owner and backup owner.

## Sign-off

- Legal reviewer:
- Review date:
- Decision: Approved / Approved with changes / Rejected
- Notes:
