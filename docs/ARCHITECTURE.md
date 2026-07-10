# Architecture

## Rendering model

The app is a **static SPA** built with `@sveltejs/adapter-static`:

- The root layout sets `ssr = false` and `prerender = true`. The static routes (`/`, `/berries`, `/favorites`) are prerendered as HTML shells; all data loads in the browser.
- Dynamic routes (`/pokemon/[name]`, `/berries/[name]`) opt out of prerendering and are served by the `404.html` SPA fallback — the standard trick for project-scoped GitHub Pages.
- `paths.base` is `/pokedex-off-fl1` in production (project Pages) and empty in dev. All internal links use `$app/paths`' `base`.

## Data flow

```
component / +page.ts load
        │
        ▼
src/lib/api/client.ts   ← typed fetchers (fetchPokemon, fetchType, …)
        │
        ▼
src/lib/api/cache.ts    ← Map<url, json> + in-flight Promise de-dupe
        │
        ▼
native fetch → PokeAPI (https://pokeapi.co/api/v2)
        │
        ▼
src/lib/api/schemas.ts  ← zod .parse() on every response
```

- **Cache**: a plain `Map` keyed by URL. A second map de-duplicates concurrent requests for the same URL, so 30 cards asking for the same generation payload cost one network call. Failed responses are never cached.
- **Validation**: every consumed PokeAPI shape has a zod schema (`pokemonSchema`, `speciesSchema`, recursive `chainLinkSchema` for evolution chains, `berrySchema`, …). Anything malformed throws before it reaches the UI.

## List page pipeline

1. Fetch the full name list once (`/pokemon?limit=1025`) — ids derived from resource URLs.
2. Active filters each produce a name **set** (generation via `/generation/{id}`, each selected type via `/type/{name}`); sets are intersected, then the debounced search substring is applied.
3. The result is paged 30 at a time; details for the current page are fetched in parallel (browser connection pooling throttles naturally) and rendered as cards. An `IntersectionObserver` sentinel 600 px below the fold triggers the next page.
4. Sorting by dex number is free (ids). Sorting by **base-stat total** requires details for every match, so that mode fetches the full candidate set (each response cached for later browsing) and paginates in memory.
5. Every filter change bumps a request token; stale async results are discarded.

## Routes

| Route             | Prerender | Data                                        |
| ----------------- | --------- | ------------------------------------------- |
| `/`               | shell     | client-side list pipeline                   |
| `/pokemon/[name]` | no        | `load`: pokemon → species → evolution chain |
| `/berries`        | shell     | `load`: berry list                          |
| `/berries/[name]` | no        | `load`: berry detail                        |
| `/favorites`      | shell     | client-side from `localStorage` names       |
| `+error.svelte`   | —         | 404/500 UI                                  |

## State

- `favorites.svelte.ts` — a runes class holding a `$state` string array, mirrored to `localStorage` on every toggle.
- `theme.svelte.ts` — light/dark, applied as `data-theme` on `<html>`. An inline script in `app.html` applies the stored (or OS-preferred) theme **before first paint** to avoid flashing.

## Styling & motion

Tailwind v4 (CSS-first config via `@theme`) supplies layout/utility classes; design tokens (backgrounds, text, borders, shadows, 18 Pokémon type colors) are plain CSS custom properties swapped by `[data-theme]`. Motion (card lift, skeleton shimmer, stat-bar growth, hero entrance) is hand-written CSS, globally disabled under `prefers-reduced-motion`.

## Testing & CI

- **vitest**: cache behavior, URL/id/name helpers, zod schemas.
- **Playwright**: runs against the **production build** (`npm run build && npm run preview`) including the `/pokedex-off-fl1` base path, covering list/scroll, search, composed filters, detail page, 404, berries, favorites persistence, and theme persistence.
- **GitHub Actions**: install → lint → format check → typecheck → unit → e2e → build → upload artifact → deploy to Pages (on `main`).
