import type { ScheduleItem } from "@open-event-systems/schedule-lib"

export const getItemPillClassNames = (item: ScheduleItem): string[] => {
  return [
    item.id ? getItemPillIdClassName(item.id) : "",
    ...Array.from("keywords" in item ? (item.keywords ?? []) : [], (t) =>
      getItemPillTagClassName(t),
    ),
  ].filter((v) => !!v)
}

export const getItemPillTagClassName = (tag: string): string =>
  `Pill-item-tag-${tag}`

export const getItemPillIdClassName = (itemId: string): string =>
  `Pill-item-id-${itemId}`
