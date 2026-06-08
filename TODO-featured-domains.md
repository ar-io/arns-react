# Featured Domains Update

## Domain Replacements
- `sam` -> `gutenberg`
- `ao` -> `ar-io`
- `permaswap` -> `console`
- `ar-fees` -> `docs`
- `metalinks` -> `wuzzy`

## Unchanged Domains
- arlink, ardrive, arwiki, mfers

## New Ordering (top 3 first)
1. docs
2. ardrive
3. gutenberg
4. (remaining order TBD)

## Notes
- New screenshot images needed for: gutenberg, ar-io, console, docs, wuzzy
- Only ar-io.ar.io has an OG image (`https://ar.io/previews/home-og.jpg`); the rest have none
- Code changes are in `src/utils/constants.ts` (FEATURED_DOMAINS object and image imports)
- All domain URLs are generated dynamically via `useWayfinderUrl` in ARNSCard, so only the keys and images need updating
