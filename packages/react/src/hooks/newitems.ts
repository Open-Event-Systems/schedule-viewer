import { iterToArr, type ScheduleItem } from "@open-event-systems/schedule-lib"
import type { ItemViewProps, TagViewProps } from "../types.js"

export type GetTagViewPropsFunc = (
  tags?: Iterable<string> | null,
) => TagViewProps | null | undefined

export type GetItemViewPropsFunc = (item: ScheduleItem) => ItemViewProps

export const makeDefaultGetTagViewPropsFunc =
  (
    getSingleTagViewProps?: (tag: string) => TagViewProps | null | undefined,
  ): GetTagViewPropsFunc =>
    (tags) => {
      const propsArr = iterToArr(tags).map((tag) => getSingleTagViewProps ? getSingleTagViewProps(tag) : null).filter((p) => !!p)

      const before = propsArr.reduce<string | undefined>((p, c) => c.before ? (p || "") + c.before : p, undefined)
      const after = propsArr.reduce<string | undefined>((p, c) => c.after ? (p || "") + c.after : p, undefined)
      const colors = propsArr.map((p) => p.color).filter((c): c is string => !!c)
      let color

      if (colors.length == 1) {
        color = colors[0]
      } else if (colors.length > 1) {
        color = colors
      }

      const textColor = propsArr.reduce<string | undefined>((p, c) => !p ? c.textColor : p, undefined)
      const indicator = propsArr.reduce<string | undefined>((p, c) => !p ? c.indicator : p, undefined)
      const indicatorColor = propsArr.reduce<string | undefined>((p, c) => !p ? c.indicatorColor : p, undefined)

      return {
        value: "",
        before,
        after,
        color,
        indicator,
        indicatorColor,
        textColor,
      }
    }
