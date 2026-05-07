interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryWindow = new Map<string, RateLimitEntry>();

function readLimit() {
  const parsed = Number(process.env.AI_RATE_LIMIT_REQUESTS_PER_MINUTE || "6");

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
}

export function checkAiRateLimit(key: string) {
  const now = Date.now();
  const limit = readLimit();
  const current = memoryWindow.get(key);

  if (!current || current.resetAt <= now) {
    memoryWindow.set(key, {
      count: 1,
      resetAt: now + 60_000,
    });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: now + 60_000,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  memoryWindow.set(key, current);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}
