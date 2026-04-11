import { Box, type BoxProps, Text, useProps } from "@mantine/core"
import clsx from "clsx"
import type {
  AllHTMLAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react"

import classes from "./icon-text.module.scss"

export type IconTextProps = {
  icon?: ReactNode
  children?: ReactNode
  renderRoot?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode
  renderText?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode
} & BoxProps &
  ComponentPropsWithoutRef<"div">

export const IconText = (props: IconTextProps) => {
  const { className, icon, children, renderText, ...other } = useProps(
    "IconText",
    {},
    props,
  )

  return (
    <Box className={clsx("IconText-root", classes.root, className)} {...other}>
      <Text span className={clsx("IconText-icon", classes.icon)}>
        {icon}
      </Text>
      <Text
        renderRoot={renderText}
        span
        className={clsx("IconText-text", classes.text)}
      >
        {children}
      </Text>
    </Box>
  )
}
