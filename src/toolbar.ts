import { iterationsTool } from "@riff-refine/belt/iterations";
import { renderPerformanceTool } from "@riff-refine/belt/render-performance";
import {
  booleanField,
  controlField,
  controlPanelTool,
  createToolbar,
  rangeField,
  selectField,
  textField,
} from "@riff-refine/belt/react";
import { cloudPresetOptions } from "./cloud-presets";

export const AppToolbar = createToolbar({
  tools: [
    iterationsTool({
      providers: [],
    }),
    controlPanelTool({
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
            cloudPreset: selectField({
              default: "wisps",
              label: "Cloud Preset",
              options: cloudPresetOptions.map(({ label, value }) => ({ label, value })),
            }),
            transitionSmoothness: rangeField({
              default: 0.72,
              label: "Transition Smoothness",
              max: 1,
              min: 0,
              step: 0.01,
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
    }),
    renderPerformanceTool({
      historySize: 60,
      updateIntervalMs: 1000,
    }),
  ],
});
