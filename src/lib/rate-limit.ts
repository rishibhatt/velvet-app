import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createLimiter(requests: number, window: `${number} s` | `${number} m`) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

const metadataLimiter = createLimiter(20, "1 m");
const profileSearchLimiter = createLimiter(30, "1 m");

export async function rateLimitMetadata(identifier: string): Promise<boolean> {
  if (!metadataLimiter) return true;
  const { success } = await metadataLimiter.limit(`metadata:${identifier}`);
  return success;
}

export async function rateLimitProfileSearch(identifier: string): Promise<boolean> {
  if (!profileSearchLimiter) return true;
  const { success } = await profileSearchLimiter.limit(`profiles:${identifier}`);
  return success;
}
