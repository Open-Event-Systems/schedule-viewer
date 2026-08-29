import type { TagFilterTagData, ViewSelectProps } from "./components/index.js"

export const viewSelectOptions = [
  {
    label: "Daily Agenda",
    value: "daily-agenda",
  },
  {
    label: "Full Agenda",
    value: "full-agenda",
  },
  {
    label: "Catalog",
    value: "catalog",
  },
  {
    label: "Tags",
    value: "tags",
  },
] as const satisfies ViewSelectProps["data"]

export const tagData = [
  {
    value: "main-event",
    label: "Main Event",
    before: "⭐",
    color: "#b15000",
    textColor: "#fff",
  },
  {
    value: "art",
    label: "Art",
    before: "🎨",
    color: "#005f02",
    textColor: "#fff",
  },
  {
    value: "photography",
    label: "Photography",
    before: "📷",
    color: "#380059",
    textColor: "#fff",
  },
  {
    value: "mature",
    label: "Mature",
    indicator: "18+",
    indicatorColor: "#ff5da9",
  },
  {
    value: "loud-sounds",
    label: "Loud Sounds",
    after: "📢"
  }
] as const satisfies readonly TagFilterTagData[]