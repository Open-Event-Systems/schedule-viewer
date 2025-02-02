import { action, computed, makeObservable, observable } from "mobx"
import { sortByDate } from "./time.js"
import { Event } from "./types.js"

export class EventStore {
  private byId: Map<string, Event>

  constructor(events?: Iterable<Event>) {
    this.byId = observable.map(undefined, {
      deep: false,
    })

    if (events) {
      for (const e of events) {
        this.add(e)
      }
    }

    makeObservable<this, "_sorted">(this, {
      _sorted: computed,
      add: action,
      remove: action,
    })
  }

  add(event: Event) {
    this.byId.set(event.id, event)
  }

  remove(e: string | Event) {
    if (typeof e == "string") {
      this.byId.delete(e)
    } else {
      this.byId.delete(e.id)
    }
  }

  get(id: string): Event | undefined {
    return this.byId.get(id)
  }

  private get _sorted(): Event[] {
    const arr = Array.from(this.byId.values())
    sortByDate(arr)
    return arr
  }

  [Symbol.iterator](): Iterator<Event> {
    return this._sorted[Symbol.iterator]()
  }

  *getByLocation(location: string): Iterator<Event> {
    for (const e of this) {
      if (e.location == location) {
        yield e
      }
    }
  }
}
