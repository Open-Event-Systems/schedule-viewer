import type { ItemCardProps } from "#src/components/item-card/item-card.js"
import type { ItemPillProps } from "#src/components/item-pill/item-pill.js"
import {
  makeTagViewPropsFunc,
  type TagConfig,
  type TagViewProps,
} from "#src/tags.js"
import type { ContactViewProps, LocationViewProps } from "#src/types.js"
import {
  indexScheduleData,
  makeSearchIndex,
  omitUndef,
  type DocType,
  type Location,
  type Profile,
  type ScheduleData,
  type ScheduleItemSeries,
  type ScheduleItemType,
  type ScheduleItemTypeMap,
  type SearchIndex,
  type SeriesOrOccurrence,
} from "@open-event-systems/schedule-lib"
import { createContext, use, type MouseEvent, type ReactNode } from "react"

type ResolveFunc = <K extends ScheduleItemType = ScheduleItemType>(
  type: K,
  value: string | { readonly id?: string; readonly name?: string },
) => ScheduleItemSeries<ScheduleItemTypeMap[K]> | undefined

type SeriesToDocFunc = (series: ScheduleItemSeries) => DocType | undefined

/**
 * Controls how data is used and displayed.
 */
export type ScheduleConfig = Readonly<{
  /**
   * The tags to display.
   */
  tags: readonly TagConfig[]

  /**
   * Function to get a {@link TagConfig} by tag value.
   */
  resolveTag: (tag: string) => TagConfig | undefined

  /**
   * Return props to display a set of tags.
   */
  getTagViewProps: (...tags: string[]) => TagViewProps

  /**
   * The indexed schedule data.
   */
  data: ScheduleData

  /**
   * The search index.
   */
  searchIndex: SearchIndex

  /**
   * A function to find objects of a given type in the schedule data.
   */
  resolve: ResolveFunc

  /**
   * Returns the props for displaying an event contact.
   */
  getContactViewProps: (profile: Profile) => ContactViewProps

  /**
   * Returns the props for displaying a location entry.
   */
  getLocationViewProps: (loc: Location) => LocationViewProps

  /**
   * Get the href for a schedule item.
   */
  getItemHref?: (obj: SeriesOrOccurrence) => string | null | undefined

  /**
   * Handle a click on an item link.
   */
  onClickItem?: (e: MouseEvent, obj: SeriesOrOccurrence) => void

  /**
   * Render an item pill.
   */
  renderItemPill?: (obj: SeriesOrOccurrence, props: ItemPillProps) => ReactNode

  /**
   * Render an item card.
   */
  renderItemCard?: (obj: SeriesOrOccurrence, props: ItemCardProps) => ReactNode
}>

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
  itemToDoc?: SeriesToDocFunc
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

  const searchIndex = makeSearchIndex(function* () {
    const toDoc = itemToDoc ?? ((series) => defaultItemToDoc(config, series))
    for (const series of indexedData) {
      const doc = toDoc(series)
      if (doc) {
        yield doc
      }
    }
  })

  const resolveTag = (tag: string) => tagsMap.get(tag)

  const config: ScheduleConfig = {
    resolveTag,
    getTagViewProps: makeTagViewPropsFunc(resolveTag),
    getContactViewProps,
    getLocationViewProps,
    ...other,
    tags: tagsArr,
    resolve: resolve ?? ((k, v) => defaultResolve(config, k, v)),
    data: indexedData,
    searchIndex,
  } satisfies ScheduleConfig

  return config
}

const defaultResolve = <K extends ScheduleItemType>(
  config: ScheduleConfig,
  type: K,
  value: string | { readonly id?: string; readonly name?: string },
): ScheduleItemSeries<ScheduleItemTypeMap[K]> | undefined => {
  const byType = config.data.getType(type)
  return byType.get(value)
}

const defaultItemToDoc = (
  config: ScheduleConfig,
  series: ScheduleItemSeries,
) => {
  if (series.item.type != "event" && series.item.type != "vendor") {
    return
  }

  const locs = []
  const contacts = []

  for (const occ of series.occurrences) {
    for (const loc of occ.locations) {
      const locObj = config.resolve("location", loc)
      locs.push(locObj?.item.name || loc.name)
    }
  }

  if (series.item.type == "event") {
    for (const c of series.item.contacts) {
      const pObj = config.resolve("profile", c)
      contacts.push(pObj?.item.name || c.name)
    }
  }

  return {
    id: series.item.id,
    name: series.item.name,
    description: series.item.description,
    locations: locs.filter((l): l is string => !!l),
    contacts: contacts.filter((c): c is string => !!c),
  }
}

export const getContactViewProps = (p: Profile): ContactViewProps => {
  return omitUndef({
    name: p.name,
    href: p.urls[0],
  })
}

export const getLocationViewProps = (loc: Location): LocationViewProps => {
  return omitUndef({
    name: loc.name,
    href: loc.urls[0],
  })
}

export const defaultScheduleConfig = {
  tags: [],
  resolveTag: (tag) => ({ label: tag, value: tag }),
  getTagViewProps: () => ({}),
  data: indexScheduleData(),
  searchIndex: makeSearchIndex([]),
  resolve: () => {},
  getContactViewProps: getContactViewProps,
  getLocationViewProps: getLocationViewProps,
} as const satisfies ScheduleConfig

const ScheduleConfigContext = createContext<ScheduleConfig>(
  defaultScheduleConfig,
)

export const useScheduleConfig = (): ScheduleConfig =>
  use(ScheduleConfigContext)

export const ScheduleConfigProvider = ScheduleConfigContext.Provider
