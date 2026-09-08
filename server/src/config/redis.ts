import Redis from "ioredis";

// Memory cache fallback when Redis is unreachable or not configured
class MemoryCache {
  private store = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, durationSeconds?: number): Promise<string> {
    const ttlMs = durationSeconds ? durationSeconds * 1000 : 3600 * 1000;
    this.store.set(key, { value, expiry: Date.now() + ttlMs });
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (this.store.delete(key)) deleted++;
    }
    return deleted;
  }

  async flushall(): Promise<string> {
    this.store.clear();
    return "OK";
  }
}

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, durationSeconds?: number): Promise<string>;
  del(...keys: string[]): Promise<number>;
  flushall(): Promise<string>;
}

let cacheClient: CacheClient;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    const client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("[Redis] Failed to connect after 3 attempts, switching to In-Memory Cache.");
          return null; // stop retrying
        }
        return Math.min(times * 100, 2000);
      },
    });

    client.on("connect", () => {
      console.log("[Redis] Connected successfully.");
    });

    client.on("error", (err) => {
      console.warn("[Redis] Error:", err.message);
    });

    // Attempt initial connection
    client.connect().catch(() => {
      console.warn("[Redis] Connection failed, using in-memory cache fallback.");
    });

    cacheClient = client as unknown as CacheClient;
  } catch (err) {
    console.warn("[Redis] Initialization error, falling back to memory cache.");
    cacheClient = new MemoryCache();
  }
} else {
  console.log("[Cache] REDIS_URL not configured; using high-speed In-Memory Cache.");
  cacheClient = new MemoryCache();
}

export const cache = cacheClient;
export default cache;
