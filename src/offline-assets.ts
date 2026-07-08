import {
  validateOfflineAssetManifest,
  type OfflineAsset,
  type OfflineAssetManifest,
} from "./offline-package";

export type OfflineFeatureName =
  | "cacheStorage"
  | "fontReady"
  | "imageDecode"
  | "manifest"
  | "serviceWorker";

export type OfflineFeatureState = {
  message?: string;
  status: "error" | "success" | "unavailable";
};

export type OfflineAssetError = {
  feature: OfflineFeatureName;
  message: string;
  url?: string;
};

export type OfflineAssetState = {
  cacheAssetCount?: number;
  decodedImageCount?: number;
  errors: OfflineAssetError[];
  features: Partial<Record<OfflineFeatureName, OfflineFeatureState>>;
  manifestAssetCount?: number;
  serviceWorker?: "registered" | "ready" | "timeout" | "unsupported";
  status: "idle" | "manifest" | "caching" | "decoding" | "ready" | "unavailable" | "error";
};

export type OfflineRuntimeCache = {
  match: (request: string) => Promise<unknown>;
  put: (request: string, response: Response) => Promise<void>;
};

export type OfflineRuntimeAdapter = {
  clearTimeout: (timeoutId: number) => void;
  decodeImage?: (src: string) => Promise<void>;
  fetch: typeof fetch;
  locationProtocol: string;
  manifestUrl: string;
  openCache?: (cacheId: string) => Promise<OfflineRuntimeCache>;
  registerServiceWorker?: (url: string) => Promise<void>;
  serviceWorkerReady?: Promise<unknown>;
  serviceWorkerUrl: string;
  setState: (state: OfflineAssetState) => void;
  setTimeout: (callback: () => void, timeoutMs: number) => number;
  waitForFonts?: () => Promise<void>;
};

const baseUrl = import.meta.env.BASE_URL;
const manifestUrl = `${baseUrl}offline-asset-manifest.json`;
const serviceWorkerUrl = `${baseUrl}offline-sw.js`;

export async function prepareOfflineAssets(adapter = createBrowserOfflineAdapter()) {
  const tracker = createOfflineStateTracker(adapter);

  tracker.update({ status: "idle" });
  const manifest = await loadOfflineManifest(adapter, tracker);

  if (!manifest) {
    return;
  }

  tracker.update({ manifestAssetCount: manifest.assets.length, status: "manifest" });
  await Promise.all([
    registerOfflineServiceWorker(adapter, tracker),
    cacheAssets(manifest, adapter, tracker),
  ]);

  tracker.update({ status: "decoding" });
  await Promise.all([
    decodeImages(manifest.assets.filter((asset) => asset.kind === "image"), adapter, tracker),
    waitForFonts(adapter, tracker),
  ]);
  tracker.update({ status: "ready" });
}

export function createBrowserOfflineAdapter(): OfflineRuntimeAdapter {
  return {
    clearTimeout: (timeoutId) => window.clearTimeout(timeoutId),
    decodeImage: "Image" in window ? decodeBrowserImage : undefined,
    fetch: (input, init) => fetch(input, init),
    locationProtocol: window.location.protocol,
    manifestUrl,
    openCache: "caches" in window ? (cacheId) => caches.open(cacheId) : undefined,
    registerServiceWorker: "serviceWorker" in navigator
      ? async (url) => {
          await navigator.serviceWorker.register(url);
        }
      : undefined,
    serviceWorkerReady: "serviceWorker" in navigator ? navigator.serviceWorker.ready : undefined,
    serviceWorkerUrl,
    setState: setOfflineAssetState,
    setTimeout: (callback, timeoutMs) => window.setTimeout(callback, timeoutMs),
    waitForFonts: "fonts" in document ? async () => {
      await document.fonts.ready;
    } : undefined,
  };
}

async function loadOfflineManifest(adapter: OfflineRuntimeAdapter, tracker: OfflineStateTracker) {
  try {
    const response = await adapter.fetch(adapter.manifestUrl, { cache: "force-cache" });

    if (!response.ok) {
      tracker.feature("manifest", {
        message: `Manifest request returned ${response.status}.`,
        status: "unavailable",
      });
      tracker.update({ status: "unavailable" });
      return undefined;
    }

    const validation = validateOfflineAssetManifest(await response.json());

    if (!validation.ok) {
      tracker.feature("manifest", {
        message: validation.errors.join(" "),
        status: "error",
      });
      tracker.addError({
        feature: "manifest",
        message: validation.errors.join(" "),
        url: adapter.manifestUrl,
      });
      tracker.update({ status: "error" });
      return undefined;
    }

    tracker.feature("manifest", { status: "success" });
    return validation.manifest;
  } catch (error) {
    const message = getErrorMessage(error);

    tracker.feature("manifest", { message, status: "error" });
    tracker.addError({ feature: "manifest", message, url: adapter.manifestUrl });
    tracker.update({ status: "error" });
    return undefined;
  }
}

async function registerOfflineServiceWorker(adapter: OfflineRuntimeAdapter, tracker: OfflineStateTracker) {
  if (!adapter.registerServiceWorker || adapter.locationProtocol === "file:") {
    tracker.feature("serviceWorker", {
      message: "Service workers are unavailable in this browser context.",
      status: "unavailable",
    });
    tracker.update({ serviceWorker: "unsupported" });
    return;
  }

  try {
    await adapter.registerServiceWorker(adapter.serviceWorkerUrl);
    tracker.update({ serviceWorker: "registered" });

    if (!adapter.serviceWorkerReady) {
      tracker.feature("serviceWorker", {
        message: "Service worker readiness is unavailable.",
        status: "unavailable",
      });
      return;
    }

    const ready = await withTimeout(adapter, adapter.serviceWorkerReady.then(() => true), 2500);

    if (ready) {
      tracker.feature("serviceWorker", { status: "success" });
      tracker.update({ serviceWorker: "ready" });
      return;
    }

    tracker.feature("serviceWorker", {
      message: "Service worker readiness timed out.",
      status: "unavailable",
    });
    tracker.update({ serviceWorker: "timeout" });
  } catch (error) {
    const message = getErrorMessage(error);

    tracker.feature("serviceWorker", { message, status: "error" });
    tracker.addError({ feature: "serviceWorker", message, url: adapter.serviceWorkerUrl });
  }
}

async function cacheAssets(
  manifest: OfflineAssetManifest,
  adapter: OfflineRuntimeAdapter,
  tracker: OfflineStateTracker,
) {
  if (!adapter.openCache) {
    tracker.feature("cacheStorage", {
      message: "Cache storage is unavailable in this browser context.",
      status: "unavailable",
    });
    return;
  }

  tracker.update({ status: "caching" });

  try {
    const cache = await adapter.openCache(`patterns-runtime-${manifest.buildTime}`);
    let cachedCount = 0;
    let hasError = false;

    await runWithConcurrency(manifest.assets, 6, async (asset) => {
      try {
        const cached = await cache.match(asset.url);

        if (cached) {
          cachedCount += 1;
          return;
        }

        const response = await adapter.fetch(asset.url, { cache: "force-cache" });

        if (!response.ok) {
          hasError = true;
          tracker.addError({
            feature: "cacheStorage",
            message: `Asset request returned ${response.status}.`,
            url: asset.url,
          });
          return;
        }

        await cache.put(asset.url, response);
        cachedCount += 1;
      } catch (error) {
        hasError = true;
        tracker.addError({
          feature: "cacheStorage",
          message: getErrorMessage(error),
          url: asset.url,
        });
      }
    });

    tracker.feature("cacheStorage", hasError
      ? { message: "One or more assets could not be cached.", status: "error" }
      : { status: "success" });
    tracker.update({ cacheAssetCount: cachedCount });
  } catch (error) {
    const message = getErrorMessage(error);

    tracker.feature("cacheStorage", { message, status: "error" });
    tracker.addError({ feature: "cacheStorage", message });
  }
}

async function decodeImages(
  images: OfflineAsset[],
  adapter: OfflineRuntimeAdapter,
  tracker: OfflineStateTracker,
) {
  if (!adapter.decodeImage) {
    tracker.feature("imageDecode", {
      message: "Image decoding is unavailable in this browser context.",
      status: "unavailable",
    });
    return;
  }

  let decodedCount = 0;
  let hasError = false;

  await runWithConcurrency(images, 4, async (image) => {
    try {
      await adapter.decodeImage?.(image.url);
      decodedCount += 1;
    } catch (error) {
      hasError = true;
      tracker.addError({
        feature: "imageDecode",
        message: getErrorMessage(error),
        url: image.url,
      });
    }
  });

  tracker.feature("imageDecode", hasError
    ? { message: "One or more images could not be decoded.", status: "error" }
    : { status: "success" });
  tracker.update({ decodedImageCount: decodedCount });
}

async function waitForFonts(adapter: OfflineRuntimeAdapter, tracker: OfflineStateTracker) {
  if (!adapter.waitForFonts) {
    tracker.feature("fontReady", {
      message: "Font readiness is unavailable in this browser context.",
      status: "unavailable",
    });
    return;
  }

  try {
    await adapter.waitForFonts();
    tracker.feature("fontReady", { status: "success" });
  } catch (error) {
    const message = getErrorMessage(error);

    tracker.feature("fontReady", { message, status: "error" });
    tracker.addError({ feature: "fontReady", message });
  }
}

function decodeBrowserImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    let isSettled = false;

    const settle = (callback: () => void) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      callback();
    };

    const finish = () => {
      if (typeof image.decode === "function") {
        void image.decode().then(
          () => settle(resolve),
          (error: unknown) => settle(() => reject(error)),
        );
        return;
      }

      settle(resolve);
    };

    image.decoding = "sync";
    image.onload = finish;
    image.onerror = () => settle(() => reject(new Error(`Unable to decode image ${src}.`)));
    image.src = src;

    if (image.complete) {
      finish();
    }
  });
}

function createOfflineStateTracker(adapter: OfflineRuntimeAdapter) {
  let state: OfflineAssetState = {
    errors: [],
    features: {},
    status: "idle",
  };

  const update = (nextState: Partial<OfflineAssetState>) => {
    state = {
      ...state,
      ...nextState,
      errors: nextState.errors ?? state.errors,
      features: {
        ...state.features,
        ...nextState.features,
      },
    };
    adapter.setState(state);
  };

  return {
    addError(error: OfflineAssetError) {
      update({ errors: [...state.errors, error] });
    },
    feature(name: OfflineFeatureName, featureState: OfflineFeatureState) {
      update({ features: { [name]: featureState } });
    },
    update,
  };
}

type OfflineStateTracker = ReturnType<typeof createOfflineStateTracker>;

function setOfflineAssetState(nextState: OfflineAssetState) {
  window.__offlineAssetState = nextState;
}

declare global {
  interface Window {
    __offlineAssetState?: OfflineAssetState;
  }
}

function withTimeout<T>(adapter: OfflineRuntimeAdapter, promise: Promise<T>, timeoutMs: number) {
  return new Promise<T | undefined>((resolve, reject) => {
    const timeout = adapter.setTimeout(() => resolve(undefined), timeoutMs);

    promise.then(
      (value) => {
        adapter.clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        adapter.clearTimeout(timeout);
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
