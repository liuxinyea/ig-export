# AGENTS.md

LeadFlow is a local-first Chrome extension (Manifest V3, plain JS/CSS — no build step, no package manager, no test framework). The entire shippable product lives in `extension/`; root-level zip files are build artifacts, not source.

## Commands

- **Load for dev:** `chrome://extensions` → Developer mode → Load unpacked → select `extension/`. Reload the extension after every code change; content-script changes also need the Instagram tab reloaded (the `var collector = globalThis.__leadflowCollector` guard in `content.js` exists to survive extension reloads without a tab refresh).
- **Package for Web Store:** `node scripts/pack-extension.mjs` — zips `extension/` to `leadflow-v<version>.zip` at repo root, version read from `manifest.json`. Requires system `zip`. Bump `manifest.json` `version` first.
- **Regenerate icons:** `python3 scripts/render-icons.py` (needs Pillow) — derives 16/32/64/128 PNGs from `extension/icons/leadflow-exporter-128.png`. Do not hand-edit the size variants.
- No lint/typecheck/test tooling exists. Verification is manual: load unpacked, sign in to Instagram, run a collection on a public profile. Instagram DOM/API changes break adapters silently — treat `content.js` selectors and `instagram-api.js` query hashes/HTML-ID patterns as regression-prone.

## Architecture (`extension/`)

- `manifest.json` — MV3; service worker `background.js` (ES module); only host permission is `https://www.instagram.com/*`; CDN avatar hosts are *optional* permissions (avatar fetch in background.js validates host before requesting).
- `content.js` — injected on demand via `chrome.scripting` (not declared in manifest); runs the browser-assisted collector: opens the followers/following dialog, scrolls, scrapes visible rows, sends batches to background. Instagram UI label matching (followers/following stat, verified badge) is fully data-driven from `i18n/` — do not hardcode localized strings in content.js.
- `i18n/` — localized Instagram UI labels consumed by `content.js`: one `<locale>.json` per language plus `index.json` registry. When Instagram ships UI text in another language, add a JSON file and register it in `index.json` — no code changes. Loaded at runtime via `chrome.runtime.getURL` (declared in `web_accessible_resources`); malformed/missing files are skipped, never block collection.
- `background.js` — message router; owns the single task object in `chrome.storage.local` under key `leadflow.currentTask`, dedupes records by username, fetches avatars.
- `popup.html/js` — toolbar UI; starts browser-assisted collection, controls pause/stop, exports CSV/JSON/XLS(XLS is HTML table with `.xls` mime).
- `workspace.html` + `workspace-direct-v2.js` + `instagram-api.js` — the Direct API mode page: fetches profile HTML to extract the numeric ID, then paginates `graphql/query/` with hardcoded `query_hash` values using the user's own session (`credentials: "include"`). Exports CSV/Excel/HTML/Markdown.
- `vendor/layui/` — vendored Layui UI framework; never modify, it is third-party.
- **Dead files (not referenced by any HTML/manifest — do not edit as if live):** `workspace.js`, `workspace-direct.js`, `workspace-v2.css`. `workspace-direct-v2.js` is the active workspace script.

## Conventions and constraints

- All extension UI strings, comments in new code, and docs are in English; `scripts/` and `README.md` contain Chinese — match the surrounding file.
- Local-first is a hard product rule: data stays in `chrome.storage.local` unless the user explicitly exports; never add cookie uploads, cloud sync, background automation, auto-follow/DM/like, or private-profile access. Rate-limit responses must pause, not aggressively retry.
- Keep permissions minimal; any new host permission needs manifest + product justification.
- Message protocol: `leadflow:<action>` over `chrome.runtime.sendMessage`; async listeners must `return true`.
