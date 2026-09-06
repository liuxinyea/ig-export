# free-ig-export Chrome Extension MVP

Load this folder in Chrome through `chrome://extensions` → enable Developer mode → **Load unpacked** → choose this `extension` directory.

## Current scope

- **Browser-assisted mode (default):** from the Popup on an Instagram profile, automatically opens the selected Followers/Following dialog, collects visible rows with conservative scrolling, and stops if the dialog is closed.
- **Direct API mode:** an advanced fallback that opens the workspace and requests paged list data through the browser's existing Instagram session.
- Pause support, local task persistence, deduplication, CSV and JSON exports, and a local pricing entry.
- No cloud execution, no user cookie uploads, no private-profile access, and no effort to evade platform controls.

## Test flow

1. Sign in to Instagram in Chrome yourself and open a public profile.
2. Open free-ig-export from the toolbar; Browser-assisted mode is selected by default.
3. Choose Followers/Following and a limit, then start collection. Keep the Instagram tab and its list dialog open until the task ends.
4. Select Direct API mode only when you want the separate workspace flow; it pre-fills the current profile and list configuration.
5. Pause or export the local results from the workspace.

## Known MVP limits

Instagram's DOM and web data routes can change without notice and should be treated as adapters requiring regression testing. Detailed profile enrichment, XLSX output, projects, tags and LinkedIn are planned next.
