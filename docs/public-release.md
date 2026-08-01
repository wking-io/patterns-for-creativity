# Public release record

The repository was prepared for public release on July 31, 2026. This document
records the decisions made, the destructive history maintenance performed, and
the checks to repeat before a future release.

## Licensing and assets

- Project-authored source code, documentation, presentation text, and original
  artwork use the MIT License in [`../LICENSE`](../LICENSE).
- Third-party fonts retain the SIL Open Font License 1.1. Copyright notices and
  the complete license ship in [`../public/fonts/LICENSE`](../public/fonts/LICENSE).
- Screenshots, quotations, social posts, photos, video clips, and other
  third-party presentation examples are explicitly outside the MIT grant. See
  [`../THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).
- OffBit, Noppo, Redaction, and SCHABO font binaries were removed because their
  redistribution terms were not suitable or sufficiently clear for a public
  source repository. They were replaced with OFL-licensed Fontsource packages:
  Silkscreen, Dela Gothic One, Libre Baskerville, and Big Shoulders Display.
- Unused previews, duplicate source videos, and other unreferenced working
  media were removed from the current tree and from Git history.

The third-party examples are present for identification, discussion, and
commentary. Their owners retain all rights; publishing this repository does not
grant downstream users permission to extract or reuse those items.

## Security and dependency review

- Environment files, Wrangler state, logs, coverage, local working media, and
  generated output are ignored.
- Binary file types are marked in `.gitattributes`.
- Presenter/audience `postMessage` traffic validates both origin and source.
- Private Notion bookmark URLs were replaced in the current talk script and
  redacted from every reachable historical revision.
- Dependencies were updated and `pnpm audit --audit-level moderate` reported no
  known vulnerabilities.
- CI runs type-checking, tests, the production build, and a dependency audit.
- A dedicated history-aware Gitleaks scan was run after the rewrite.

## History rewrite

Git history was rewritten with `git filter-repo` to remove:

- the roughly 111 MiB
  `src/slides/19-exposure-practice/fish.mp4` working asset;
- media deleted during the public-release cleanup;
- the four removed font families; and
- private Notion bookmark URLs.

The stale, already-merged `issue-005-cloud-canvas-orchestration` remote branch
was removed so it could not retain the pre-release object graph.

All pre-rewrite commit IDs are obsolete. Anyone with an older clone should
re-clone. Do not merge an old local branch into the rewritten history, because
that would reintroduce the removed objects.

To inspect the largest reachable blobs:

```sh
git rev-list --objects --all |
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' |
  sort -k3 -n |
  tail -30
```

## Deployment ownership

`wrangler.jsonc` intentionally documents the maintainer's production Worker and
the `laracon.wking.dev` custom domain. It contains no credentials, but it is not
a deployment target for contributors. Forks must replace the Worker name and
route with infrastructure they control. The `private: true` package setting is
also intentional: this is a public source repository, not an npm package.

## Release verification

From a clean clone:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm verify
pnpm audit --audit-level moderate
gitleaks git --redact --no-banner .
git status --short
```

Also smoke-test:

- the default deck at `/`;
- Presenter View at `/?view=presenter`;
- an audience display opened from Presenter View; and
- the organizer at `/organize`.

Confirm that the audience reports as connected, that all fonts render, and that
the browser reports no failed images or media. The July 31, 2026 release check
passed all four surfaces.
