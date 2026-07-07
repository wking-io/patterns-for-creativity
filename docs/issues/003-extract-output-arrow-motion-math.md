# Extract Output Arrow Motion Math

Type: AFK
Status: Open

## What to build

Move the output arrow's timing, easing, geometry interpolation, color interpolation, and keyframe calculation into a pure Implementation that the output slide renderer consumes. Preserve the existing animation and final visual state.

This should create a clean test Seam around the motion math so future animation tuning, including possible Dialkit-controlled parameters, can be done without testing through the full rendered slide every time.

## Acceptance criteria

- [ ] The output slide animation remains visually equivalent to the current version.
- [ ] The pure motion calculation handles start, mid-animation, and final states.
- [ ] Point interpolation, value interpolation, color interpolation, and clamping are covered by focused tests.
- [ ] The React slide renderer delegates motion math instead of owning it inline.
- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes.

## Blocked by

None - can start immediately.

