# Add Presenter Timing And Notes Legibility Controls

Type: AFK
Status: Done

## What to build

Add compact presentation aids to Presenter View: the current local time, a controllable elapsed presentation timer, and notes text-size controls. These controls should improve at-a-glance use during a talk without reducing the usable space for the current preview, next preview, or notes.

Presenter preferences should survive ordinary reloads on the same browser. Timing and legibility controls belong only to Presenter View and must not affect the audience display or the visual scale of the slides themselves.

## Acceptance criteria

- [x] Presenter View shows the current local time and a clearly distinguishable elapsed presentation time.
- [x] The elapsed timer supports start, pause, resume, and reset without changing frames.
- [x] Frame navigation and notes editing do not implicitly reset or pause the elapsed timer.
- [x] The presenter can increase, decrease, and restore the default notes text size within sensible limits.
- [x] Notes text-size preference survives an ordinary Presenter View reload in the same browser.
- [x] Timing and notes-legibility controls never appear in the default deck or audience display.
- [x] Controls remain usable at narrower laptop viewport sizes without covering slide previews or notes.
- [x] Keyboard shortcuts do not activate presentation controls while focus is in an editable notes field.
- [x] Focused tests cover elapsed-time state transitions and bounded notes text-size preferences.
- [x] `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Blocked by

- [006 - Rehearse with filesystem-backed speaker notes](./006-rehearse-with-filesystem-backed-speaker-notes.md)
