# Open And Control A Synchronized Audience Display

Type: AFK
Status: ready-for-agent

## What to build

Let Presenter View open a separate, clean audience display and control its current frame. The presenter should be the canonical navigation owner, while the audience display follows frame changes and renders the normal presentation transitions without ever loading or exposing speaker notes.

Both surfaces should use the same deck and navigation behavior. Navigation initiated by keyboard, controls, swipe, or an automatic media completion should update Presenter View first and then synchronize the resulting frame and direction to the audience display. Presentation side effects must have one owner so media completion cannot advance the deck twice.

## Acceptance criteria

- [ ] Presenter View has an explicit action that opens an audience display at the presenter's current frame.
- [ ] Audience display mode renders only the audience-facing deck and never loads, requests, or displays the speaker-notes file.
- [ ] Presenter navigation updates the audience display's frame and transition direction promptly.
- [ ] Opening the audience display does not reset the presenter's current frame, notes edits, or timer state.
- [ ] The presenter is the canonical owner of frame state; the audience display does not independently overwrite that state.
- [ ] Automatic media completion advances the presentation exactly once and synchronizes the resulting frame to both surfaces.
- [ ] The presenter and audience URL hashes reflect the synchronized current frame for refresh and inspection.
- [ ] Existing single-window keyboard, swipe, hash, and transition behavior remains available when no audience display is open.
- [ ] Focused tests cover presenter-to-audience navigation messages, direction propagation, and exactly-once automatic advancement.
- [ ] `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Blocked by

- [006 - Rehearse with filesystem-backed speaker notes](./006-rehearse-with-filesystem-backed-speaker-notes.md)
