import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage } from "node:http";
import type { PluginOption } from "vite";
import {
  parseSpeakerNotesFile,
  serializeSpeakerNotesFile,
  speakerNotesSaveEndpoint,
} from "./src/motion-deck/speaker-notes.js";

const maximumNotesBytes = 5 * 1024 * 1024;

export function speakerNotesPlugin(): PluginOption {
  return {
    name: "patterns-presentation-speaker-notes",
    apply: "serve",
    configureServer(server) {
      const notesPath = path.resolve(
        server.config.root,
        "src/motion-deck/presentation-notes.json",
      );

      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

        if (pathname !== speakerNotesSaveEndpoint) {
          next();
          return;
        }

        if (request.method !== "POST") {
          response.statusCode = 405;
          response.setHeader("Allow", "POST");
          response.end("Speaker notes can only be saved with POST.");
          return;
        }

        try {
          const source = await readRequestBody(request);
          const document = parseSpeakerNotesFile(source);
          await writeFile(notesPath, serializeSpeakerNotesFile(document), "utf8");
          response.statusCode = 204;
          response.end();
        } catch (error) {
          response.statusCode = 400;
          response.end(error instanceof Error ? error.message : "Speaker notes could not be saved.");
        }
      });
    },
  };
}

async function readRequestBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > maximumNotesBytes) {
      throw new Error("Speaker notes exceed the 5 MB save limit.");
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}
