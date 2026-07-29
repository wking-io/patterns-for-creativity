import assert from "node:assert/strict";
import {
  getMasonryColumnWeight,
  getMasonryColumnScrollDurations,
  partitionBalancedMasonryColumns,
} from "../src/slides/19-exposure-practice/collection-layout.js";
import { exposureCollectionImages } from "../src/slides/19-exposure-practice/collection.js";

const columns = partitionBalancedMasonryColumns(exposureCollectionImages, 4);

assert.deepEqual(
  columns.map((column) => column.length),
  [19, 16, 16, 20],
  "the balanced columns should preserve the collection's current visual grouping",
);
assert.deepEqual(
  columns.flat(),
  exposureCollectionImages,
  "partitioning should preserve every image exactly once and in source order",
);

const durations = getMasonryColumnScrollDurations(columns, 45_000);
const columnWeights = columns.map(getMasonryColumnWeight);
const pixelsPerMillisecond = columnWeights.map((weight, index) => (
  weight / durations[index]
));

for (const speed of pixelsPerMillisecond.slice(1)) {
  assert.ok(
    Math.abs(speed - pixelsPerMillisecond[0]) < 0.000_001,
    "independent columns should move at the same visual speed",
  );
}

console.log("exposure collection layout tests passed");
