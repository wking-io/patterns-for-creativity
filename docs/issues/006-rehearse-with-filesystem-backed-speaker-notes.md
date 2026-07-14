# Rehearse With Filesystem-Backed Speaker Notes

Type: AFK
Status: Done

## What to build

Add an opt-in Presenter View that lets a presenter rehearse the deck, read the current frame's speaker notes, preview the next frame, and edit notes without changing the clean default deck experience.

Speaker notes should live in a versioned, user-selected file keyed by stable frame IDs rather than in browser-only storage. Presenter View should let the user create or open that notes file, edit the current frame's note body and optional cue, and save changes back to the same file when the browser supports persistent file handles. Browsers without persistent file-handle support should retain the edits in memory and offer an explicit Save As fallback that writes the complete notes file to the filesystem.

The presenting surface should default to a readable notes view, make editing an intentional action, and clearly communicate unsaved, saved, and failed-save states. Navigating the deck must remain available while editing or saving, and the app must warn before discarding unsaved work.

## Acceptance criteria

- [x] An explicit Presenter View opens at the frame identified by the existing URL hash, while the default deck route remains visually and behaviorally unchanged.
- [x] Presenter View shows a large current-frame preview, an inert next-frame preview, the current frame label and position, speaker notes, and previous/next controls.
- [x] The next-frame preview does not autoplay media, run entrance effects, or trigger automatic navigation.
- [x] The user can create a notes file, open an existing notes file, and associate note bodies and optional presenter cues with stable frame IDs.
- [x] The user can intentionally enter and leave note-editing mode without exposing editing controls in the default deck view.
- [x] Save and the platform-appropriate keyboard shortcut write the complete current notes state back to the selected file when persistent file access is available.
- [x] Browsers without persistent file access offer a clear Save As fallback and do not imply that changes have overwritten the originally opened file.
- [x] Presenter View reports unsaved, saving, saved, invalid-file, and failed-save states without blocking slide navigation.
- [x] Switching notes files or leaving the page warns before unsaved changes can be lost.
- [x] Missing notes have a useful empty state, and malformed or unsupported notes files fail without discarding the in-memory notes state.
- [x] Keyboard navigation does not fire while the user is typing in or interacting with the notes editor.
- [x] Focused tests cover notes-file parsing and serialization, frame-to-note association, dirty-state transitions, and preview suppression of presentation side effects.
- [x] `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Blocked by

None - can start immediately.
