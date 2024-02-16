import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({

  url: process.env.REDIS_URL as string,
  token: process.env.REDIS_TOKEN as string
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, "7 d"), // 2 API calls per 7 days or per week
});

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
): Promise<Response | undefined> {

  const ip = request.ip ?? "127.0.0.1";

  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    ip
  );

  console.log("ARE WE REDIS-IN?");
  console.log("success", success);

  // if success true then call next() middleware otherwise redirect to /blocked
  return success
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/blocked", request.url));
}

export const config = {
  matcher: "/api/transcribe",
};