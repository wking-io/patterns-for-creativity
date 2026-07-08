export const offlineAssetKinds = [
  "document",
  "font",
  "image",
  "script",
  "style",
  "other",
] as const;

export type OfflineAssetKind = typeof offlineAssetKinds[number];

export type OfflineAsset = {
  bytes: number;
  kind: OfflineAssetKind;
  url: string;
};

export type OfflineAssetManifest = {
  assets: OfflineAsset[];
  buildTime: string;
  totalBytes: number;
};

export type OfflineManifestValidationResult =
  | { errors: string[]; manifest?: never; ok: false }
  | { errors?: never; manifest: OfflineAssetManifest; ok: true };

const offlineAssetKindSet = new Set<string>(offlineAssetKinds);

export function createOfflineAssetManifest({
  assets,
  buildTime = new Date().toISOString(),
}: {
  assets: OfflineAsset[];
  buildTime?: string;
}): OfflineAssetManifest {
  return {
    assets,
    buildTime,
    totalBytes: assets.reduce((total, asset) => total + asset.bytes, 0),
  };
}

export function validateOfflineAssetManifest(value: unknown): OfflineManifestValidationResult {
  if (!isRecord(value)) {
    return { errors: ["Manifest must be an object."], ok: false };
  }

  const errors: string[] = [];

  if (typeof value.buildTime !== "string" || value.buildTime.length === 0) {
    errors.push("Manifest buildTime must be a non-empty string.");
  }

  if (typeof value.totalBytes !== "number" || !Number.isFinite(value.totalBytes) || value.totalBytes < 0) {
    errors.push("Manifest totalBytes must be a non-negative number.");
  }

  if (!Array.isArray(value.assets)) {
    errors.push("Manifest assets must be an array.");
  }

  const assets = Array.isArray(value.assets) ? value.assets : [];

  assets.forEach((asset, index) => {
    if (!isRecord(asset)) {
      errors.push(`Manifest asset ${index} must be an object.`);
      return;
    }

    if (typeof asset.bytes !== "number" || !Number.isFinite(asset.bytes) || asset.bytes < 0) {
      errors.push(`Manifest asset ${index} bytes must be a non-negative number.`);
    }

    if (typeof asset.url !== "string" || asset.url.length === 0) {
      errors.push(`Manifest asset ${index} url must be a non-empty string.`);
    }

    if (typeof asset.kind !== "string" || !offlineAssetKindSet.has(asset.kind)) {
      errors.push(`Manifest asset ${index} kind must be one of ${offlineAssetKinds.join(", ")}.`);
    }
  });

  if (errors.length === 0) {
    const totalAssetBytes = assets.reduce((total, asset) => total + (asset as OfflineAsset).bytes, 0);

    if (value.totalBytes !== totalAssetBytes) {
      errors.push("Manifest totalBytes must equal the sum of asset bytes.");
    }
  }

  if (errors.length > 0) {
    return { errors, ok: false };
  }

  return { manifest: value as OfflineAssetManifest, ok: true };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
