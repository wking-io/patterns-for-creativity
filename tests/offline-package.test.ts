import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { getSingleFileHtml } from "../offline-cache-plugin.ts";
import {
  createOfflineAssetManifest,
  validateOfflineAssetManifest,
  type OfflineAsset,
} from "../src/offline-package.ts";

test("creates and validates the shared offline manifest shape", () => {
  const assets: OfflineAsset[] = [
    { bytes: 11, kind: "script", url: "/assets/app.js" },
    { bytes: 7, kind: "style", url: "/assets/app.css" },
  ];
  const manifest = createOfflineAssetManifest({
    assets,
    buildTime: "2026-07-08T00:00:00.000Z",
  });

  assert.deepEqual(manifest, {
    assets,
    buildTime: "2026-07-08T00:00:00.000Z",
    totalBytes: 18,
  });
  assert.deepEqual(validateOfflineAssetManifest(manifest), {
    manifest,
    ok: true,
  });
  assert.equal(validateOfflineAssetManifest({ ...manifest, totalBytes: 19 }).ok, false);
});

test("inlines script, style, and referenced assets in single-file HTML", async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), "patterns-offline-test-"));

  try {
    await mkdir(path.join(outDir, "assets"));
    await writeFile(
      path.join(outDir, "assets", "app.js"),
      'console.log("/assets/logo.svg");',
    );
    await writeFile(
      path.join(outDir, "assets", "app.css"),
      '.hero { background-image: url("/assets/logo.svg"); }',
    );
    await writeFile(path.join(outDir, "assets", "logo.svg"), "<svg></svg>");

    const html = await getSingleFileHtml({
      assets: [
        { bytes: 27, kind: "script", url: "/assets/app.js" },
        { bytes: 50, kind: "style", url: "/assets/app.css" },
        { bytes: 11, kind: "image", url: "/assets/logo.svg" },
      ],
      indexHtml: [
        "<html>",
        "  <head>",
        '    <link rel="stylesheet" href="/assets/app.css">',
        "  </head>",
        "  <body>",
        '    <div id="root"></div>',
        '    <script type="module" src="/assets/app.js"></script>',
        "  </body>",
        "</html>",
      ].join("\n"),
      outDir,
    });

    assert.match(html, /<style>[\s\S]*data:image\/svg\+xml;base64,/);
    assert.match(html, /<script type="module">[\s\S]*data:image\/svg\+xml;base64,/);
    assert.doesNotMatch(html, /href="\/assets\/app\.css"/);
    assert.doesNotMatch(html, /src="\/assets\/app\.js"/);
    assert.doesNotMatch(html, /\/assets\/logo\.svg/);
  } finally {
    await rm(outDir, { force: true, recursive: true });
  }
});
