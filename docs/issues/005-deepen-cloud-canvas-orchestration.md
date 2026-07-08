# Deepen Cloud Canvas Orchestration

Type: AFK
Status: Done

## What to build

Deepen cloud canvas orchestration into a Module that owns sizing, device pixel ratio handling, timestep management, metaball lifecycle, field sampling, smoothing, contour extraction, and drawing order. React should act as the mount and unmount Adapter for the canvas.

Preserve the title slide's animated line-art cloud contours. Remove anything "configurable" and optimize based on the final values.

## Acceptance criteria

- [x] The title slide cloud canvas remains visually equivalent to the current version.
- [x] React lifecycle code delegates render-loop orchestration to a focused Module.
- [x] Canvas scaling behavior is covered by focused tests.
- [x] Metaball reset/signature behavior is covered by focused tests.
- [x] Render loop cleanup still cancels animation work on unmount.
- [x] `pnpm check` passes.
- [x] `pnpm build` passes.

## Blocked by

None - can start immediately.
