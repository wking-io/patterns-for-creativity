# Deepen Cloud Canvas Orchestration

Type: AFK
Status: Open

## What to build

Deepen cloud canvas orchestration into a Module that owns sizing, device pixel ratio handling, timestep management, metaball lifecycle, field sampling, smoothing, contour extraction, and drawing order. React should act as the mount and unmount Adapter for the canvas.

Preserve the title slide's animated line-art cloud contours. The change should improve Locality for performance tuning and make future Dialkit-driven cloud parameters easier to add.

## Acceptance criteria

- [ ] The title slide cloud canvas remains visually equivalent to the current version.
- [ ] React lifecycle code delegates render-loop orchestration to a focused Module.
- [ ] Canvas scaling behavior is covered by focused tests.
- [ ] Metaball reset/signature behavior is covered by focused tests.
- [ ] Render loop cleanup still cancels animation work on unmount.
- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes.

## Blocked by

None - can start immediately.

