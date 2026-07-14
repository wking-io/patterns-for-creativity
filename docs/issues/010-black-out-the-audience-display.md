# Black Out The Audience Display

Type: AFK
Status: ready-for-agent

## What to build

Give the presenter a fast way to temporarily black out the audience display without changing the current frame, pausing the presenter workflow, or exposing presenter controls. Blackout should be controlled from Presenter View through both a visible control and a keyboard shortcut.

The presenter should continue seeing previews and notes and should be able to navigate while the audience is blacked out. Clearing blackout should reveal the latest synchronized frame rather than the frame that was visible when blackout began.

## Acceptance criteria

- [ ] Presenter View has a visible audience-blackout control and a `B` keyboard shortcut.
- [ ] Activating blackout replaces the audience display with a fully black surface while leaving Presenter View unchanged.
- [ ] Frame navigation, notes editing, saving, and timing continue while the audience is blacked out.
- [ ] Clearing blackout reveals the latest current frame and normal presentation rendering.
- [ ] An audience display that opens or reconnects during blackout starts blacked out until the presenter clears the state.
- [ ] Blackout state is owned by the presenter and cannot be cleared by an audience-display reload.
- [ ] Typing `B` in an editable notes field does not toggle blackout.
- [ ] Blackout has no effect when Presenter View has no connected audience display, apart from clearly communicating that state.
- [ ] Focused tests cover blackout synchronization, navigation during blackout, late audience joining, and editable-target keyboard handling.
- [ ] `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Blocked by

- [007 - Open and control a synchronized audience display](./007-open-and-control-a-synchronized-audience-display.md)
