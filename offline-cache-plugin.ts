import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PluginOption } from "vite";

type OfflineAsset = {
  bytes: number;
  kind: "document" | "font" | "image" | "script" | "style" | "other";
  url: string;
};

const assetExtensions = new Set([
  ".avif",
  ".css",
  ".gif",
  ".html",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".png",
  ".svg",
  ".webp",
  ".woff",
  ".woff2",
]);

export function offlineCachePlugin(): PluginOption {
  let outDir = "dist";
  let base = "/";

  return {
    name: "patterns-offline-cache",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      base = normalizeBase(config.base);
    },
    async closeBundle() {
      const files = await listFiles(outDir);
      const assets = await Promise.all(
        files
          .filter((file) => assetExtensions.has(path.extname(file).toLowerCase()))
          .filter((file) => !file.endsWith("offline-asset-manifest.json"))
          .filter((file) => !file.endsWith("offline-sw.js"))
          .map(async (file) => {
            const absolutePath = path.join(outDir, file);
            const fileStat = await stat(absolutePath);
            const url = `${base}${toPosixPath(file)}`;

            return {
              bytes: fileStat.size,
              kind: getAssetKind(file),
              url,
            } satisfies OfflineAsset;
          }),
      );
      const indexHtml = await readFile(path.join(outDir, "index.html"), "utf8");
      const manifest = {
        assets,
        buildTime: new Date().toISOString(),
        totalBytes: assets.reduce((total, asset) => total + asset.bytes, 0),
      };

      await writeFile(
        path.join(outDir, "offline-asset-manifest.json"),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
      await writeFile(
        path.join(outDir, "offline-sw.js"),
        getServiceWorkerSource({
          assets: assets.map((asset) => asset.url),
          base,
          cacheId: getCacheId(indexHtml, manifest.totalBytes),
        }),
      );
      await writeFile(
        path.join(outDir, "offline.html"),
        await getSingleFileHtml({ assets, forceMotionDeck: false, indexHtml, outDir }),
      );
      await writeFile(
        path.join(outDir, "motion-deck.html"),
        await getSingleFileHtml({ assets, forceMotionDeck: true, indexHtml, outDir }),
      );
    },
  };
}

async function listFiles(directory: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
  const files: string[][] = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(prefix, entry.name);

      if (entry.isDirectory()) {
        return listFiles(directory, relativePath);
      }

      return [relativePath];
    }),
  );

  return files.flat();
}

function getAssetKind(file: string): OfflineAsset["kind"] {
  const extension = path.extname(file).toLowerCase();

  if (extension === ".html") return "document";
  if (extension === ".css") return "style";
  if (extension === ".js") return "script";
  if (extension === ".woff" || extension === ".woff2") return "font";
  if ([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"].includes(extension)) return "image";

  return "other";
}

function getCacheId(indexHtml: string, totalBytes: number) {
  let hash = 0;
  const input = `${indexHtml.length}:${totalBytes}:${indexHtml}`;

  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(index) | 0;
  }

  return `patterns-for-creativity-${Math.abs(hash).toString(36)}`;
}

function getServiceWorkerSource({ assets, base, cacheId }: { assets: string[]; base: string; cacheId: string }) {
  const assetList = JSON.stringify(
    Array.from(new Set([
      `${base}index.html`,
      `${base}offline-asset-manifest.json`,
      `${base}offline-sw.js`,
      ...assets,
    ])),
    null,
    2,
  );

  return `const CACHE_ID = ${JSON.stringify(cacheId)};
const BASE = ${JSON.stringify(base)};
const ASSETS = ${assetList};

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_ID);
    await Promise.all(ASSETS.map(async (asset) => {
      try {
        await cache.add(new Request(asset, { cache: "reload" }));
      } catch {
        // Keep installing even if one asset is unavailable during a local preview.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => key === CACHE_ID ? undefined : caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(request);
      const url = new URL(request.url);

      if (response.ok && url.origin === self.location.origin && url.pathname.startsWith(BASE)) {
        const cache = await caches.open(CACHE_ID);
        await cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        const fallback = await caches.match(new Request(BASE + "index.html"));

        if (fallback) {
          return fallback;
        }
      }

      throw error;
    }
  })());
});
`;
}

async function getSingleFileHtml({
  assets,
  forceMotionDeck,
  indexHtml,
  outDir,
}: {
  assets: OfflineAsset[];
  forceMotionDeck: boolean;
  indexHtml: string;
  outDir: string;
}) {
  const scriptAsset = assets.find((asset) => asset.kind === "script");
  const styleAsset = assets.find((asset) => asset.kind === "style");

  if (!scriptAsset || !styleAsset) {
    return indexHtml;
  }

  const scriptPath = path.join(outDir, stripBase(scriptAsset.url));
  const stylePath = path.join(outDir, stripBase(styleAsset.url));
  const replacements = await getAssetDataUrlReplacements({
    assets: assets.filter((asset) => asset.url !== scriptAsset.url && asset.url !== styleAsset.url),
    outDir,
  });
  const script = applyDataUrlReplacements(await readFile(scriptPath, "utf8"), replacements);
  const style = applyDataUrlReplacements(await readFile(stylePath, "utf8"), replacements);
  const forceMotionScript = forceMotionDeck ? "\n    <script>window.__FORCE_MOTION_DECK = true;</script>" : "";

  return indexHtml
    .replace(/<script\b[^>]*\bsrc="[^"]*"\s*><\/script>/, "")
    .replace(/<link\b[^>]*\bhref="[^"]*\.css"[^>]*>/, "")
    .replace(
      "</head>",
      `    <style>${style}</style>${forceMotionScript}\n  </head>`,
    )
    .replace(
      "</body>",
      `    <script type="module">${script}</script>\n  </body>`,
    );
}

async function getAssetDataUrlReplacements({ assets, outDir }: { assets: OfflineAsset[]; outDir: string }) {
  const replacements = await Promise.all(
    assets.map(async (asset) => {
      const absolutePath = path.join(outDir, stripBase(asset.url));
      const bytes = await readFile(absolutePath);

      return {
        dataUrl: `data:${getMimeType(asset.url)};base64,${bytes.toString("base64")}`,
        url: asset.url,
      };
    }),
  );

  return replacements.sort((left, right) => right.url.length - left.url.length);
}

function applyDataUrlReplacements(source: string, replacements: Array<{ dataUrl: string; url: string }>) {
  let result = source;

  for (const replacement of replacements) {
    result = result.split(replacement.url).join(replacement.dataUrl);
  }

  return result;
}

function getMimeType(url: string) {
  const extension = path.extname(url).toLowerCase();

  switch (extension) {
    case ".css":
      return "text/css";
    case ".gif":
      return "image/gif";
    case ".html":
      return "text/html";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

function stripBase(url: string) {
  return url.replace(/^\//, "");
}

function normalizeBase(value: string) {
  if (!value || value === "./") {
    return "/";
  }

  return value.endsWith("/") ? value : `${value}/`;
}

function toPosixPath(value: string) {
  return value.split(path.sep).join("/");
}
