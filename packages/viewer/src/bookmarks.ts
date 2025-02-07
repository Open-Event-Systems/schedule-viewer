import { Event } from "@open-event-systems/schedule-lib"
import { action, makeAutoObservable } from "mobx"

export class BookmarkStore {
  private eventIds = new Set<string>()

  constructor() {
    makeAutoObservable(this, {
      // add: action
    })
  }

  get bookmarkedEvents(): Set<string> {
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

  makeFilter(): (event: Event) => boolean {
    return (event) => this.eventIds.has(event.id)
  }
}
