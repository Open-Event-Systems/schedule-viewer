import { ActionIcon, Box, Title, useProps } from "@mantine/core"
import type { DefaultBoxProps } from "@open-event-systems/schedule-react"
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp"
import clsx from "clsx"
import type { ReactNode } from "react"

import classes from "./main-layout.module.scss"

export type MainLayoutProps = MainLayoutRootProps & {
  title?: ReactNode
  homeURL?: string
  logoURL?: string
}

const _MainLayout = (props: MainLayoutProps) => {
  const { children, title, homeURL, logoURL, ...other } = useProps(
    "MainLayout",
    null,
    props,
  )

  return (
    <MainLayout.Root {...other}>
      <MainLayout.Header title={title} homeURL={homeURL} logoURL={logoURL} />
      <MainLayout.Content>{children}</MainLayout.Content>
      <MainLayout.Footer>Footer</MainLayout.Footer>
    </MainLayout.Root>
  )
}

export type MainLayoutRootProps = DefaultBoxProps

export const MainLayoutRoot = (props: MainLayoutRootProps) => {
  const { className, children, ...other } = useProps(
    "MainLayoutRoot",
    null,
    props,
  )

  return (
    <Box
      className={clsx("MainLayout-root", classes.root, className)}
      {...other}
    >
      <Box className={classes.inner}>{children}</Box>
    </Box>
  )
}

export type MainLayoutHeaderProps = Omit<DefaultBoxProps, "children"> & {
  title?: ReactNode
  homeURL?: string
  logoURL?: string
}

export const MainLayoutHeader = (props: MainLayoutHeaderProps) => {
  const { className, title, homeURL, logoURL, ...other } = useProps(
    "MainLayoutHeader",
    null,
    props,
  )

  let content = (
    <>
      {logoURL && <img src={logoURL} className={classes.logo} alt="" />}
      <Title className={classes.title} order={1}>
        {title}
      </Title>
    </>
  )

  if (homeURL) {
    content = (
      <a href={homeURL} className={classes.titleArea}>
        {content}
      </a>
    )
  } else {
    content = <Box className={classes.titleArea}>{content}</Box>
  }

  return (
    <Box
      component="header"
      className={clsx("MainLayout-header", classes.header, className)}
      {...other}
    >
      {content}
    </Box>
  )
}

export type MainLayoutContentProps = DefaultBoxProps

export const MainLayoutContent = (props: MainLayoutContentProps) => {
  const { className, ...other } = useProps("MainLayoutContent", null, props)

  return (
    <Box
      component="main"
      className={clsx("MainLayout-Content", classes.content, className)}
      {...other}
    />
  )
}

export type MainLayoutFooterProps = DefaultBoxProps

export const MainLayoutFooter = (props: MainLayoutFooterProps) => {
  const { className, ...other } = useProps("MainLayoutFooter", null, props)

  return (
    <Box
      component="footer"
      className={clsx("MainLayout-footer", classes.footer, className)}
      {...other}
    >
      <Box className={classes.up}>
        <ActionIcon
          component="a"
          href=""
          title="Back to top"
          size="xl"
          radius="xl"
          variant="subtle"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0 })
          }}
        >
          <ArrowUpIcon className={classes.upButton} size={24} />
        </ActionIcon>
      </Box>
      <Box className={classes.labels}>ULE</Box>
    </Box>
  )
}

export const MainLayout = Object.assign(_MainLayout, {
  Root: MainLayoutRoot,
  Header: MainLayoutHeader,
  Content: MainLayoutContent,
  Footer: MainLayoutFooter,
})
