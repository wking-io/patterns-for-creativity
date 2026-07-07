type OfflineAsset = {
  bytes: number;
  kind: "document" | "font" | "image" | "script" | "style" | "other";
  url: string;
};

type OfflineAssetManifest = {
  assets: OfflineAsset[];
  buildTime: string;
  totalBytes: number;
};

type OfflineAssetState = {
  cacheAssetCount?: number;
  decodedImageCount?: number;
  error?: string;
  manifestAssetCount?: number;
  serviceWorker?: "unsupported" | "registered" | "ready" | "timeout";
  status: "idle" | "manifest" | "caching" | "decoding" | "ready" | "unavailable" | "error";
};

const baseUrl = import.meta.env.BASE_URL;
const manifestUrl = `${baseUrl}offline-asset-manifest.json`;
const serviceWorkerUrl = `${baseUrl}offline-sw.js`;

export async function prepareOfflineAssets() {
  setOfflineAssetState({ status: "idle" });
  const manifest = await loadOfflineManifest();

  if (!manifest) {
    setOfflineAssetState({ status: "unavailable" });
    return;
  }

  setOfflineAssetState({ manifestAssetCount: manifest.assets.length, status: "manifest" });
  await Promise.allSettled([
    registerOfflineServiceWorker(),
    cacheAssets(manifest),
  ]);

  setOfflineAssetState({ status: "decoding" });
  await Promise.allSettled([
    decodeImages(manifest.assets.filter((asset) => asset.kind === "image")),
    waitForFonts(),
  ]);
  setOfflineAssetState({ status: "ready" });
}

async function loadOfflineManifest() {
  try {
    const response = await fetch(manifestUrl, { cache: "force-cache" });

    if (!response.ok) {
      return undefined;
    }

    return await response.json() as OfflineAssetManifest;
  } catch {
    return undefined;
  }
}

async function registerOfflineServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    setOfflineAssetState({ serviceWorker: "unsupported" });
    return;
  }

  await navigator.serviceWorker.register(serviceWorkerUrl);
  setOfflineAssetState({ serviceWorker: "registered" });
  const ready = await withTimeout(navigator.serviceWorker.ready.then(() => true), 2500);
  setOfflineAssetState({ serviceWorker: ready ? "ready" : "timeout" });
}

async function cacheAssets(manifest: OfflineAssetManifest) {
  if (!("caches" in window)) {
    return;
  }

  setOfflineAssetState({ status: "caching" });
  const cache = await caches.open(`patterns-runtime-${manifest.buildTime}`);
  let cachedCount = 0;

  await runWithConcurrency(manifest.assets, 6, async (asset) => {
    const cached = await cache.match(asset.url);

    if (cached) {
      cachedCount += 1;
      return;
    }

    const response = await fetch(asset.url, { cache: "force-cache" });

    if (response.ok) {
      await cache.put(asset.url, response);
      cachedCount += 1;
    }
  });
  setOfflineAssetState({ cacheAssetCount: cachedCount });
}

async function decodeImages(images: OfflineAsset[]) {
  await runWithConcurrency(images, 4, (image) => decodeImage(image.url));
  setOfflineAssetState({ decodedImageCount: images.length });
}

function decodeImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    const finish = () => {
      if (typeof image.decode === "function") {
        void image.decode().catch(() => undefined).then(() => resolve());
        return;
      }

      resolve();
    };

    image.decoding = "sync";
    image.onload = finish;
    image.onerror = () => resolve();
    image.src = src;

    if (image.complete) {
      finish();
    }
  });
}

function setOfflineAssetState(nextState: Partial<OfflineAssetState>) {
  window.__offlineAssetState = {
    ...(window.__offlineAssetState ?? { status: "idle" }),
    ...nextState,
  };
}

declare global {
  interface Window {
    __offlineAssetState?: OfflineAssetState;
  }
}

async function waitForFonts() {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T | undefined>((resolve, reject) => {
    const timeout = window.setTimeout(() => resolve(undefined), timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  callback: (item: T) => Promise<void>,
) {
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;

        if (item) {
          await callback(item);
        }
      }
    }),
  );
}
