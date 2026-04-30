import {
  Box,
  Group,
  Select,
  Tabs,
  useProps,
  type SelectProps,
  type TabsProps,
} from "@mantine/core"
import type { ReactNode } from "react"
import clsx from "clsx"

import classes from "./page-menu.module.scss"
import type { PageConfig } from "../../types.js"

export type PageMenuProps = {
  className?: string
  classNames?: SelectProps["classNames"] & TabsProps["classNames"]
  variant?: "tabs" | "select"
  selectedPage?: string
  pages?: readonly PageConfig[]
  onSelectPage?: (id: string) => void
  renderPage?: (pageCfg: PageConfig) => ReactNode
  getPageURL?: (id: string) => string | undefined
}

export const PageMenu = (props: PageMenuProps) => {
  const {
    className,
    classNames,
    variant,
    selectedPage,
    pages,
    onSelectPage,
    renderPage,
    getPageURL,
  } = useProps("PageMenu", { variant: "tabs", pages: [] }, props)

  if (variant == "tabs") {
    return (
      <PageMenu.Tabs
        className={className}
        classNames={classNames}
        selectedPage={selectedPage}
        pages={pages}
        onSelectPage={onSelectPage}
        renderPage={renderPage}
        getPageURL={getPageURL}
      />
    )
  } else {
    return (
      <PageMenu.Select
        className={className}
        classNames={classNames}
        selectedPage={selectedPage}
        pages={pages}
        onSelectPage={onSelectPage}
        renderPage={renderPage}
      />
    )
  }
}

export type PageMenuTabsProps = {
  selectedPage?: string
  pages?: readonly PageConfig[]
  onSelectPage?: (id: string) => void
  renderPage?: (pageCfg: PageConfig) => ReactNode
  getPageURL?: (id: string) => string | undefined
} & Omit<TabsProps, "value" | "onChange" | "children">

const PageMenuTabs = (props: PageMenuTabsProps) => {
  const {
    className,
    selectedPage,
    pages,
    onSelectPage,
    renderPage,
    getPageURL,
    ...other
  } = useProps("PageMenuTabs", { pages: [] }, props)

  const defaultSelected = pages[0]?.id

  return (
    <Tabs
      className={clsx("PageMenu-tabs", className)}
      value={selectedPage || defaultSelected}
      onChange={(value) => {
        if (value && onSelectPage) {
          onSelectPage(value)
        }
      }}
      keepMounted={false}
      {...other}
    >
      <Tabs.List>
        {pages.map((p) => (
          <Tabs.Tab
            key={p.id}
            value={p.id}
            renderRoot={(props) => (
              <a
                {...props}
                href={getPageURL && getPageURL(p.id)}
                onClick={(e) => {
                  e.preventDefault()
                  props.onClick && props.onClick(e)
                }}
              />
            )}
          >
            {p.title || p.id}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {pages.map((p) => (
        <Tabs.Panel
          key={p.id}
          className={clsx("PageMenu-content", classes.content)}
          value={p.id}
        >
          {renderPage && renderPage(p)}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}

export type PageMenuSelectProps = {
  selectedPage?: string
  pages?: readonly PageConfig[]
  onSelectPage?: (id: string) => void
  renderPage?: (pageCfg: PageConfig) => ReactNode
} & Omit<SelectProps, "value" | "onChange" | "data" | "children">

const PageMenuSelect = (props: PageMenuSelectProps) => {
  const { className, selectedPage, pages, onSelectPage, renderPage, ...other } =
    useProps("PageMenuSelect", { pages: [] }, props)

  const defaultSelectedPage = pages[0]?.id
  const selectedPageCfg = pages.find((p) => p.id == selectedPage) || pages[0]

  return (
    <>
      {pages.length > 1 && (
        <Group
          className={clsx("PageMenu-selectWrapper", className)}
          justify="start"
        >
          <Select
            label="Page"
            className={clsx("PageMenu-select")}
            width="auto"
            data={pages.map((p) => ({
              label: p.title || p.id,
              value: p.id,
            }))}
            value={selectedPage || defaultSelectedPage}
            onChange={(value) => {
              if (value && onSelectPage) {
                onSelectPage(value)
              }
            }}
            allowDeselect={false}
            {...other}
          />
        </Group>
      )}
      <Box className={clsx("PageMenu-content", classes.content)}>
        {selectedPageCfg && renderPage && renderPage(selectedPageCfg)}
      </Box>
    </>
  )
}

PageMenu.Tabs = PageMenuTabs
PageMenu.Select = PageMenuSelect
