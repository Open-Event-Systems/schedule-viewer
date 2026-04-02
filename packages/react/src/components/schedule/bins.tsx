import { Box, Title, useProps, type BoxProps } from "@mantine/core"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import type { AllHTMLAttributes, ReactNode } from "react"
import { ItemPills, type ItemPillsProps } from "../pill/item-pills.js"

import classes from "./bins.module.scss"

type ScheduleBin = Readonly<{
  key: string
  title: ReactNode
  items?: Iterable<DetailedScheduleItem>
}>

type ScheduleBinFunc = (
  items: Iterable<DetailedScheduleItem>,
) => Iterable<ScheduleBin>

export type ScheduleBinsProps = {
  items?: Iterable<DetailedScheduleItem>
  binFunc?: ScheduleBinFunc
  renderItemPills?: (props: ItemPillsProps & { key: string }) => ReactNode
  title?: ReactNode
  renderTitle?: (props: AllHTMLAttributes<HTMLElement> & BoxProps) => ReactNode
} & BoxProps

export const ScheduleBins = (props: ScheduleBinsProps) => {
  const {
    className,
    items,
    binFunc,
    renderItemPills,
    title,
    renderTitle,
    ...other
  } = useProps(
    "ScheduleBins",
    {
      binFunc: () => [],
      renderItemPills: (props: ItemPillsProps & { key: string }) => (
        <ItemPills {...props} />
      ),
      renderTitle: (props: AllHTMLAttributes<HTMLElement> & BoxProps) => (
        <h2 {...props} />
      ),
    },
    props,
  )

  const els = []

  for (const bin of binFunc(items ?? [])) {
    const itemsArr = [...(bin.items ?? [])]
    if (itemsArr.length == 0) {
      continue
    }

    els.push(
      renderItemPills({
        key: bin.key,
        items: itemsArr,
        title: bin.title,
      }),
    )
  }

  return (
    <Box
      className={clsx("ScheduleBins-root", classes.root, className)}
      {...other}
    >
      {title && (
        <Title
          className="ScheduleBins-title"
          order={2}
          renderRoot={renderTitle}
        >
          {title}
        </Title>
      )}
      {els}
    </Box>
  )
}
