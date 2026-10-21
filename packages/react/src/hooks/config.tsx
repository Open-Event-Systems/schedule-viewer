import type { ItemCardProps } from "#src/components/item-card/item-card.js"
import type { ItemPillProps } from "#src/components/item-pill/item-pill.js"
import {
  getContactViewProps,
  getLocationViewProps,
  indexScheduleData,
  type ScheduleData,
} from "#src/data.js"
import {
  makeTagViewPropsFunc,
  type TagConfig,
  type TagViewProps,
} from "#src/tags.js"
import type { ContactViewProps, LocationViewProps } from "#src/types.js"
import {
  makeSearchIndex,
  type DocType,
  type Location,
  type Profile,
  type ScheduleItemSeries,
  type ScheduleItemType,
  type ScheduleItemTypeMap,
  type SearchIndex,
  type SeriesOrOccurrence,
} from "@open-event-systems/schedule-lib"
import { createContext, use, type MouseEvent, type ReactNode } from "react"

type ResolveFunc = <K extends ScheduleItemType = ScheduleItemType>(
  data: ScheduleData,
  type: K,
  value: string | { readonly id?: string; readonly name?: string },
) => ScheduleItemSeries<ScheduleItemTypeMap[K]> | undefined

type ItemToDocFunc = (
  data: ScheduleData,
  resolve: ResolveFunc,
  obj: ScheduleItemSeries,
) => DocType | undefined

export type ScheduleConfig = Readonly<{
  tags: readonly TagConfig[]
  getTagViewProps: (...tags: string[]) => TagViewProps
  resolveTag: (tag: string) => TagConfig | undefined
  data: ScheduleData
  searchIndex: SearchIndex
  resolve: ResolveFunc
  getContactViewProps: (profile: Profile) => ContactViewProps
  getLocationViewProps: (loc: Location) => LocationViewProps
  getItemHref?: (obj: SeriesOrOccurrence) => string | null | undefined
  onClickItem?: (e: MouseEvent, obj: SeriesOrOccurrence) => void
  renderItemPill?: (obj: SeriesOrOccurrence, props?: ItemPillProps) => ReactNode
  renderItemCard?: (obj: SeriesOrOccurrence, props?: ItemCardProps) => ReactNode
}>

export const defaultScheduleConfig = {
  tags: [],
  getTagViewProps: () => ({}),
  resolveTag: (tag) => ({ label: tag, value: tag }),
  data: indexScheduleData(),
  searchIndex: makeSearchIndex([]),
  resolve: () => {},
  getContactViewProps: getContactViewProps,
  getLocationViewProps: getLocationViewProps,
} as const satisfies ScheduleConfig

export const makeScheduleConfig = ({
  tags,
  data,
  resolve,
  itemToDoc,
  ...other
}: Omit<Partial<ScheduleConfig>, "tags" | "data" | "searchIndex"> & {
  tags?:
    | Iterable<TagConfig>
    | Readonly<Record<string, Omit<TagConfig, "value">>>
  data?: Iterable<ScheduleItemSeries>
  itemToDoc?: ItemToDocFunc
}): ScheduleConfig => {
  const tagsArr: TagConfig[] = []
  const tagsMap = new Map<string, TagConfig>()

  if (Array.isArray(tags)) {
    for (const t of tags) {
      tagsArr.push(t)
      tagsMap.set(t.value, t)
    }
  } else if (tags) {
    for (const [k, c] of Object.entries(tags)) {
      const cfg = { ...c, value: k }
      tagsArr.push(cfg)
      tagsMap.set(k, cfg)
    }
  }

  const indexedData = indexScheduleData(data)

  const defaultResolve: ResolveFunc = <K extends ScheduleItemType>(
    data: ScheduleData,
    type: K,
    value: string | { readonly id?: string; readonly name?: string },
  ): ScheduleItemSeries<ScheduleItemTypeMap[K]> | undefined => {
    const byType = data.getType(type)
    return byType.get(value)
  }

  const defaultItemToDoc: ItemToDocFunc = (data, resolve, obj) => {
    resolve = resolve ?? defaultResolve

    if (obj.item.type != "event" && obj.item.type != "vendor") {
      return
    }

    const locs = []
    const contacts = []

    for (const occ of obj.occurrences) {
      for (const loc of occ.locations) {
        const locObj = resolve(data, "location", loc)
        locs.push(locObj?.item.name || loc.name)
      }
    }

    if (obj.item.type == "event") {
      for (const c of obj.item.contacts) {
        const pObj = resolve(data, "profile", c)
        contacts.push(pObj?.item.name || c.name)
      }
    }

    return {
      id: obj.item.id,
      name: obj.item.name,
      description: obj.item.description,
      locations: locs.filter((l): l is string => !!l),
      contacts: contacts.filter((c): c is string => !!c),
    }
  }

  const searchIndex = makeSearchIndex(function* () {
    const toDoc = itemToDoc ?? defaultItemToDoc
    const resolveFunc = resolve ?? defaultResolve
    for (const obj of indexedData) {
      const doc = toDoc(indexedData, resolveFunc, obj)
      if (doc) {
        yield doc
      }
    }
  })

  const resolveTag = (tag: string) => tagsMap.get(tag)

  return {
    resolveTag,
    getTagViewProps: makeTagViewPropsFunc(resolveTag),
    getContactViewProps,
    getLocationViewProps,
    ...other,
    tags: tagsArr,
    resolve: resolve ?? defaultResolve,
    data: indexedData,
    searchIndex,
  }
}

const ScheduleConfigContext = createContext<ScheduleConfig>(
  defaultScheduleConfig,
)

export const useScheduleConfig = (): ScheduleConfig =>
  use(ScheduleConfigContext)

export const ScheduleConfigProvider = ScheduleConfigContext.Provider
