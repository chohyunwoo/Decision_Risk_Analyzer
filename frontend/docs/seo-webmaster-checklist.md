# SEO Webmaster Checklist

Last updated: 2026-02-17

## 1) Google Search Console

- Add property: `https://riskly.store`
- Verify ownership (DNS TXT recommended)
- Submit sitemap: `https://riskly.store/sitemap.xml`
- Request indexing for key pages:
  - `/`
  - `/explore`
  - `/community`
  - `/trends`
  - `/terms`
  - `/refund`
  - `/privacy`
- Check `URL Inspection` for:
  - Canonical selected as expected
  - `hreflang` detected
  - Crawled page is not blocked by `robots.txt`
- In `Pages` report, confirm:
  - No spike in `Duplicate without user-selected canonical`
  - No important pages marked `Excluded by noindex`

## 2) Bing Webmaster Tools

- Add site: `https://riskly.store`
- Verify ownership (DNS TXT recommended)
- Submit sitemap: `https://riskly.store/sitemap.xml`
- Use `URL Inspection` on the same key pages
- Validate crawl health and index coverage weekly

## 3) Technical Validation

- `robots.txt` reachable and valid:
  - `https://riskly.store/robots.txt`
- `sitemap.xml` reachable and includes:
  - Public static pages
  - Community detail URLs (`/community/{id}`)
  - `alternates.languages` for `ko`, `en`, `ja`, `x-default`
- Verify noindex pages are not listed in sitemap:
  - `/login`
  - `/signup`
  - `/reset-password`
  - `/profile`
  - `/checkout`
  - `/admin`

## 4) Snippet Quality QA

- Check SERP title/description candidates for:
  - Home
  - Community list
  - Community detail (post title + excerpt)
  - Explore
- Validate Open Graph/Twitter cards with share debuggers
- Confirm locale-specific snippet text (`ko`, `en`, `ja`) is readable and not garbled

## 5) Monitoring Cadence

- Daily (first 7 days after release):
  - Coverage/indexing errors
  - Crawl anomalies
- Weekly:
  - Indexed pages trend
  - Top queries / CTR / average position
- Monthly:
  - Re-crawl key templates after major content or metadata updates
