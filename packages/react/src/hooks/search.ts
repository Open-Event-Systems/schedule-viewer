/**
 * Search hooks.
 * @module
 */

import { useScheduleData } from "#src/hooks/items.js"
import {
  iterUniqueIds,
  makeSearchIndex,
  type Contact,
  type OccurrenceLocation,
  type SearchIndex,
} from "@open-event-systems/schedule-lib"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export const useSearchResults = (
  index: SearchIndex,
  query?: string | null,
): ReadonlySet<string> | undefined => {
  const [results, setResults] = useState<ReadonlySet<string> | undefined>()

  const searchRef = useRef<string | null | undefined>(query)
  searchRef.current = query

  useEffect(() => {
    if (query) {
      index(query).then((res) => {
        if (query == searchRef.current) {
          setResults(res)
        }
      })
    }
  }, [index, query])

  return query ? results : undefined
}

export const useSearchIndex = (opts?: { threshold?: number }): SearchIndex => {
  const getDocs = useGetSearchDocs()
  return useMemo(
    () => makeSearchIndex(getDocs, { threshold: opts?.threshold }),
    [getDocs, opts?.threshold],
  )
}

const useGetSearchDocs = () => {
  const scheduleData = useScheduleData()
  return useCallback(() => {
    const docs = []

    const profileIndex = scheduleData.getType("profile")
    const locationIndex = scheduleData.getType("location")

    const resolveContact = function* (c: Contact) {
      const key = c.id || c.name

      if (!key) {
        return
      }

      const p = profileIndex.getById(key)
      if (!p) {
        if (c.name) {
          yield c.name
        }
        return
      }

      if (p.item.name) {
        yield p.item.name
      }

      yield* p.item.alternateNames
    }

    const resolveLocations = function* (l: OccurrenceLocation) {
      const key = l.id || l.name

      if (!key) {
        return
      }

      const pObj = locationIndex.getById(key)
      if (!pObj) {
        if (l.name) {
          yield l.name
        }
        return
      }

      if (pObj.item.name) {
        yield pObj.item.name
      }

      yield* pObj.item.alternateNames
    }

    for (const item of iterUniqueIds(scheduleData)) {
      const { id, name, description } = item.item

      const contacts = []

      if ("contacts" in item.item) {
        for (const c of item.item.contacts) {
          contacts.push(...resolveContact(c))
        }
      }

      const locations = []

      for (const occ of item.occurrences) {
        for (const l of occ.locations) {
          locations.push(...resolveLocations(l))
        }
      }

      if (!id) {
        continue
      }

      docs.push({
        id,
        name,
        description,
        contacts,
        locations,
      })
    }

    return docs
  }, [scheduleData])
}
