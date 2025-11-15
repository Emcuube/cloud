const ES_URL = import.meta.env.VITE_ES_ENDPOINT;
const ES_USER = import.meta.env.VITE_ES_USER;
const ES_PASS = import.meta.env.VITE_ES_PASSWORD;
const ES_INDEX = import.meta.env.VITE_ES_INDEX;

// Enable debug logs by setting VITE_ES_DEBUG=true in your .env
const DEBUG = import.meta.env.VITE_ES_DEBUG === 'true';

// Simple runtime stats to help debug rate-limiting
const stats: {
  totalRequests: number;
  rateLimitCount: number;
  statusCounts: Record<number, number>;
} = {
  totalRequests: 0,
  rateLimitCount: 0,
  statusCounts: {},
};

// Concurrency & retry settings
const MAX_CONCURRENT = 2; // lower concurrency to avoid Bonsai rate limits
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500; // slightly larger base backoff

let activeRequests = 0;
const waitQueue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT) {
    activeRequests++;
    if (DEBUG) console.debug('[esClient] acquireSlot immediate, activeRequests=', activeRequests);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    waitQueue.push(() => {
      activeRequests++;
      if (DEBUG) console.debug('[esClient] acquireSlot from queue, activeRequests=', activeRequests);
      resolve();
    });
  });
}

function releaseSlot() {
  activeRequests = Math.max(0, activeRequests - 1);
  const next = waitQueue.shift();
  if (next) next();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(delay: number) {
  // +/- 50% jitter
  const rand = Math.random() + 0.5; // range [0.5,1.5)
  return Math.floor(delay * rand);
}

export async function esSearch(body: any) {
  const url = `${ES_URL}/${ES_INDEX}/_search`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    stats.totalRequests++;
    await acquireSlot();

    let res: Response | null = null;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${ES_USER}:${ES_PASS}`),
        },
        body: JSON.stringify(body),
      });

      // track status counts
      try {
        stats.statusCounts[res.status] = (stats.statusCounts[res.status] || 0) + 1;
      } catch {}

      if (DEBUG) console.debug('[esClient] response', { status: res.status, attempt, activeRequests });

      // On success (2xx) return parsed JSON
      if (res.ok) {
        const data = await res.json();
        return data;
      }

      // If we hit a 429 (rate limit) or 5xx server error, retry
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        const shouldRetry = attempt < MAX_RETRIES;
        if (res.status === 429) {
          stats.rateLimitCount++;
        }
        if (!shouldRetry) {
          // no more retries — return parsed body or throw
          try {
            return await res.json();
          } catch (e) {
            throw new Error(`ES request failed with status ${res.status}`);
          }
        }

        const delay = jitter(BASE_DELAY_MS * Math.pow(2, attempt));
        await sleep(delay);
        continue; // next attempt
      }

      // Other non-retriable statuses — try to parse and return
      try {
        return await res.json();
      } catch (e) {
        throw new Error(`ES request failed with status ${res.status}`);
      }
    } catch (err) {
      // Network or fetch error — retry if attempts remain
      if (DEBUG) console.debug('[esClient] fetch error', { err, attempt, activeRequests });
      const shouldRetry = attempt < MAX_RETRIES;
      if (!shouldRetry) throw err;

      const delay = jitter(BASE_DELAY_MS * Math.pow(2, attempt));
      await sleep(delay);
      continue;
    } finally {
      releaseSlot();
    }
  }

  throw new Error("esSearch: exhausted retries");
}

// Return a snapshot of current stats for debugging (do not expose credentials)
export function getEsClientStats() {
  return {
    activeRequests,
    maxConcurrent: MAX_CONCURRENT,
    totalRequests: stats.totalRequests,
    rateLimitCount: stats.rateLimitCount,
    statusCounts: { ...stats.statusCounts },
  };
}
