export type SlideOrderDropEdge = "before" | "after";

export type SlideOrderRequest = {
  createdAt: string;
  frameIds: string[];
  version: 1;
};

export function reorderFrameIds(
  frameIds: readonly string[],
  draggedId: string,
  targetId: string,
  edge: SlideOrderDropEdge,
): string[] {
  if (draggedId === targetId) {
    return [...frameIds];
  }

  const draggedIndex = frameIds.indexOf(draggedId);
  const targetIndex = frameIds.indexOf(targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return [...frameIds];
  }

  const reordered = frameIds.filter((frameId) => frameId !== draggedId);
  const remainingTargetIndex = reordered.indexOf(targetId);
  const insertionIndex = edge === "after"
    ? remainingTargetIndex + 1
    : remainingTargetIndex;

  reordered.splice(insertionIndex, 0, draggedId);
  return reordered;
}

export function moveFrameId(
  frameIds: readonly string[],
  frameId: string,
  offset: -1 | 1,
): string[] {
  const currentIndex = frameIds.indexOf(frameId);
  const targetIndex = currentIndex + offset;

  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= frameIds.length) {
    return [...frameIds];
  }

  const reordered = [...frameIds];
  [reordered[currentIndex], reordered[targetIndex]] = [
    reordered[targetIndex],
    reordered[currentIndex],
  ];
  return reordered;
}

export function createSlideOrderRequest(
  frameIds: readonly string[],
  createdAt = new Date().toISOString(),
): SlideOrderRequest {
  return {
    createdAt,
    frameIds: [...frameIds],
    version: 1,
  };
}

export function formatSlideOrderRequestForCodex(request: SlideOrderRequest): string {
  return [
    "Update `motionDeckFrames` in `src/motion-deck/frames.tsx` to match the exact frame ID order below.",
    "Preserve every frame object and its properties unchanged; only reorder the frame objects.",
    "Afterward, run the typecheck and tests.",
    "",
    "```json",
    JSON.stringify(request, null, 2),
    "```",
  ].join("\n");
}

export function countMovedFrameIds(
  currentFrameIds: readonly string[],
  initialFrameIds: readonly string[],
): number {
  return currentFrameIds.reduce((movedCount, frameId, index) => (
    movedCount + (initialFrameIds[index] === frameId ? 0 : 1)
  ), 0);
}
