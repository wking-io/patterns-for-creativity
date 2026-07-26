import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { offlineCachePlugin } from "./offline-cache-plugin";
import { speakerNotesPlugin } from "./speaker-notes-plugin";

const port = Number.parseInt(process.env.PORT ?? "", 10);
const portlessServer =
  Number.isInteger(port) && port > 0 && port <= 65_535
    ? { port, strictPort: true }
    : undefined;

export default defineConfig({
  plugins: [tailwindcss(), speakerNotesPlugin(), offlineCachePlugin()],
  server: portlessServer,
  preview: portlessServer,
});
