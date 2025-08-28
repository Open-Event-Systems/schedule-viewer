export const setEquals = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean => {
  return a.size == b.size && [...a].every((it) => b.has(it))
}

export const makeBookmarkFilter = (
  eventIds: Iterable<string>,
): ((e: { readonly id: string }) => boolean) => {
  const idSet = new Set(eventIds)
  return (e) => {
    return idSet.has(e.id)
  }
}
