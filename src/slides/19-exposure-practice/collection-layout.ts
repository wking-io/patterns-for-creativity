type MasonryItem = {
  height: number;
  width: number;
};

const masonryItemGapWeight = 0.0645;

export function getMasonryColumnWeight(items: readonly MasonryItem[]) {
  return items.reduce((weight, item) => (
    weight + item.height / item.width + masonryItemGapWeight
  ), 0);
}

export function partitionBalancedMasonryColumns<T extends MasonryItem>(
  items: readonly T[],
  requestedColumnCount: number,
): T[][] {
  if (items.length === 0) {
    return [];
  }

  const columnCount = Math.max(
    1,
    Math.min(items.length, Math.floor(requestedColumnCount)),
  );
  const prefixWeights = [0];

  for (const item of items) {
    prefixWeights.push(
      prefixWeights.at(-1)! + getMasonryColumnWeight([item]),
    );
  }

  const costs = Array.from(
    { length: columnCount + 1 },
    () => Array(items.length + 1).fill(Number.POSITIVE_INFINITY),
  );
  const cuts = Array.from(
    { length: columnCount + 1 },
    () => Array(items.length + 1).fill(-1),
  );
  costs[0][0] = 0;

  for (let columns = 1; columns <= columnCount; columns += 1) {
    for (let itemCount = columns; itemCount <= items.length; itemCount += 1) {
      for (
        let previousItemCount = columns - 1;
        previousItemCount < itemCount;
        previousItemCount += 1
      ) {
        const columnWeight =
          prefixWeights[itemCount] - prefixWeights[previousItemCount];
        const cost = Math.max(
          costs[columns - 1][previousItemCount],
          columnWeight,
        );

        if (cost < costs[columns][itemCount]) {
          costs[columns][itemCount] = cost;
          cuts[columns][itemCount] = previousItemCount;
        }
      }
    }
  }

  const result: T[][] = [];
  let itemCount = items.length;

  for (let columns = columnCount; columns > 0; columns -= 1) {
    const previousItemCount = cuts[columns][itemCount];
    result.unshift(items.slice(previousItemCount, itemCount));
    itemCount = previousItemCount;
  }

  return result;
}

export function getMasonryColumnScrollDurations(
  columns: readonly (readonly MasonryItem[])[],
  longestColumnDurationMs: number,
) {
  const columnWeights = columns.map(getMasonryColumnWeight);
  const longestColumnWeight = Math.max(...columnWeights);

  return columnWeights.map((columnWeight) => (
    longestColumnDurationMs * columnWeight / longestColumnWeight
  ));
}
