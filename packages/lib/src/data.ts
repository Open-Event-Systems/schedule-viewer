/**
 * Schedule data tools.
 * @module
 */

import {
  type ScheduleItem,
  type ScheduleItemBaseProps,
  type ScheduleItemOccurrence,
  type ScheduleItemSeries,
  type ScheduleItemType,
  type ScheduleItemTypeMap,
} from "./types.js"

/**
 * Indexes {@link ScheduleItemSeries} objects.
 */
export type ItemIndex<T extends ScheduleItemBaseProps = ScheduleItem> =
  Readonly<{
    [Symbol.iterator]: () => Iterator<ScheduleItemSeries<T>>
    entries: readonly ScheduleItemSeries<T>[]
    count: number
    getById: (id: string) => ScheduleItemSeries<T> | undefined
    getByName: (name: string) => ScheduleItemSeries<T> | undefined
    get: (
      value: string | { readonly id?: string; readonly name?: string },
    ) => ScheduleItemSeries<T> | undefined
  }>

/**
 * Indexes {@link ScheduleItemSeries} objects by type.
 */
export type ScheduleData = ItemIndex &
  Readonly<{
    getType: <K extends ScheduleItemType>(
      type: K,
    ) => ItemIndex<ScheduleItemTypeMap[K]>
  }>

class ItemIndexImpl<T extends ScheduleItem = ScheduleItem> {
  public entries: readonly ScheduleItemSeries<T>[]
  public count: number
  private byId = new Map<string, ScheduleItemSeries<T>>()
  private byName = new Map<string, ScheduleItemSeries<T>>()

  constructor(items?: Iterable<ScheduleItemSeries<T>> | null) {
    this.entries = [...(items ?? [])]
    this.count = this.entries.length

    for (const e of this.entries) {
      this.byId.set(e.item.id, e)

      if (e.item.name) {
        this.byName.set(e.item.name, e)
      }

      for (const o of e.item.alternateNames) {
        this.byName.set(o, e)
      }
    }
  }

  [Symbol.iterator] = () => this.entries[Symbol.iterator]()

  getById = (id: string) => this.byId.get(id)
  getByName = (name: string) => this.byName.get(name)

  get = (value: string | { readonly id?: string; readonly name?: string }) => {
    if (typeof value == "string") {
      const byId = this.byId.get(value)
      if (byId) {
        return byId
      }

      return this.byName.get(value)
    } else {
      if (value.id) {
        const byId = this.byId.get(value.id)
        if (byId) {
          return byId
        }
      }

      if (value.name) {
        const byName = this.byName.get(value.name)
        if (byName) {
          return byName
        }
      }
    }
  }
}

class ScheduleDataImpl extends ItemIndexImpl<ScheduleItem> {
  private byType = new Map<ScheduleItemType, ItemIndex>()
  constructor(objs?: Iterable<ScheduleItemSeries<ScheduleItem>> | null) {
    const typeArrs: { [K in ScheduleItemType]?: ScheduleItemSeries[] } = {}

    const getObjs = function* () {
      for (const obj of objs ?? []) {
        let typeArr = typeArrs[obj.item.type]
        if (!typeArr) {
          typeArr = []
          typeArrs[obj.item.type] = typeArr
        }

        typeArr.push(obj)

        yield obj
      }
    }

    super(getObjs())

    for (const [t, arr] of Object.entries(typeArrs)) {
      this.byType.set(t as ScheduleItemType, indexItems(arr))
    }
  }

  getType = <K extends ScheduleItemType>(
    type: K,
  ): ItemIndex<ScheduleItemTypeMap[K]> => {
    const byType = this.byType.get(type)
    if (byType) {
      return byType as ItemIndex<ScheduleItemTypeMap[K]>
    } else {
      return emptyIndex
    }
  }
}

const emptyIndex = new ItemIndexImpl<never>([])

/**
 * Test whether an object is a {@link ScheduleData} object.
 */
export const isScheduleData = (obj: unknown): obj is ScheduleData =>
  obj instanceof ScheduleDataImpl

/**
 * Index an iterable of {@link ScheduleItemSeries} objects by type.
 */
export const indexScheduleData = (
  objs?: Iterable<ScheduleItemSeries> | null,
): ScheduleData => {
  if (objs instanceof ScheduleDataImpl) {
    return objs
  }
  return new ScheduleDataImpl(objs)
}

/**
 * Index an iterable of {@link ScheduleItemSeries} objects.
 */
export const indexItems = <T extends ScheduleItem>(
  objs?: Iterable<ScheduleItemSeries<T>> | null,
): ItemIndex<T> => {
  if (objs instanceof ItemIndexImpl) {
    return objs
  }
  return new ItemIndexImpl(objs)
}
