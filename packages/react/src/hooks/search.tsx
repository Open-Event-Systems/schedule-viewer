/**
 * Search hooks.
 * @module
 */

import { useScheduleConfig } from "#src/config.js"
import { useEffect, useRef, useState } from "react"

export const useSearchResults = (
  query?: string | null,
): ReadonlySet<string> | undefined => {
  const { searchIndex } = useScheduleConfig()
  const [results, setResults] = useState<ReadonlySet<string> | null>(null)

  const searchRef = useRef<string | null>(query || null)
  searchRef.current = query || null

  useEffect(() => {
    if (query) {
      searchIndex(query).then((res) => {
        if (query == searchRef.current) {
          setResults(res)
        }
      })
    } else {
      setResults(null)
    }
  }, [searchIndex, query])

  return results ?? undefined
}
