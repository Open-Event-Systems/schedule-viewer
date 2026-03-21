import { HeadContent, useMatches } from "@tanstack/react-router"
import {
  getRouteMatchesMetaEntries,
  InitialHeadContext,
  removeDuplicateHeadElements,
} from "./deduped-head.js"
import { use, useLayoutEffect, useMemo } from "react"

/**
 * Like {@link HeadContent} but removes duplicated tags (eg pre existing title
 * tags).
 */
export const DedupedHeadContent = () => {
  const initialElements = use(InitialHeadContext)
  const matches = useMatches()

  const matchesMeta = useMemo(() => {
    return getRouteMatchesMetaEntries(matches)
  }, [matches])

  useLayoutEffect(() => {
    removeDuplicateHeadElements(initialElements, matchesMeta)
  }, [initialElements, matchesMeta])

  return <HeadContent />
}
