import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pills, type PillProps } from "./pills.js"
import { useCallback, useMemo } from "react"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { makeTagIndicatorFunc } from "../../config.js"
import { binItemsByTime } from "./bin.js"
import type {
  ItemDetailsItemType,
  ItemDetailsProps,
} from "../details/item-details.js"

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

    const getDetailsProps = useCallback((): Partial<ItemDetailsProps> => {
      return {
        locationHref: "#",
        onClickLocation(e) {
          e.preventDefault()
        },
        tags: parsedConfig.tags,
      }
    }, [parsedConfig.tags])

    const renderPill = useCallback(
      (props: PillProps, item: ItemDetailsItemType) => {
        return (
          <Pills.Pill
            key={item.id}
            {...props}
            href="#"
            onClick={(e) => {
              e.preventDefault()
            }}
            indicator={indicatorFunc(item.tags ?? [])}
            hasItemDetailsHoverCard
            item={item}
            ItemDetailsProps={getDetailsProps}
          >
            {item.title}
          </Pills.Pill>
        )
      },
      [indicatorFunc, getDetailsProps],
    )

    return <Pills bins={bins} renderPill={renderPill} />
  },
}
