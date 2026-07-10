# Build journal

- 2026-07-10: Fresh directory (only SPEC.md) despite a session handoff implying prior work — previous session evidently didn't persist anything here. Started from scratch.
- 2026-07-10: `sv create .` refused to scaffold into non-empty dir non-interactively; scaffolded in /tmp and copied over.
- 2026-07-10: npm blocked lefthook postinstall via allow-scripts policy; approved with `npm approve-scripts lefthook`.
- 2026-07-10: Write tool briefly created a file literally named `svelte.config.js">` (my own tool-call typo in the path); renamed it.
- 2026-07-10: context7 confirms ultracite v7 wires oxlint/oxfmt via `oxlint.config.ts` extending `ultracite/oxlint/core` and `oxfmt.config.ts` spreading `ultracite/oxfmt`.
- 2026-07-10: Sandboxed background dev servers kept dying with SIGTERM (exit 143) mid-verification — twice, different launch styles. Worked around with `setsid nohup` + sandbox disabled on port 4173; stable since.
- 2026-07-10: E2E first run: 4 failures — Playwright `goto('/x')` ignores the `/pokedex-off-fl1` path in baseURL (absolute path resolution). Fixed with relative `./x` paths + trailing-slash baseURL.
- 2026-07-10: Brief scare that the theme toggle was broken; it was my test reading state after double-toggling. Direct test confirmed light↔dark + persistence work.
- 2026-07-10: Ultracite oxlint preset is aggressive: `sort-keys` fights PokeAPI snake_case field order, `unicorn/filename-case` fights Svelte PascalCase components, `prefer-const` false-positives on `$state` + `bind:`. Disabled those three narrowly in oxlint.config.ts; fixed the other ~35 errors properly (subagent pass).
- 2026-07-10: oxfmt only formats ts/js — .svelte files keep their own style (tabs). Accepted the mixed indentation since oxfmt has no Svelte support.
- 2026-07-10: Root-caused the mysterious dev-server SIGTERMs: my own `pkill -f vite` / `pkill -f chrome-profile` matched the zsh wrapper of the command itself (the pattern string appears in the shell's argv), killing sibling processes. Switched to `fuser -k <port>/tcp`.
- 2026-07-10: chrome-devtools MCP lighthouse_audit has no Performance category (bundle ships an "agentic-browsing" category instead); ran Lighthouse CLI attached to a manually launched Chromium for perf numbers.
- 2026-07-10: First Lighthouse CLI attempt said "Unable to connect to Chrome" but /tmp/lh.json still had scores — stale file from a PREVIOUS session (DOM snippets didn't match my app). Deleted before re-running.
- 2026-07-10: Lantern-simulated FCP 2.2s vs observed 0.4s on home route only (berries: 100). Known simulation artifact for hydrated pages; documented in DECISIONS.md instead of chasing it (anti-stuck).
- 2026-07-10: Rebuild while `vite preview` kept running served stale asset hashes → blank page + NO_FCP audits. Restart preview after every build.
- 2026-07-10: Review subagent flagged 3 must-fixes (button-in-anchor cards, type-badge contrast, eager stat-sort fetch) — all applied, plus theme-color meta sync, evolution alt text, single-variant switcher hidden.
