import { createContext, type JSX, type MetaHTMLAttributes } from "react"

type MetaEntry = Readonly<MetaHTMLAttributes<HTMLMetaElement>>
type MatchOpts = Readonly<{
  meta?: readonly (JSX.IntrinsicElements["meta"] | undefined)[]
}>

const metaMatchEntries = [
  {
    name: "description",
  },
  {
    property: "og:title",
  },
  {
    property: "og:type",
  },
  {
    property: "og:url",
  },
  {
    property: "og:description",
  },
] as const satisfies readonly MetaEntry[]

export const InitialHeadContext = createContext<Element[]>([])

const metaEntryIsTitle = (testEntry: MetaEntry) => !!testEntry.title

const metaEntryMatches = (matchEntry: MetaEntry, testEntry: MetaEntry) => {
  return Object.entries(matchEntry).every(
    ([attr, val]) => !val || testEntry[attr as keyof MetaEntry] == val,
  )
}

const elementIsTitle = (el: Element) => el.tagName == "TITLE"

const elementMatchesMetaEntry = (matchEntry: MetaEntry, el: Element) => {
  return (
    el.tagName == "META" &&
    Object.entries(matchEntry).every(
      ([attr, val]) => !val || el.getAttribute(attr) == val,
    )
  )
}

export const getRouteMatchesMetaEntries = (
  matches: readonly MatchOpts[],
): MetaEntry[] => {
  const res = []
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    if (match?.meta) {
      res.push(
        ...match.meta
          .filter((m) => !!m)
          .filter(
            (m) =>
              metaEntryIsTitle(m) ||
              metaMatchEntries.some((mm) => metaEntryMatches(mm, m)),
          ),
      )
    }
  }
  return res
}

export const getHeaderElements = (): Element[] => {
  return [...document.head.children].filter(
    (el) =>
      elementIsTitle(el) ||
      metaMatchEntries.some((mm) => elementMatchesMetaEntry(mm, el)),
  )
}

export const removeDuplicateHeadElements = (
  initialEls: Element[],
  matches: readonly MetaEntry[],
) => {
  const removed = []
  for (const el of initialEls) {
    if (
      (elementIsTitle(el) && matches.some((mm) => metaEntryIsTitle(mm))) ||
      metaMatchEntries.some(
        (mm) =>
          matches.some((m) => metaEntryMatches(mm, m)) &&
          elementMatchesMetaEntry(mm, el),
      )
    ) {
      el.remove()
      removed.push(el)
    }
  }

  for (const el of removed) {
    const idx = initialEls.indexOf(el)
    initialEls.splice(idx, 1)
  }
}
