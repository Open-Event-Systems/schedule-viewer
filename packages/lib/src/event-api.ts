import { EventAPI, EventsResponse } from "./types.js"
import wretch from "wretch"

/**
 * Create a new {@link EventAPI}
 */
export const makeEventAPI = (url: string): EventAPI => {
  return {
    async read() {
      return await wretch(url).get().json<EventsResponse>()
    },
  }
}
