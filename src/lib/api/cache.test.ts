import { beforeEach, describe, expect, it, vi } from "vitest";

import { cachedJson, cacheSize, clearCache } from "./cache";

describe("cachedJson", () => {
  beforeEach(() => {
    clearCache();
  });

  it("fetches and caches by URL", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    const first = await cachedJson(
      "https://example.com/a",
      fetcher as typeof fetch
    );
    const second = await cachedJson(
      "https://example.com/a",
      fetcher as typeof fetch
    );
    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(cacheSize()).toBe(1);
  });

  it("dedupes concurrent in-flight requests", async () => {
    const fetcher = vi.fn().mockImplementation(() => Response.json({ n: 1 }));
    const [a, b] = await Promise.all([
      cachedJson("https://example.com/b", fetcher as typeof fetch),
      cachedJson("https://example.com/b", fetcher as typeof fetch),
    ]);
    expect(a).toEqual(b);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("throws on non-OK responses and does not cache them", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("nope", { status: 404 }));
    await expect(
      cachedJson("https://example.com/c", fetcher as typeof fetch)
    ).rejects.toThrow("404");
    expect(cacheSize()).toBe(0);
  });
});
