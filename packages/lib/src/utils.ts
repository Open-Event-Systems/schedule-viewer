import slugify from "slugify"
import { makeSelections } from "./selections.js"

export const makeId = (s: string): string => {
  // @ts-ignore
  return slugify(s.toLowerCase())
}

export const makeBookmarkFilter = (
  eventIds: Iterable<string>,
): ((e: { readonly id: string }) => boolean) => {
  const selections = makeSelections(eventIds)
  return (e) => {
    return selections.has(e.id)
  }
}
