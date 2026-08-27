import { Box, useProps, type CSSProperties } from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import clsx from "clsx"

import classes from "./inline-list.module.scss"

export type InlineListProps = DefaultBoxProps & {
  after?: string | null
}

const _InlineList = (props: InlineListProps) => {
  const { className, after, children, ...other } = useProps(
    "InlineList",
    null,
    props,
  )

  return (
    <InlineList.Root className={clsx(className)} after={after} {...other}>
      {children}
    </InlineList.Root>
  )
}

export type InlineListRootProps = DefaultBoxProps & {
  after?: string | null
}

export const InlineListRoot = (props: InlineListRootProps) => {
  const { className, after, style, ...other } = useProps(
    "InlineListRoot",
    { after: "," },
    props,
  )

  const cssVars: CSSProperties = {}

  if (after) {
    cssVars["--after"] = `"${after}"`
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

export type InlineListItemProps = DefaultBoxProps

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
