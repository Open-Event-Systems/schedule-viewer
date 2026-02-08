import { Box, useProps, type BoxProps } from "@mantine/core"
import clsx from "clsx"

import classes from "./main-layout.module.scss"
import type { ReactNode } from "react"

export type MainLayoutProps = BoxProps & {
  children?: ReactNode
}

export const MainLayout = (props: MainLayoutProps) => {
  const { className, children, ...other } = useProps("MainLayout", {}, props)

  return (
    <Box
      className={clsx("MainLayout-root", classes.root, className)}
      {...other}
    >
      <Box className={clsx("MainLayout-container", classes.container)}>
        {children}
      </Box>
    </Box>
  )
}
