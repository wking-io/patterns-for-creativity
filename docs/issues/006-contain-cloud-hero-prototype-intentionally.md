# Contain Cloud Hero Prototype Intentionally

Type: HITL
Status: Open

## What to build

Decide whether the cloud hero prototype is archival or active product work. If it is archival, document that status in the repo and keep it out of the default deck path. If it is active, split the prototype into clearer Modules for shader source, renderer setup, pointer interaction, render loop, and preset catalog.

The goal is intentional containment: preserve the prototype, keep Dialkit available for future controls, and avoid accidental coupling between the prototype and the motion deck.

## Acceptance criteria

- [ ] A repo-level decision records whether the cloud hero prototype is archival or active.
- [ ] If archival, the source remains preserved and excluded from the default deck path.
- [ ] If active, follow-up AFK issues are created for splitting shader, renderer, interaction, and preset work.
- [ ] Cloud preset IDs are documented so the TypeScript preset catalog and shader preset behavior stay aligned.
- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes.

## Blocked by

None - can start immediately.

