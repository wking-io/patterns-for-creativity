import { prototypeIterationsVite } from "@riff-refine/belt/iterations/prototypes/vite";
import { toolbarVite } from "@riff-refine/belt/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";
import toolbarConfig from "./toolbar.config";
import { offlineCachePlugin } from "./offline-cache-plugin";

export default defineConfig({
  plugins: [tailwindcss(), toolbarVite(toolbarConfig) as PluginOption, prototypeIterationsVite(), offlineCachePlugin()],
});
