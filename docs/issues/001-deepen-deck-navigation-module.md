# Deepen Deck Navigation Module

Type: AFK
Status: Done

## What to build

Deepen the motion deck navigation into a focused Module that owns frame bounds, movement direction, hash parsing, hash writing, keyboard intent, and swipe intent. The visible deck should behave exactly as it does today, but the app shell should mostly wire browser events into the navigation Implementation.

Keep Dialkit mounted and available for future controls. The new navigation shape should make it straightforward for a later Dialkit control to move to a specific frame or adjust navigation-related behavior without adding more state logic to the app shell.

## Acceptance criteria

- [x] `/` renders the motion deck.
- [x] Direct hashes such as `#/2` still open the expected frame.
- [x] Keyboard next and previous controls preserve current behavior.
- [x] Swipe next and previous controls preserve current behavior.
- [x] Frame direction is still available to motion transitions.
- [x] Hash parsing and frame clamping are covered by focused tests.
- [x] `pnpm check` passes.
- [x] `pnpm build` passes.

## Blocked by

None - can start immediately.
