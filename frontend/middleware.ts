import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const LEGACY_HOST = "decision-risk-analyzer.pages.dev";
const CANONICAL_HOST = "riskly.store";

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === LEGACY_HOST || host.endsWith(`.${LEGACY_HOST}`)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"]
};
