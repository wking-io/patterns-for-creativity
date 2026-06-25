import {
  booleanField,
  controlField,
  controlPanelTool,
  defineToolbar,
  rangeField,
  selectField,
  textField,
} from "@riff-refine/belt";
import { iterationsTool } from "@riff-refine/belt/iterations";
import { prototypeIterations } from "@riff-refine/belt/iterations/prototypes";
import { worktreeIterations } from "@riff-refine/belt/iterations/worktrees";
import { portlessResolver } from "@riff-refine/belt/iterations/worktrees/portless";
import { renderPerformanceTool } from "@riff-refine/belt/render-performance";
import { worktreesTool } from "@riff-refine/belt/worktrees";

const worktreeProviderOptions = {
  cwd: new URL(".", import.meta.url).pathname,
  resolver: portlessResolver({
    destinations: [
      {
        id: "app",
        label: "App",
        appName: "patterns-for-creativity",
        primary: true,
      },
    ],
  }),
};

export const controlPanel = controlPanelTool({
  fieldsets: {
    canvas: {
      label: "Canvas",
      fields: {
        active: booleanField({
          default: true,
          label: "Active",
        }),
        prompt: textField({
          default: "Make the next thing vivid and usable.",
          label: "Prompt",
        }),
        mode: selectField({
          default: "draft",
          label: "Mode",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Explore", value: "explore" },
            { label: "Refine", value: "refine" },
          ],
        }),
        intensity: rangeField({
          default: 0.5,
          label: "Intensity",
          max: 1,
          min: 0,
          step: 0.01,
        }),
        surface: controlField.select({
          default: "page",
          label: "Surface",
          options: [
            { label: "Page", value: "page" },
            { label: "Prototype", value: "prototype" },
          ],
        }),
      },
    },
  },
});

export default defineToolbar({
  tools: [
    iterationsTool({
      providers: [prototypeIterations(), worktreeIterations(worktreeProviderOptions)],
    }),
    worktreesTool(worktreeProviderOptions),
    controlPanel,
    renderPerformanceTool({
      historySize: 60,
      updateIntervalMs: 1000,
    }),
  ],
});
