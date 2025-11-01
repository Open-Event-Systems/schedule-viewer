import { createContext, type MouseEvent, useContext } from "react"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"
import type { ItemDetailsProps } from "../components/details/item-details.js"

export type GetItemDetailsFunc = (item: ScheduleItem) => Readonly<{
  ItemDetailsProps?: Partial<ItemDetailsProps>
  onClickItem?: (e: MouseEvent) => void
}>

export const ItemDetailsContext = createContext<GetItemDetailsFunc>(() => ({}))
export const useItemDetailsFunc = (): GetItemDetailsFunc =>
  useContext(ItemDetailsContext)
