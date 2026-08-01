# Codebase guide

This is the starting point for agents and contributors working on Patterns for
Creativity. Read `CONTEXT.md` as well; its vocabulary is part of the product and
should be used consistently in code, notes, and documentation.

## What this repository is

The project is a React presentation deck rather than a conventional website or
component library. It has four closely related browser surfaces:

1. The default deck is the presenter-controlled, full-screen presentation.
2. Presenter View adds current and next previews, speaker notes, a timer,
   audience status, and presentation controls.
3. Audience View is a clean second-window rendering controlled by Presenter
   View.
4. The organizer is a one-off visual tool that produces a handoff request for
   reordering the frame registry in code.

The same frame registry and renderer drive all four surfaces. Differences such
as audio, animation, autoplay, and automatic advancement are explicit stage
mode behavior, not separate slide implementations.

## Start here

The runtime path is:

```text
index.html
  -> src/main.tsx
  -> src/motion-deck/MotionDeckApp.tsx
  -> src/motion-deck/frames.tsx
  -> src/motion-deck/MotionStage.tsx
  -> src/slides/<slide>/index.tsx
```

`src/main.tsx` chooses between the organizer and the deck application.
`MotionDeckApp` owns current-frame navigation and wires browser events to the
presentation session. `motionDeckFrames` is the canonical ordered list of
frames. `MotionStage` maps each frame to slide content and applies the rendering
behavior for its mode.

## Frame and slide model

A frame is one step in the presentation. A slide component can back more than
one frame.

- Every frame has a stable, unique `id`. Hash navigation, notes, synchronization,
  and tests depend on these IDs.
- `kind` selects the outer layout in `src/slides/SlideFrame.tsx`.
- `sourceId` lets a frame reuse another frame's slide component while passing a
  different variant or state.
- Variant properties select intentional states within a slide component.
- `isStatic` and `isBlank` suppress behavior for special frames.
- Transition settings live on the frame so sequencing remains visible in one
  place.

When adding a frame:

1. Add or update the co-located slide component under `src/slides/`.
2. Add the frame object to `motionDeckFrames` in the intended order.
3. Update `MotionStage` if this is a new content source rather than another
   variant of an existing source.
4. Add speaker notes keyed by the stable frame ID in
   `src/motion-deck/presentation-notes.json`.
5. Run `pnpm verify`.

Do not rename an existing frame ID casually. Treat it like a persisted data key.

## Navigation and rendering modes

`src/motion-deck/navigation.ts` owns hash parsing, bounds, direction, keyboard
intent, and swipe intent. URL hashes are one-based (`#/1`), while internal frame
indexes are zero-based.

`src/motion-deck/stage-mode.ts` is the policy table for rendering modes:

- `live`: animation, audio, autoplay, and auto-advance are enabled.
- `presenter`: animation and auto-advance are enabled; audio is disabled.
- `audience`: animation, audio, and autoplay are enabled; the audience cannot
  independently auto-advance the presentation.
- `preview`: animation, audio, autoplay, and auto-advance are disabled.

Keep side effects behind this policy. Organizer and next-slide previews must
remain inert.

## Presenter and audience synchronization

Presenter View is the canonical owner of navigation and shared interaction
state. `src/motion-deck/usePresentationSession.ts` coordinates the windows with
`BroadcastChannel` and `window.postMessage`. The protocol and validation helpers
live in `src/motion-deck/presentation-sync.ts`.

The synchronization contract includes frame and direction, audience lifecycle
and heartbeat state, blackout, tile reveals, portal masks, and interactive
pointer or synth state. Preserve sequence checks and sender/session IDs when
changing the protocol; they prevent stale messages and feedback loops.

## Speaker notes

Bundled notes live in `src/motion-deck/presentation-notes.json` and are keyed by
frame ID. Presenter View edits an in-memory notes session. In development,
`speaker-notes-plugin.ts` exposes a local POST endpoint that validates and
writes the complete notes document back to that JSON file. A production or
offline build has no filesystem write endpoint, so it cannot persist note
edits to the source tree.

The schema and serialization functions are in
`src/motion-deck/speaker-notes.ts`. Keep changes backward-compatible or bump the
version deliberately and add migration behavior.

## Offline build

`offline-cache-plugin.ts` runs only during Vite builds. It inventories emitted
assets and creates:

- `offline-asset-manifest.json`, the shared build/runtime asset contract;
- `offline-sw.js`, the generated service worker;
- `offline.html` and `motion-deck.html`, single-file presentation artifacts.

`src/offline-assets.ts` consumes the manifest in the browser, caches assets,
waits for fonts, and decodes images. The shared schema and validation live in
`src/offline-package.ts`.

`scripts/prepare-worker-assets.mjs` is a deployment-only post-build step. It
uses `ffprobe` and a two-pass `ffmpeg` encode to bring oversized MP4 files under
Cloudflare's 25 MiB asset limit.

## Visual system and assets

Global tokens, fonts, frame layouts, and common slide styles live in
`src/styles.css`. Motion deck and organizer chrome have separate styles under
`src/motion-deck/`.

Slide-specific code and media are co-located under `src/slides/<slide>/`.
Prefer optimized browser formats and do not commit working originals or unused
previews. The repository intentionally ignores the large historical
`fish.mp4` source. Before adding a large binary, confirm that the production
build actually imports it and consider whether it belongs in external storage
or Git LFS.

The animated title cloud is a separate deep module under `src/cloud/`.
`CloudCanvas.tsx` is the React adapter; orchestration, field sampling, contour
extraction, metaballs, and drawing live in focused TypeScript modules.

## Tests and checks

Use these commands from the repository root:

```sh
pnpm check
pnpm test
pnpm build
```

`pnpm verify` runs all three. The Node tests under `tests/` target navigation,
frame ordering, notes, synchronization, presenter controls, offline packaging,
collection layout, synth behavior, and tile recording. Cloud orchestration uses
Vitest in `src/cloud/orchestration.test.ts`.

Visual changes still need manual verification in the default deck, Presenter
View, and organizer. Check at least the affected frame, its preceding
transition, its next-slide preview, and the audience mode when shared state or
media behavior changes.

## Deployment

`wrangler.jsonc` deploys the built `dist/` directory as Cloudflare static
assets. It currently names the maintainer's Worker and custom domain. Do not
change or deploy that configuration as part of ordinary code work. A fork must
replace those values with infrastructure it owns.

## Repository workflow

- Preserve unrelated working-tree changes.
- Read relevant ADRs under `docs/adr/` when that directory exists.
- Track work in local Markdown issues under `docs/issues/`; conventions are in
  `docs/agents/issue-tracker.md`.
- Use the terminology in `CONTEXT.md`; do not introduce alternate names for
  defined domain concepts.
- Keep generated output (`dist/`, `.tmp/`, coverage, Wrangler state, and local
  environment files) out of Git.
- Update tests and this guide when an architectural contract changes.

Before publishing the repository or changing its visibility, follow
`docs/public-release.md`.
