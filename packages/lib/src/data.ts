/**
 * Schedule data tools.
 * @module
 */

import {
  type ScheduleData,
  type ScheduleItem,
  type ScheduleItemIndex,
  type ScheduleItemOccurrence,
  type ScheduleItemSeries,
  type ScheduleItemType,
  type ScheduleItemTypeMap,
} from "./types.js"

/**
 * Index schedule items.
 */
export const indexScheduleItems = <T extends ScheduleItem = ScheduleItem>(
  objs?: Iterable<ScheduleItemSeries<T>> | null,
): ScheduleItemIndex<T> => {
  const byId = new Map<string, ScheduleItemSeries<T>>()
  const byName = new Map<string, ScheduleItemSeries<T>>()
  const byAltName = new Map<string, ScheduleItemSeries<T>>()

  for (const obj of objs ?? []) {
    byId.set(obj.item.id, obj)

    if (obj.item.name) {
      byName.set(obj.item.name, obj)
    }

    for (const altName of obj.item.alternateNames) {
      if (altName) {
        byAltName.set(altName, obj)
      }
    }
  }

  return {
    [Symbol.iterator]: () => byId.values(),
    size: byId.size,
    getById: (id) => byId.get(id),
    getByName: (name) => {
      const nameRes = byName.get(name)
      if (nameRes) {
        return nameRes
      }

      return byAltName.get(name)
    },
  }
}

class IndexImpl {
  private index: ScheduleItemIndex
  private byType: Map<ScheduleItemType, ScheduleItemIndex> = new Map()
  public size: number

  constructor(objs?: Iterable<ScheduleItemSeries> | null) {
    const byType = {} as {
      [K in ScheduleItemType]?: ScheduleItemSeries[]
    }
    const allItems: ScheduleItemSeries[] = []

    for (const obj of objs ?? []) {
      let byTypeArr = byType[obj.item.type]
      if (!byTypeArr) {
        byTypeArr = []
        byType[obj.item.type] = byTypeArr
      }

      byTypeArr.push(obj)
      allItems.push(obj)
    }

    this.index = indexScheduleItems(allItems)

    for (const [key, byTypeArr] of Object.entries(byType)) {
      this.byType.set(key as ScheduleItemType, indexScheduleItems(byTypeArr))
    }

    this.size = this.index.size
  }

  [Symbol.iterator] = () => this.index[Symbol.iterator]()

  getById = (id: string) => this.index.getById(id)
  getByName = (name: string) => this.index.getByName(name)
  getType = <K extends ScheduleItemType>(
    type: K,
  ): ScheduleItemIndex<ScheduleItemTypeMap[K]> =>
    (this.byType.get(type) as
      | ScheduleItemIndex<ScheduleItemTypeMap[K]>
      | undefined) ?? emptyIndex
}

/**
 * Index schedule items by type.
 */
export const indexScheduleData = (
  objs?: Iterable<ScheduleItemSeries> | null,
): ScheduleData => new IndexImpl(objs)

const emptyIndex = {
  [Symbol.iterator]: () => [][Symbol.iterator](),
  size: 0,
  getById: (): undefined => {},
  getByName: (): undefined => {},
} as const

export const isScheduleData = (obj: unknown): obj is ScheduleData =>
  obj instanceof IndexImpl

/**
 * Transform a {@link ScheduleItemSeries} into an array of {@link ScheduleItemOccurrence}.
 */
export const toOccurrenceArray = <T extends ScheduleItem = ScheduleItem>(
  obj: ScheduleItemSeries<T>,
): ScheduleItemOccurrence<T>[] => {
  const occs: ScheduleItemOccurrence<T>[] = []

  for (const occ of obj.occurrences) {
    occs.push({
      ...occ,
      item: obj.item,
    })
  }

  return occs
}
