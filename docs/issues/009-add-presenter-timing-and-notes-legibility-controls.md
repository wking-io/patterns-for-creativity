# Add Presenter Timing And Notes Legibility Controls

Type: AFK
Status: ready-for-agent

## What to build

Add compact presentation aids to Presenter View: the current local time, a controllable elapsed presentation timer, and notes text-size controls. These controls should improve at-a-glance use during a talk without reducing the usable space for the current preview, next preview, or notes.

Presenter preferences should survive ordinary reloads on the same browser. Timing and legibility controls belong only to Presenter View and must not affect the audience display or the visual scale of the slides themselves.

## Acceptance criteria

- [ ] Presenter View shows the current local time and a clearly distinguishable elapsed presentation time.
- [ ] The elapsed timer supports start, pause, resume, and reset without changing frames.
- [ ] Frame navigation and notes editing do not implicitly reset or pause the elapsed timer.
- [ ] The presenter can increase, decrease, and restore the default notes text size within sensible limits.
- [ ] Notes text-size preference survives an ordinary Presenter View reload in the same browser.
- [ ] Timing and notes-legibility controls never appear in the default deck or audience display.
- [ ] Controls remain usable at narrower laptop viewport sizes without covering slide previews or notes.
- [ ] Keyboard shortcuts do not activate presentation controls while focus is in an editable notes field.
- [ ] Focused tests cover elapsed-time state transitions and bounded notes text-size preferences.
- [ ] `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Blocked by

- [006 - Rehearse with filesystem-backed speaker notes](./006-rehearse-with-filesystem-backed-speaker-notes.md)
