import { Box, Text, TextProps, useProps } from "@mantine/core"
import clsx from "clsx"
import { ReactNode } from "react"

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
    <Box className={clsx("IconText-root", className)} {...other}>
      <Text className="IconText-icon" {...other}>
        {icon}
      </Text>
      <Text className="IconText-text" {...other}>
        {children}
      </Text>
    </Box>
  )
}
