import { spawn } from "node:child_process";
import {
  mkdtemp,
  readdir,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { devNull, tmpdir } from "node:os";
import path from "node:path";

const workerAssetLimitBytes = 25 * 1024 * 1024;
const targetVideoBytes = 24 * 1024 * 1024;
const audioBitrate = 128_000;
const buildDirectory = path.resolve("dist");
const ignoredOversizedAssets = new Set(["motion-deck.html", "offline.html"]);

const assets = await collectFiles(buildDirectory);
const oversizedAssets = [];

for (const assetPath of assets) {
  const assetStats = await stat(assetPath);

  if (assetStats.size <= workerAssetLimitBytes) {
    continue;
  }

  const relativePath = path.relative(buildDirectory, assetPath);

  if (ignoredOversizedAssets.has(relativePath)) {
    console.log(`Skipping ignored deployment asset ${relativePath}.`);
    continue;
  }

  if (path.extname(assetPath).toLowerCase() !== ".mp4") {
    throw new Error(
      `${relativePath} is ${(assetStats.size / 1024 / 1024).toFixed(1)} MiB; `
      + "only oversized MP4 deployment assets can be optimized automatically.",
    );
  }

  await optimizeMp4(assetPath);
  const optimizedStats = await stat(assetPath);

  if (optimizedStats.size > workerAssetLimitBytes) {
    throw new Error(
      `${relativePath} is still ${(optimizedStats.size / 1024 / 1024).toFixed(1)} MiB `
      + "after optimization.",
    );
  }

  oversizedAssets.push({
    relativePath,
    size: optimizedStats.size,
  });
}

for (const { relativePath, size } of oversizedAssets) {
  console.log(`Prepared ${relativePath} at ${(size / 1024 / 1024).toFixed(1)} MiB.`);
}

console.log("Worker assets satisfy Cloudflare's 25 MiB per-file limit.");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function optimizeMp4(inputPath) {
  const metadata = JSON.parse(await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    inputPath,
  ]));
  const duration = Number(metadata.format?.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not determine the duration of ${inputPath}.`);
  }

  const targetTotalBitrate = Math.floor(targetVideoBytes * 8 / duration * 0.96);
  const targetVideoBitrate = Math.max(250_000, targetTotalBitrate - audioBitrate);
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "laracon-worker-video-"));
  const passLogPath = path.join(tempDirectory, "ffmpeg-pass");
  const outputPath = path.join(tempDirectory, path.basename(inputPath));
  const videoBitrate = `${targetVideoBitrate}`;

  try {
    await run("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-map",
      "0:v:0",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-b:v",
      videoBitrate,
      "-pass",
      "1",
      "-passlogfile",
      passLogPath,
      "-an",
      "-f",
      "mp4",
      devNull,
    ]);
    await run("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-map",
      "0:s?",
      "-map_metadata",
      "0",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-b:v",
      videoBitrate,
      "-pass",
      "2",
      "-passlogfile",
      passLogPath,
      "-c:a",
      "aac",
      "-b:a",
      `${audioBitrate}`,
      "-c:s",
      "copy",
      "-movflags",
      "+faststart",
      outputPath,
    ]);
    await rename(outputPath, inputPath);
  } finally {
    await rm(tempDirectory, { force: true, recursive: true });
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(`${command} exited with code ${code}.\n${stderr}`));
    });
  });
}
