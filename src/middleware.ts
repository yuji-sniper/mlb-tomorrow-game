import { Ratelimit } from "@upstash/ratelimit"
import { kv } from "@vercel/kv"
import { type NextRequest, NextResponse } from "next/server"

const RATE_LIMIT_COUNT = 10
const RATE_LIMIT_DURATION = "10s"

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}

export async function middleware(request: NextRequest) {
  // レートリミット
  const rateLimitSuccess = await rateLimit(request)
  if (!rateLimitSuccess) {
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  return NextResponse.next()
}

/**
 * レートリミット
 */
async function rateLimit(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return true
  }

  const userAgent = request.headers.get("user-agent")
  if (userAgent?.includes("vercel")) {
    return true
  }

  const forwardedFor = request.headers.get("x-forwarded-for")
  const ip =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"

  const rateLimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_COUNT, RATE_LIMIT_DURATION),
  })

  const { success } = await rateLimit.limit(ip)

  return success
}
