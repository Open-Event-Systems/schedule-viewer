import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"

export const getItemPillClassNames = (
  item: DetailedScheduleItem,
): readonly string[] => {
  return [
    getItemPillIdClassName(item.id),
    ...Array.from(item.tags ?? [], (t) => getItemPillTagClassName(t)),
  ]
}

export const getItemPillTagClassName = (tag: string): string =>
  `Pill-item-tag-${tag}`

export const getItemPillIdClassName = (itemId: string): string =>
  `Pill-item-id-${itemId}`
