import { HeadContent, useMatches } from "@tanstack/react-router"
import { use, useLayoutEffect, useMemo, type MetaHTMLAttributes } from "react"
import {
  InitialHeadContext,
  isUniqueMetaElement,
  removeDuplicateHeadElements,
} from "./deduped-head.js"

/**
 * Like {@link HeadContent} but removes duplicated tags (eg pre existing title
 * tags).
 */
export const DedupedHeadContent = () => {
  const initialElements = use(InitialHeadContext)
  const matches = useMatches()

  const metaEntries = useMemo(() => {
    const metaEntries: MetaHTMLAttributes<HTMLMetaElement>[] = []

    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]
      match?.meta
        ?.filter((a) => !!a)
        .filter(isUniqueMetaElement)
        .forEach((a) => metaEntries.push(a))
    }

    return metaEntries
  }, [matches])

  useLayoutEffect(() => {
    removeDuplicateHeadElements(initialElements, metaEntries)
  }, [initialElements, metaEntries])

  return <HeadContent />
}
