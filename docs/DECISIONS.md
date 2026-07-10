# Decisions

Why each pinned choice looks the way it does.

## SvelteKit + Svelte 5 runes

Runes (`$state`, `$derived`, `$effect`) give fine-grained reactivity without stores for most cases; class-based rune stores (`favorites`, `theme`) cover the shared/persisted state. The compiler output keeps the bundle small, which shows up directly in Lighthouse.

## adapter-static in SPA mode

GitHub Pages only serves static files. Prerendering the three static shells gives fast first paint; the `404.html` fallback makes deep links to `/pokemon/pikachu` work on Pages, where any unknown path returns 404. `paths.base = '/pokedex-off-fl1'` because project Pages serve under a sub-path.

## Native fetch + tiny Map cache (no TanStack Query etc.)

The app's data is immutable reference data — a URL-keyed `Map` with in-flight de-duplication is all the caching it needs, in ~40 lines with zero dependencies. Libraries would add invalidation/staleness machinery this data never uses.

## zod on every response

PokeAPI is external and unversioned; parsing at the boundary means a shape change fails loudly at the fetch site instead of as `undefined is not a function` deep in a component. Schemas double as the source of TS types (`z.infer`).

## Tailwind v4 + hand-written motion CSS

Tailwind v4's CSS-first `@theme` maps cleanly onto the custom-property theme (light/dark by `[data-theme]`, 18 type colors). Motion lives in plain CSS keyframes — easier to read, and one `prefers-reduced-motion` block kills all of it.

## ultracite → oxlint + oxfmt

Rust toolchain: whole-repo lint+format in well under a second, so the pre-commit hook is painless. Ultracite supplies a curated preset. Three rules are narrowly disabled with reasons in `oxlint.config.ts`: `sort-keys` (zod schemas mirror PokeAPI field order), `unicorn/filename-case` and `prefer-const` for `.svelte` files (PascalCase components; `$state` + `bind:` reassigns invisibly to the linter).

## lefthook

Single fast binary, YAML config, parallel jobs. Pre-commit runs oxlint + oxfmt-check on staged files plus typecheck; pre-push runs the full test suite so broken code doesn't reach CI.

## vitest + Playwright

Vitest shares the Vite pipeline (no duplicate transform config) for pure-logic tests. Playwright drives the **production build with the real base path**, which caught a real class of bugs (base-path link resolution) that dev-server testing hides.

## Infinite scroll: IntersectionObserver at 30/page

30 items ≈ one PokeAPI list page and keeps each detail-fetch burst small. The sentinel uses `rootMargin: 600px` so the next page is usually loaded before the user reaches the bottom.

## Stat-total sort fetches all matching details

Base-stat totals only exist on detail payloads. Rather than sorting just the loaded page (feels broken) we fetch the candidate set's details in sequential chunks of 100 with a visible progress indicator — each response lands in the cache and makes the rest of the session faster. With filters applied the set is small; unfiltered it's a one-time, clearly-communicated cost.

## Theme applied in app.html

Reading `localStorage` in an inline `<head>` script and setting `data-theme` before paint avoids the classic dark-mode flash; the rune store then just mirrors that attribute.

## Pixel sprites on cards, artwork on detail

The 30-card grid originally used official artwork (~300 KB each, ~4.4 MB above the fold). Switching cards to the classic 96px game sprites (~3 KB each, `image-rendering: pixelated`) cut page weight ~40×, fixed LCP, and gives the grid a charming retro look; detail pages still show the full official artwork.

## Lighthouse performance note

Measured on the production build (desktop preset): **Accessibility 100, Best Practices 100, SEO 100**. Performance is **100 with applied (devtools) throttling** — observed FCP ≈ 0.4 s, LCP ≈ 0.9 s, CLS 0, TBT 0 ms — and ~71 under Lighthouse's default *simulated* (Lantern) throttling on the home route only. That gap is a known Lantern artifact for hydrated SPAs: it chains the simulated first paint behind the JS graph even though the prerendered shell paints immediately (the identically-shaped `/berries` route scores 100 under the same simulation). The chrome-devtools MCP `lighthouse_audit` reports 100 for every category it measures.
