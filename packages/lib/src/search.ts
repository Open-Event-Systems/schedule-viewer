/**
 * Text search functions.
 * @module
 */

import { iterToArr } from "#src/utils.js"
import type Fuse from "fuse.js"

export type DocType = Readonly<{
  id: string
  name?: string
  description?: string
  contacts?: Iterable<string>
  locations?: Iterable<string>
}>

export type SearchIndex = {
  (query: string): Promise<ReadonlySet<string>>
}

export const makeSearchIndex = (
  docs?:
    | (() => Iterable<DocType> | null | undefined)
    | Iterable<DocType>
    | null,
  opts?: { threshold?: number },
): SearchIndex => {
  let fusePromise: Promise<Fuse<DocType>> | undefined

  const getFuse = async () => {
    if (!fusePromise) {
      fusePromise = makeFuse(typeof docs == "function" ? docs() : docs, opts)
    }
    return await fusePromise
  }

  const doSearch = async (query: string) => {
    const fuse = await getFuse()
    const res = fuse.search(query)
    return new Set(res.map((r) => r.item.id))
  }

  return doSearch
}

const makeFuse = async (
  docs?: Iterable<DocType> | null,
  opts?: { threshold?: number },
) => {
  const Fuse = (await import("fuse.js/min")).default

  return new Fuse<DocType>(
    iterToArr(docs).map((d) => ({
      ...d,
      contacts: iterToArr(d.contacts),
      locations: iterToArr(d.locations),
    })),
    {
      keys: [
        {
          name: "name",
          weight: 1,
        },
        {
          name: "description",
          weight: 0.5,
        },
        {
          name: "contacts",
          weight: 0.25,
        },
        {
          name: "locations",
          weight: 0.25,
        },
      ],
      useTokenSearch: true,
      threshold: opts?.threshold ?? 0.1,
      tokenMatch: "all",
    },
  )
}
