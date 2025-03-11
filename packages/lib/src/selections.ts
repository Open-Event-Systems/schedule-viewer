import { isAfter } from "date-fns"
import { Selections } from "./types.js"

class _Selections {
  private eventIds: ReadonlySet<string>
  constructor(
    eventIds: Iterable<string>,
    public readonly dateUpdated: Date,
  ) {
    this.eventIds = new Set(eventIds)
  }

  has(eventId: string): boolean {
    return this.eventIds.has(eventId)
  }

  [Symbol.iterator](): Iterator<string> {
    return this.eventIds[Symbol.iterator]()
  }

  add(eventId: string): Selections {
    const newSet = new Set(this.eventIds)
    newSet.add(eventId)
    return new _Selections(newSet, new Date())
  }

  delete(eventId: string): Selections {
    const newSet = new Set(this.eventIds)
    newSet.delete(eventId)
    return new _Selections(newSet, new Date())
  }
}

export const makeSelections = (
  eventIds?: Iterable<string>,
  dateUpdated?: Date,
): Selections => {
  return new _Selections(eventIds ?? [], dateUpdated ?? new Date(0))
}

export const chooseNewer = (a: Selections, b: Selections): Selections => {
  if (isAfter(b.dateUpdated, a.dateUpdated)) {
    return b
  } else {
    return a
  }
}
