# Patterns for Creativity

An interactive presentation about recognizing and cultivating the conditions
that produce creative ideas. The deck was built for Laracon 2026 and includes
animated slides, presenter notes, a synchronized audience display, an organizer,
and an offline package.

## Run locally

Requirements:

- Node.js 22.12 or newer
- pnpm 11.18.0

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. The development server binds to `127.0.0.1` by
default; use `pnpm dev:lan` only when the deck needs to be reachable from another
device on the local network.

## Presentation surfaces

| Surface | URL |
| --- | --- |
| Deck | `/` |
| Presenter view | `/?view=presenter` |
| Slide organizer | `/organize` or `/?view=organize` |
| Audience view | Opened from Presenter View |

Use the arrow keys, Page Up/Page Down, `N`/`P`, or Space to move through the
deck. Press Shift+G to toggle the layout grid. Presenter View also supports `B`
to black out a connected audience display.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local development server |
| `pnpm check` | Type-check the project |
| `pnpm test` | Run the Node and Vitest suites |
| `pnpm build` | Build the site and offline artifacts into `dist/` |
| `pnpm verify` | Run type-checking, tests, and the production build |
| `pnpm preview` | Preview the production build locally |
| `pnpm deploy:worker` | Build, prepare large assets, and deploy with Wrangler |

The build produces the normal Vite site plus `offline.html`,
`motion-deck.html`, `offline-asset-manifest.json`, and `offline-sw.js`.
`pnpm deploy:worker` additionally requires `ffmpeg` and `ffprobe` when an MP4
must be reduced to Cloudflare's per-file asset limit.

The checked-in `wrangler.jsonc` is the maintainer's production configuration
for `laracon.wking.dev`. It is public intentionally, but it is not a deployment
target for forks. Use a Worker name and route in infrastructure you control.

## Project map

- `src/motion-deck/` owns frame order, navigation, rendering modes, presenter
  tools, notes, and presenter/audience synchronization.
- `src/slides/` contains the slide components and their co-located media.
- `src/cloud/` contains the animated contour system used by the title slide.
- `offline-cache-plugin.ts` creates the offline manifest, service worker, and
  single-file builds.
- `speaker-notes-plugin.ts` lets Presenter View save
  `src/motion-deck/presentation-notes.json` while the dev server is running.
- `tests/` and `src/cloud/orchestration.test.ts` cover the non-visual behavior.

For a deeper architectural and workflow guide, see
[`docs/agents/codebase-guide.md`](docs/agents/codebase-guide.md).

## Restore the original typography

The public repository uses redistributable substitutes for four fonts from the
original deck. If you want to restore its original typography, obtain the fonts
from their creators and make sure your licenses cover self-hosted web use:

| Original font | Used for | Public-repo substitute | Source |
| --- | --- | --- | --- |
| OffBit Regular and Bold | Pixel display type | Silkscreen | [Power Type on MyFonts](https://www.myfonts.com/collections/offbit-font-power-type) |
| SCHABO X Condensed | Condensed display type | Big Shoulders Display | [Tom Robin Karlsson](https://tomrobin.co/) |
| NOPPO Solid | Rounded headline type | Dela Gothic One | [Studio Noppo](https://studionoppo.gumroad.com/l/noppo-font) |
| Redaction Regular and Bold | Editorial serif type | Libre Baskerville | [MCKL](https://www.mckltype.com/typefaces/redaction) |

1. Copy the licensed font files into the ignored
   `public/fonts/local-original/` directory. The example below expects these
   names; either rename the supplied files or adjust the URLs and `format()`
   values to match them:

   ```text
   public/fonts/local-original/
   ├── OffBit-Regular.woff2
   ├── OffBit-Bold.woff2
   ├── SCHABO-XCondensed.woff2
   ├── Noppo-Solid.otf
   ├── Redaction-Regular.woff2
   └── Redaction-Bold.woff2
   ```

2. Add the following declarations near the top of `src/styles.css`, after the
   Fontsource imports:

   ```css
   @font-face {
     font-family: "OffBit";
     font-display: swap;
     font-style: normal;
     font-weight: 400;
     src: url("/fonts/local-original/OffBit-Regular.woff2") format("woff2");
   }

   @font-face {
     font-family: "OffBit";
     font-display: swap;
     font-style: normal;
     font-weight: 700;
     src: url("/fonts/local-original/OffBit-Bold.woff2") format("woff2");
   }

   @font-face {
     font-family: "SCHABO";
     font-display: swap;
     font-style: normal;
     font-weight: 400;
     src: url("/fonts/local-original/SCHABO-XCondensed.woff2") format("woff2");
   }

   @font-face {
     font-family: "Noppo";
     font-display: swap;
     font-style: normal;
     font-weight: 400;
     src: url("/fonts/local-original/Noppo-Solid.otf") format("opentype");
   }

   @font-face {
     font-family: "Redaction";
     font-display: swap;
     font-style: normal;
     font-weight: 400;
     src: url("/fonts/local-original/Redaction-Regular.woff2") format("woff2");
   }

   @font-face {
     font-family: "Redaction";
     font-display: swap;
     font-style: normal;
     font-weight: 700;
     src: url("/fonts/local-original/Redaction-Bold.woff2") format("woff2");
   }
   ```

3. In the `@theme` block in `src/styles.css`, restore the two shared display
   stacks while retaining the public fonts as fallbacks:

   ```css
   --font-offbit: "OffBit", "Silkscreen", sans-serif;
   --font-schabo: "SCHABO", "Big Shoulders Display Variable", sans-serif;
   ```

4. In the same file, replace the three direct font declarations:

   ```css
   /* Replace "Dela Gothic One", sans-serif */
   font-family: "Noppo", "Dela Gothic One", sans-serif;

   /* Replace both occurrences of "Libre Baskerville", serif */
   font-family: "Redaction", "Libre Baskerville", serif;
   ```

5. Run `pnpm verify`, then visually check the deck and its offline build.

Do not commit the downloaded font files unless their licenses explicitly allow
redistribution. The offline build can embed referenced assets in downloadable
HTML, so distributing that build may require rights beyond an ordinary website
license.

## Publication and licensing

Project-authored source code, documentation, presentation text, and original
artwork are available under the [MIT License](LICENSE). Bundled fonts use the
SIL Open Font License 1.1. Screenshots, quotations, social posts, photos, video
clips, and other third-party examples remain the property of their respective
owners and are not relicensed under MIT. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for details.

The public-release work and its repeatable verification steps are recorded in
[`docs/public-release.md`](docs/public-release.md).
