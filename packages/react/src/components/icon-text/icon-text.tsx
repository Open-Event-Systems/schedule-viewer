import { Box, Text, type TextProps, useProps } from "@mantine/core"
import clsx from "clsx"
import type { ReactNode } from "react"

import classes from "./icon-text.module.scss"

export type IconTextProps = {
  icon?: ReactNode
  children?: ReactNode
} & TextProps

export const IconText = (props: IconTextProps) => {
  const { className, icon, children, ...other } = useProps(
    "IconText",
    {},
    props,
  )

  return (
    <Box className={clsx("IconText-root", classes.root, className)} {...other}>
      <Text span className={clsx("IconText-icon", classes.icon)} {...other}>
        {icon}
      </Text>
      <Text span className={clsx("IconText-text", classes.text)} {...other}>
        {children}
      </Text>
    </Box>
  )
}
