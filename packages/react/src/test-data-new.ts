import { makeTagsConfig } from "#src/tags.js"
import type { ViewSelectProps } from "./components/index.js"

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

export const testTagsConfig = makeTagsConfig({
  tags: {
    "main-event": {
      label: "Main Event",
      before: "⭐",
      color: "var(--tol-palette-pine)",
      textColor: "var(--tol-palette-text)",
    },
    art: {
      label: "Art",
      before: "🎨",
      color: "var(--tol-palette-teal)",
      textColor: "var(--tol-palette-text)",
    },
    photography: {
      label: "Photography",
      before: "📷",
      color: "var(--tol-palette-purple)",
      textColor: "var(--tol-palette-text)",
    },
    mature: {
      label: "Mature",
      indicator: "18+",
      indicatorColor: "#ff5da9",
    },
    "loud-sounds": {
      label: "Loud Sounds",
      after: "📢",
    },
  },
})
