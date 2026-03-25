import {
  ActionIcon,
  Anchor,
  Box,
  Divider,
  Title,
  useProps,
  type BoxProps,
} from "@mantine/core"
import clsx from "clsx"

import type { ReactNode } from "react"
import { IconArrowUp } from "@tabler/icons-react"

import classes from "./main-layout.module.scss"

export type MainLayoutProps = BoxProps & {
  title?: ReactNode
  homeURL?: string
  menu?: ReactNode
  children?: ReactNode
}

export const MainLayout = (props: MainLayoutProps) => {
  const { className, title, homeURL, menu, children, ...other } = useProps(
    "MainLayout",
    {},
    props,
  )

  return (
    <Box
      className={clsx("MainLayout-root", classes.root, className)}
      {...other}
    >
      <Box className={clsx("MainLayout-container", classes.container)}>
        <Box className={clsx("MainLayout-header", classes.header)}>
          {homeURL ? (
            <Anchor
              className={clsx("MainLayout-titleAnchor", classes.titleAnchor)}
              href={homeURL}
            >
              <Title
                className={clsx("MainLayout-title", classes.title)}
                order={1}
              >
                {title}
              </Title>
            </Anchor>
          ) : (
            <Title
              className={clsx("MainLayout-title", classes.title)}
              order={1}
            >
              {title}
            </Title>
          )}

          <Box className={clsx("MainLayout-titleMenu", classes.titleMenu)}>
            {menu}
          </Box>
        </Box>
        <Box className={clsx("MainLayout-content", classes.content)}>
          {children}
        </Box>
        <Box
          component="footer"
          className={clsx("MainLayout-footer", classes.footer)}
        >
          <Divider
            className={clsx("MainLayout-footerDivider", classes.footerDivider)}
          />
          <ActionIcon
            className={clsx("mainLayout-btt", classes.btt)}
            title="Back to top"
            variant="subtle"
            size="xl"
            radius="xl"
            onClick={() => {
              window.scrollTo({ top: 0 })
            }}
          >
            <IconArrowUp />
          </ActionIcon>
          <Box
            className={clsx("MainLayout-footerDetails", classes.footerDetails)}
          >
            <Box className={clsx("MainLayout-version", classes.version)}>
              ULE v{__VIEWER_VERSION__}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
