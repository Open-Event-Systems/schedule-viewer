import { makeSelections } from "./selections.js"

export const makeBookmarkFilter = (
  eventIds: Iterable<string>,
): ((e: { readonly id: string }) => boolean) => {
  const selections = makeSelections(eventIds)
  return (e) => {
    return selections.has(e.id)
  }
}
