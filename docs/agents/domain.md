# Domain Docs

How engineering skills should consume this repository's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repository root.
- Relevant architectural decisions under `docs/adr/`.

If these files do not exist, proceed silently. They are created lazily when domain terminology or architectural decisions need to be recorded.

## File structure

This is a single-context repository: one root `CONTEXT.md` and one root `docs/adr/` directory apply to the project.

## Use the glossary's vocabulary

When naming a domain concept, use the term defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If a needed concept is missing, reconsider whether the language belongs to the project or note the documentation gap for a future domain-doc session.

## Flag ADR conflicts

Surface any conflict with an existing ADR explicitly rather than silently overriding it.
