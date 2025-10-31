import type { Meta, StoryObj } from "@storybook/react-vite"
import type { MouseEvent, ReactNode } from "react"
import { Pills } from "./pills.js"
import { useCallback, useMemo } from "react"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { makeTagIndicatorFunc } from "../../config/config.js"
import { useItemDetailsFunc } from "../details/context.js"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import { binItemsByTime, type PillsItemType } from "./bin.js"
import { PillPropsContext } from "./context.js"

const meta: Meta<typeof Pills> = {
  component: Pills,
}

export default meta

export const Default: StoryObj<typeof Pills> = {
  render() {
    const bins = useMemo(() => binItemsByTime(parsedEvents, 30), [parsedEvents])
    const indicatorFunc = useMemo(
      () => makeTagIndicatorFunc(parsedConfig.tagIndicators),
      [],
    )

    const detailsFunc = useItemDetailsFunc()

    const func = useCallback(
      (item: PillsItemType) => {
        return {
          href: "#",
          onClick(e: MouseEvent) {
            e.preventDefault()
          },
          indicator: indicatorFunc(item.tags ?? []),
          renderContent(c: ReactNode) {
            const detailsProps = detailsFunc(item)
            return (
              <ItemHoverCard item={item} ItemDetailsProps={detailsProps}>
                {c}
              </ItemHoverCard>
            )
          },
        }
      },
      [indicatorFunc, detailsFunc],
    )

    return (
      <PillPropsContext value={func}>
        <Pills bins={bins} />
      </PillPropsContext>
    )
  },
}
