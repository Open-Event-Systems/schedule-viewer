import { sortByDate } from "./time.js"
import { Event, EventStore } from "./types.js"

class _EventStore {
  private _events: Event[]
  private byId = new Map<string, Event>()
  private _tags = new Set<string>()

  constructor(events: Iterable<Event>) {
    this._events = Array.from(events)
    sortByDate(this._events)

    this._events.forEach((e) => {
      this.byId.set(e.id, e)
      e.tags?.forEach((t) => {
        this._tags.add(t)
      })
    })
  }

  get(id: string): Event | undefined {
    return this.byId.get(id)
  }

  [Symbol.iterator](): Iterator<Event> {
    return this._events[Symbol.iterator]()
  }

  get events(): readonly Event[] {
    return this._events
  }

  get tags(): ReadonlySet<string> {
    return this._tags
  }

  get first(): Event | undefined {
    return this._events[0]
  }

  get last(): Event | undefined {
    return this._events[-1]
  }
}

export const makeEventStore = (events: Iterable<Event>): EventStore =>
  new _EventStore(events)
