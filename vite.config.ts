import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { offlineCachePlugin } from "./offline-cache-plugin";

export default defineConfig({
  plugins: [tailwindcss(), offlineCachePlugin()],
});
