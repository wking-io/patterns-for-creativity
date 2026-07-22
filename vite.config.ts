import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { offlineCachePlugin } from "./offline-cache-plugin";
import { speakerNotesPlugin } from "./speaker-notes-plugin";

export default defineConfig({
  plugins: [tailwindcss(), speakerNotesPlugin(), offlineCachePlugin()],
});
