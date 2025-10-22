import { Pills, PillsProps } from "./pills.js"
import { useProps } from "@mantine/core"
import { format, formatISO } from "date-fns"
import { TZDate } from "@date-fns/tz"
import { ReactNode, useCallback, useMemo } from "react"
import clsx from "clsx"
import { makeTagIndicatorFunc, TagIndicatorEntry } from "../../config/config.js"
import { useItemDetails } from "../details/context.js"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import { ScheduleItem } from "@open-event-systems/schedule-lib"

export type ItemPillsItemType = ScheduleItem &
  Readonly<{
    title?: string
    tags?: ReadonlySet<string>
  }>

export type ItemPillsBin = Readonly<{
  id: string
  title: ReactNode
  items: Iterable<ItemPillsItemType>
}>

export type ItemPillsProps = PillsProps & {
  bins: readonly ItemPillsBin[]
  tagIndicators?: readonly TagIndicatorEntry[]
}

export const ItemPills = (props: ItemPillsProps) => {
  const {
    className,
    bins,
    tagIndicators = [],
    ...other
  } = useProps("ItemPills", {}, props)

  const getIndicator = useMemo(() => {
    const tagFunc = makeTagIndicatorFunc(tagIndicators)
    return (ev: ItemPillsItemType) => tagFunc(ev.tags ?? [])
  }, [tagIndicators])

  const binEls = useMemo(() => {
    const res: ReactNode[] = []
    bins.forEach((b) => {
      res.push(
        <ItemPillsBin
          key={b.id}
          title={b.title}
          items={b.items}
          getIndicator={getIndicator}
        />,
      )
    })
    return res
  }, [bins, getIndicator])

  return <Pills {...other}>{binEls}</Pills>
}

const ItemPillsBin = ({
  title,
  items,
  getIndicator,
}: {
  title: ReactNode
  items: Iterable<ItemPillsItemType>
  getIndicator?: (item: ItemPillsItemType) => string | undefined
}) => {
  const els = Array.from(items, (e) => (
    <ItemPillsPill key={e.id} item={e} getIndicator={getIndicator} />
  ))

  return <Pills.Bin title={title}>{els}</Pills.Bin>
}

const ItemPillsPill = ({
  item,
  getIndicator,
}: {
  item: ItemPillsItemType
  getIndicator?: (item: ItemPillsItemType) => string | undefined
}) => {
  const detailsFunc = useItemDetails()

  const itemProps = useMemo(() => {
    return detailsFunc ? detailsFunc(item) : {}
  }, [item, detailsFunc])

  const indicator = useMemo(() => {
    return getIndicator ? getIndicator(item) : undefined
  }, [item, getIndicator])

  const renderFunc = useCallback(
    (c: ReactNode) => {
      const { onClickItem, ...other } = itemProps
      return (
        <ItemHoverCard item={item} ItemDetailsProps={other}>
          {c}
        </ItemHoverCard>
      )
    },
    [item, itemProps],
  )

  return (
    <Pills.Pill
      children={item.title}
      href={itemProps.url}
      onClick={itemProps.onClickItem}
      renderContent={renderFunc}
      className={clsx(
        `Pill-item-id-${item.id}`,
        item.tags ? [...item.tags].map((t) => `Pill-item-tag-${t}`) : [],
      )}
      indicator={indicator}
    />
  )
}

export const binItemsByTitle = (
  items: Iterable<ItemPillsItemType>,
): readonly ItemPillsBin[] => {
  const sorted = [...items]
  sorted.sort((a, b) => {
    if (a.title && b.title) {
      return a.title.localeCompare(b.title)
    } else if (a.title) {
      return -1
    } else if (b.title) {
      return 1
    } else {
      return 0
    }
  })

  const map = new Map<string, ItemPillsItemType[]>()

  for (const item of sorted) {
    let char
    if (!item.title) {
      char = "Other"
    } else {
      char = item.title.charAt(0).toUpperCase()
      if (!/[A-Z]/.test(char)) {
        char = "Other"
      }
    }

    let bin = map.get(char)
    if (!bin) {
      bin = []
      map.set(char, bin)
    }

    bin.push(item)
  }

  const bins: ItemPillsBin[] = []

  for (const [char, items] of map.entries()) {
    bins.push({
      id: char,
      title: char,
      items: items,
    })
  }

  bins.sort((a, b) => {
    if (a.id == "Other") {
      return 1
    } else if (b.id == "Other") {
      return -1
    } else {
      return a.id.localeCompare(b.id)
    }
  })

  return bins
}

export const binItemsByTime = (
  items: Iterable<ItemPillsItemType>,
  binMinutes: number,
): readonly ItemPillsBin[] => {
  const map = new Map<string, [Date, ItemPillsItemType[]]>()

  for (const item of items) {
    if (item.start) {
      const binStart = binDate(item.start, binMinutes)
      const binKey = formatISO(binStart)
      let bin = map.get(binKey)
      if (!bin) {
        bin = [binStart, []]
        map.set(binKey, bin)
      }

      bin[1].push(item)
    }
  }

  const bins: ItemPillsBin[] = []

  for (const [id, [date, items]] of map.entries()) {
    bins.push({
      id,
      title: format(date, "h:mm aaa"),
      items: items,
    })
  }

  return bins
}

const binDate = (d: Date, binMinutes: number): Date => {
  const tz = d instanceof TZDate ? d.timeZone : undefined
  const roundedMinutes = Math.floor(d.getMinutes() / binMinutes) * binMinutes
  const rounded = tz
    ? new TZDate(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        roundedMinutes,
        tz,
      )
    : new TZDate(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        roundedMinutes,
      )

  return rounded
}
