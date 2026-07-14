# Recover And Monitor The Audience Display

Type: AFK
Status: Done

## What to build

Make the second-display workflow dependable at a venue. Presenter View should show whether the audience display is opening, connected, disconnected, or blocked, and should help the presenter recover without losing the current frame or unsaved notes.

An audience display that opens late or reloads should request and receive the latest complete presentation state. Synchronization should reject stale updates and avoid message loops. The same workflow should remain usable from the generated offline presentation package without depending on a remote service.

## Acceptance criteria

- [x] Presenter View distinguishes opening, connected, disconnected, closed, and popup-blocked audience-display states.
- [x] A late-opening or reloaded audience display joins at the presenter's current frame rather than relying on an earlier cached frame.
- [x] Closing the audience display updates Presenter View without changing the current frame or unsaved notes.
- [x] Reopening an audience display creates a fresh connection and restores the latest presentation state.
- [x] Stale or duplicated synchronization messages cannot rewind the deck or cause navigation loops.
- [x] Popup blocking produces actionable recovery guidance and does not discard presenter state.
- [x] The synchronized presenter and audience workflow works from the generated offline presentation artifact without a remote service.
- [x] Focused tests cover joining, reconnection, stale-message rejection, duplicate-message handling, and display closure.
- [x] `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Blocked by

- [007 - Open and control a synchronized audience display](./007-open-and-control-a-synchronized-audience-display.md)
