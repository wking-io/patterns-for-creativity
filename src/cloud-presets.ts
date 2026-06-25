export const cloudPresetOptions = [
  { index: 4, label: "High Wisps", value: "wisps" },
  { index: 11, label: "Parallel High Wisps", value: "parallel-wisps" },
  { index: 14, label: "Full High Wisps", value: "full-high-wisps" },
  { index: 15, label: "Left Drift Wisps", value: "left-drift-wisps" },
  { index: 16, label: "Right Drift Wisps", value: "right-drift-wisps" },
  { index: 17, label: "Crown High Wisps", value: "crown-high-wisps" },
  { index: 18, label: "Low Crossing Wisps", value: "low-crossing-wisps" },
  { index: 19, label: "Open Center Wisps", value: "open-center-wisps" },
  { index: 20, label: "Storm Veil Wisps", value: "storm-veil-wisps" },
] as const;

export type CloudPresetValue = (typeof cloudPresetOptions)[number]["value"];

export function getCloudPresetIndex(value: unknown) {
  return cloudPresetOptions.find((option) => option.value === value)?.index ?? 4;
}
