# Deepen Frame Rendering And Slide Chrome

Type: AFK
Status: Open

## What to build

Deepen the motion deck frame model so each frame carries enough information for rendering, chrome, and transition selection without slide-specific branching in the stage. The stage should become a generic renderer for the current frame rather than the place that knows which slide content to choose.

Clean up leftover slide chrome from the removed reveal deck while preserving the visual result of the motion deck. Remove stale slide kinds that are no longer used. Reconcile the static think slide and the motion think content so there is one clear source of truth for that slide's visual assets.

## Acceptance criteria

- [ ] The cover, think, and output frames render identically to the current motion deck.
- [ ] The stage no longer contains slide-specific branching for cover, think, and output content.
- [ ] Unused slide kind values from old prototypes are removed.
- [ ] Think slide assets are not duplicated across separate render paths without a clear reason.
- [ ] Shared slide chrome remains available where the motion deck still uses it.
- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes.

## Blocked by

None - can start immediately.

