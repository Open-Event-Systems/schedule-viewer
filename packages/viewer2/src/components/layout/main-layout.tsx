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
  children?: ReactNode
}

const _MainLayout = (props: MainLayoutProps) => {
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

export type MainLayoutHeaderProps = BoxProps & {
  children?: ReactNode
  icons?: ReactNode
}

export const MainLayoutHeader = (props: MainLayoutHeaderProps) => {
  const { className, children, icons, ...other } = useProps(
    "MainLayoutHeader",
    null,
    props,
  )

  return (
    <Box
      component="header"
      className={clsx("MainLayout-header", classes.header, className)}
      {...other}
    >
      <Box className={clsx("MainLayout-headerContent", classes.headerContent)}>
        {children}
      </Box>
      <Box className={clsx("MainLayout-headerIcons", classes.headerIcons)}>
        {icons}
      </Box>
    </Box>
  )
}

export type MainLayoutTitleProps = {
  className?: string
  homeURL?: string
  logoURL?: string
  children?: ReactNode
}

export const MainLayoutTitle = (props: MainLayoutTitleProps) => {
  const { className, children, homeURL, logoURL } = useProps(
    "MainLayoutTitle",
    null,
    props,
  )

  let el = (
    <Title
      order={1}
      className={clsx("MainLayout-title", classes.title, className)}
    >
      {children}
    </Title>
  )

  if (logoURL) {
    el = (
      <>
        <img
          className={clsx("MainLayout-logo", classes.logo)}
          src={logoURL}
          alt=""
        />
        {el}
      </>
    )
  }

  if (homeURL) {
    el = (
      <Anchor
        className={clsx("MainLayout-titleAnchor", classes.titleAnchor)}
        href={homeURL}
      >
        {el}
      </Anchor>
    )
  }

  return (
    <Box className={clsx("MainLayout-titleRoot", classes.titleRoot, className)}>
      {el}
    </Box>
  )
}

export type MainLayoutContentProps = BoxProps & {
  children?: ReactNode
}

export const MainLayoutContent = (props: MainLayoutContentProps) => {
  const { className, children, ...other } = useProps(
    "MainLayoutContent",
    null,
    props,
  )

  return (
    <Box
      component="main"
      className={clsx("MainLayout-content", classes.content, className)}
      {...other}
    >
      {children}
    </Box>
  )
}

export type MainLayoutFooterProps = BoxProps & {
  children?: ReactNode
  rightSection?: ReactNode
}

export const MainLayoutFooter = (props: MainLayoutFooterProps) => {
  const { className, children, rightSection, ...other } = useProps(
    "MainLayoutFooter",
    null,
    props,
  )

  return (
    <Box
      component="footer"
      className={clsx("MainLayout-footer", classes.footer, className)}
      {...other}
    >
      <Divider
        className={clsx("MainLayout-footerDivider", classes.footerDivider)}
      />
      <Box
        className={clsx(
          "MainLayout-footerLeftSection",
          classes.footerLeftSection,
        )}
      >
        {children}
      </Box>
      <ActionIcon
        className={clsx("MainLayout-backToTop", classes.backToTop)}
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
        className={clsx(
          "MainLayout-footerRightSection",
          classes.footerRightSection,
        )}
      >
        {rightSection}
      </Box>
    </Box>
  )
}

export const MainLayout = Object.assign(_MainLayout, {
  Header: MainLayoutHeader,
  Title: MainLayoutTitle,
  Content: MainLayoutContent,
  Footer: MainLayoutFooter,
})
