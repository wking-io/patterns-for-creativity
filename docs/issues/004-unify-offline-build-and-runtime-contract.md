# Unify Offline Build And Runtime Contract

Type: AFK
Status: Open

## What to build

Create a single offline package Module that owns the manifest shape and validation expectations shared by build-time offline generation and runtime offline preparation. Preserve the current build outputs: the asset manifest, service worker, offline single-file HTML, and motion deck single-file HTML.

Improve failure behavior so runtime offline preparation exposes meaningful state when manifest loading, caching, service worker registration, image decoding, or font readiness fail or are unavailable. Keep browser-specific capabilities behind an Adapter so the offline preparation logic is testable.

## Acceptance criteria

- [ ] Build-time and runtime offline code use the same manifest shape.
- [ ] Runtime offline state can represent success, unavailable features, and errors consistently.
- [ ] Existing offline artifacts are still generated during build.
- [ ] The single-file HTML output still inlines script, style, and asset references correctly.
- [ ] Focused tests cover manifest shape and at least one single-file HTML replacement case.
- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes.

## Blocked by

None - can start immediately.

