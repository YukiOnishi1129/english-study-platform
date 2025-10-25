export function moveItem<T extends { id: string; order: number }>(
  list: readonly T[],
  sourceId: string,
  targetIndex: number,
): T[] {
  const fromIndex = list.findIndex((item) => item.id === sourceId);
  if (fromIndex === -1) {
    return [...list];
  }

  const boundedTarget = Math.max(0, Math.min(targetIndex, list.length - 1));
  if (fromIndex === boundedTarget) {
    return [...list];
  }

  const updated = [...list];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(boundedTarget, 0, moved);

  return updated.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}
