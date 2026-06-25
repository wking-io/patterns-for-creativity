import { prototypeIterationsVite } from "@riff-refine/belt/iterations/prototypes/vite";
import { toolbarVite } from "@riff-refine/belt/vite";
import { defineConfig, type PluginOption } from "vite";
import toolbarConfig from "./toolbar.config";

export default defineConfig({
  plugins: [toolbarVite(toolbarConfig) as PluginOption, prototypeIterationsVite()],
});
