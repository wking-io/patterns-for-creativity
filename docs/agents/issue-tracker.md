# Issue tracker: Local Markdown

Issues for this repository live as Markdown files under `docs/issues/`.

## Conventions

- Each issue is `docs/issues/<NNN>-<slug>.md`.
- The issue title is the first-level heading.
- `Type:` and `Status:` lines near the top record ownership and workflow state.
- Acceptance criteria are Markdown task-list items.
- Dependencies are recorded under `## Blocked by`.
- `docs/issues/README.md` indexes the current issues and their status.

## When a skill says "publish to the issue tracker"

Create the next numbered issue file under `docs/issues/` and add it to `docs/issues/README.md`.

## When a skill says "fetch the relevant ticket"

Read the referenced file under `docs/issues/`. The user will normally provide its path or issue number.
