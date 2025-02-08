import { Event } from "@open-event-systems/schedule-lib"
import { makeAutoObservable } from "mobx"

export class BookmarkStore {
  private eventIds: ReadonlySet<string> = new Set()

  constructor() {
    makeAutoObservable(this)
  }

  get events(): ReadonlySet<string> {
    return this.eventIds
  }

  add(eventId: string) {
    const newSet = new Set(this.eventIds)
    newSet.add(eventId)
    this.eventIds = newSet
  }

  remove(eventId: string) {
    const newSet = new Set(this.eventIds)
    newSet.delete(eventId)
    this.eventIds = newSet
  }

  makeFilter(): (event: Required<Pick<Event, "id">>) => boolean {
    return (event) => this.eventIds.has(event.id)
  }
}
