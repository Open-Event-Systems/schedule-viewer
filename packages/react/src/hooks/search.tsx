/**
 * Search hooks.
 * @module
 */

import { useScheduleConfig } from "#src/hooks/config.js"
import { createOptionalContext, useRequiredContext } from "#src/utils.js"
import { type SearchIndex } from "@open-event-systems/schedule-lib"
import { useEffect, useRef, useState } from "react"

const SearchIndexContext = createOptionalContext<SearchIndex>()
export const useSearchIndex = (): SearchIndex =>
  useRequiredContext(SearchIndexContext)

export const useSearchResults = (
  query?: string | null,
): ReadonlySet<string> | undefined => {
  const { searchIndex } = useScheduleConfig()
  const [results, setResults] = useState<ReadonlySet<string> | undefined>()

  const searchRef = useRef<string | null | undefined>(query)
  const resultsRef = useRef<string | null | undefined>(null)
  searchRef.current = query

  useEffect(() => {
    if (query) {
      searchIndex(query).then((res) => {
        if (query == searchRef.current) {
          resultsRef.current = query
          setResults(res)
        }
      })
    }
  }, [searchIndex, query])

  return query && resultsRef.current == searchRef.current ? results : undefined
}
