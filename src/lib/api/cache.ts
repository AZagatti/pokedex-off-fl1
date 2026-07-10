/** Tiny in-memory cache keyed by URL. Dedupes in-flight requests too. */
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export const cachedJson = (
  url: string,
  fetcher: typeof fetch = fetch
): Promise<unknown> => {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url));
  }
  const pending = inflight.get(url);
  if (pending) {
    return pending;
  }
  const promise = (async () => {
    try {
      const res = await fetcher(url);
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${url}`);
      }
      const json = (await res.json()) as unknown;
      cache.set(url, json);
      return json;
    } finally {
      inflight.delete(url);
    }
  })();
  inflight.set(url, promise);
  return promise;
};

export const clearCache = (): void => {
  cache.clear();
  inflight.clear();
};

export const cacheSize = (): number => cache.size;
