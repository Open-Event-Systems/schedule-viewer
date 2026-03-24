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

// hack to fix css load order...
import "@mantine/core/styles.css"

import classes from "./main-layout.module.scss"
import { PageTitle } from "../title/title.js"

export type MainLayoutProps = BoxProps & {
  homeURL?: string
  children?: ReactNode
}

export const MainLayout = (props: MainLayoutProps) => {
  const { className, homeURL, children, ...other } = useProps(
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
        {homeURL ? (
          <Anchor
            className={clsx("MainLayout-titleAnchor", classes.titleAnchor)}
            href={homeURL}
          >
            <Title
              className={clsx("MainLayout-title", classes.title)}
              order={1}
            >
              <PageTitle />
            </Title>
          </Anchor>
        ) : (
          <Title className={clsx("MainLayout-title", classes.title)} order={1}>
            <PageTitle />
          </Title>
        )}
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
