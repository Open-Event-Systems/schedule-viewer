import { Pill } from "#src/components/newpill/pill.js"
import type { ScheduleViewProps } from "#src/components/newschedule/schedule-view.js"
import { AgendaView } from "#src/components/newschedule/views/agenda.js"
import { CatalogView } from "#src/components/newschedule/views/catalog.js"
import { TagsView } from "#src/components/newschedule/views/tags.js"
import type { DefaultBoxProps } from "#src/components/types.js"
import {
  defaultRenderItemPill,
  type RenderItemPillFunc,
} from "#src/hooks/items.js"
import {
  iterToArr,
  type Bin,
  type SeriesOrOccurrence,
} from "@open-event-systems/schedule-lib"
import {
  Fragment,
  useCallback,
  type AllHTMLAttributes,
  type ReactNode,
} from "react"

export type BinnedViewProps = ScheduleViewProps & {
  type: BinnedViewType
}

export type BinnedViewComponentProps = Omit<
  ScheduleViewProps,
  "renderItemPill"
> & {
  renderBin: (
    props: AllHTMLAttributes<HTMLElement>,
    bin: Bin<SeriesOrOccurrence>,
  ) => ReactNode
}

export const BinnedViewType = {
  agenda: AgendaView,
  catalog: CatalogView,
  tags: TagsView,
} as const

export type BinnedViewType = keyof typeof BinnedViewType

const _BinnedView = (props: BinnedViewProps & { type: BinnedViewType }) => {
  const { type, renderItemPill, ...other } = props

  const View = BinnedViewType[type]

  const renderBin = useCallback(
    (props: AllHTMLAttributes<HTMLElement>, bin: Bin<SeriesOrOccurrence>) => {
      return (
        <BinnedView.Bin {...props} bin={bin} renderItemPill={renderItemPill} />
      )
    },
    [renderItemPill],
  )

  if (!View) {
    return null
  }

  return <View {...other} type={type} renderBin={renderBin} />
}

export const BinnedViewBin = (
  props: DefaultBoxProps<"ul"> & {
    bin: Bin<SeriesOrOccurrence>
    renderItemPill?: RenderItemPillFunc
  },
) => {
  const { bin, renderItemPill, ...other } = props

  const finalRenderItemPill = renderItemPill ?? defaultRenderItemPill

  const els = iterToArr(bin.items).map((item) => (
    <Fragment key={"id" in item && item.id ? item.id : item.item.id}>
      {finalRenderItemPill(item)}
    </Fragment>
  ))

  return <Pill.Box {...other}>{els}</Pill.Box>
}

export const BinnedView = Object.assign(_BinnedView, {
  Bin: BinnedViewBin,
})
