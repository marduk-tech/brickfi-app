import { NextRequest, NextResponse } from "next/server";

/**
 * Native app (Capacitor) mode: only routes under /app are reachable.
 *
 * Enabled when either:
 *  - the request comes from the native shell (Capacitor appends APP_USER_AGENT
 *    to the WebView user agent, see capacitor.config.ts), or
 *  - the deployment sets APP_ONLY_MODE=true (e.g. a dedicated app.brickfi.in host).
 *
 * Everything else ("/", landing pages, glossary, etc.) redirects to /app.
 */
const APP_USER_AGENT = "BrickfiApp";
const APP_HOME = "/app";

// Non-/app paths that must stay reachable inside the app shell
const ALLOWED_PREFIXES = [APP_HOME, "/offline", "/api"];

function isAppRequest(req: NextRequest) {
  if (process.env.APP_ONLY_MODE === "true") return true;
  return (req.headers.get("user-agent") || "").includes(APP_USER_AGENT);
}

function isAllowed(pathname: string) {
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(req: NextRequest) {
  if (!isAppRequest(req)) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (isAllowed(pathname)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = APP_HOME;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and static files (anything with an extension)
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
