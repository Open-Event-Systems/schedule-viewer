import { createContext, type MetaHTMLAttributes } from "react"

export const getHeadElements = (): HTMLElement[] => {
  const els = []

  for (const el of document.head.children) {
    if (el.tagName == "TITLE" || el.tagName == "META") {
      els.push(el as HTMLElement)
    }
  }

  return els
}

export const getMatchingMetaElement = (
  attrs: MetaHTMLAttributes<HTMLMetaElement>,
  els: readonly HTMLElement[],
): HTMLElement | undefined => {
  if (attrs.title != null) {
    return els.find((el) => el.tagName == "TITLE")
  }

  if (attrs.name != null) {
    return els.find(
      (el) => el.tagName == "META" && el.getAttribute("name") == attrs.name,
    )
  }

  if (attrs.property != null) {
    return els.find(
      (el) =>
        el.tagName == "META" && el.getAttribute("property") == attrs.property,
    )
  }
}

const uniqueOGPPropNames = [
  "og:title",
  "og:description",
  "og:site_name",
  "og:type",
  "og:url",
]

const uniqueMetaNames = ["description"]

export const isUniqueMetaElement = (
  attrs: MetaHTMLAttributes<HTMLMetaElement>,
): boolean => {
  return (
    attrs.title != null ||
    (!!attrs.property && uniqueOGPPropNames.includes(attrs.property)) ||
    (!!attrs.name && uniqueMetaNames.includes(attrs.name))
  )
}

export const removeDuplicateHeadElements = (
  currentElements: HTMLElement[],
  metaAttrs?: Iterable<MetaHTMLAttributes<HTMLMetaElement>>,
) => {
  const elsArr = [...(currentElements ?? [])]
  for (const attrs of metaAttrs ?? []) {
    const match = getMatchingMetaElement(attrs, elsArr)
    if (match) {
      match.remove()
      const idx = currentElements.indexOf(match)
      if (idx != -1) {
        currentElements.splice(idx, 1)
      }
    }
  }
}

export const InitialHeadContext = createContext<HTMLElement[]>([])
