import { Event } from "./types.js"

export class EventStore {
  private byId = new Map<string, Readonly<Event>>()

  constructor(events?: Iterable<Readonly<Event>>) {
    if (events) {
      for (const e of events) {
        this.add(e)
      }
    }
  }

  add(event: Readonly<Event>) {
    this.byId.set(event.id, event)
  }

  get(id: string): Readonly<Event> | undefined {
    return this.byId.get(id)
  }

  [Symbol.iterator](): Iterator<Readonly<Event>> {
    return this.byId.values()
  }

  *getByLocation(location: string): Iterator<Readonly<Event>> {
    for (const e of this.byId.values()) {
      if (e.location == location) {
        yield e
      }
    }
  }
}
