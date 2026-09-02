import { Box, useProps, type CSSProperties } from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import clsx from "clsx"

import classes from "./inline-list.module.scss"
import { Children, isValidElement } from "react"

export type InlineListProps = InlineListRootProps

const _InlineList = (props: InlineListProps) => {
  const { className, children, ...other } = useProps("InlineList", null, props)

  const mappedChildren = Children.map(children, (el, i) => {
    if (isValidElement(el)) {
      return <InlineList.Item key={el.key ?? i}>{el}</InlineList.Item>
    }
    return el
  })

  return (
    <InlineList.Root className={clsx(className)} {...other}>
      {mappedChildren}
    </InlineList.Root>
  )
}

export type InlineListRootProps = DefaultBoxProps<"ul"> & {
  after?: string | null
  gap?: string | number
}

export const InlineListRoot = (props: InlineListRootProps) => {
  const { className, after, gap, style, ...other } = useProps(
    "InlineListRoot",
    { after: "," },
    props,
  )

  const cssVars: CSSProperties = {}

  if (after) {
    cssVars["--after"] = `"${after}"`
  }

  if (gap != null) {
    cssVars["--gap"] = typeof gap == "number" ? `${gap}px` : gap
  }

  return (
    <Box
      component="ul"
      className={clsx("InlineList-root", classes.root, className)}
      style={{
        ...cssVars,
        ...style,
      }}
      {...other}
    />
  )
}

export type InlineListItemProps = DefaultBoxProps<"li">

export const InlineListItem = (props: InlineListItemProps) => {
  const { className, ...other } = useProps("InlineListItem", null, props)

  return (
    <Box
      component="li"
      className={clsx("InlineList-item", classes.item, className)}
      {...other}
    />
  )
}

export const InlineList = Object.assign(_InlineList, {
  Root: InlineListRoot,
  Item: InlineListItem,
})
