import {
  Box,
  Divider,
  Indicator,
  useProps,
  type CSSProperties,
  type IndicatorProps,
} from "@mantine/core"
import type { DefaultBoxProps, RenderRootFunc } from "../types.js"
import clsx from "clsx"

import classes from "./pill.module.scss"
import type { ReactNode } from "react"
import React from "react"

export type PillProps = Omit<PillRootProps, "color"> & {
  classNames?: {
    root?: string
    indicator?: string
    body?: string
  }
  before?: string
  after?: string
  indicator?: ReactNode
  indicatorColor?: string
  color?: string | Iterable<string>
  textColor?: string
  disabled?: boolean
  renderBody?: RenderRootFunc
  PillBodyProps?: Partial<PillBodyProps>
  IndicatorProps?: Partial<PillIndicatorProps>
  children?: ReactNode
}

const _Pill = (props: PillProps) => {
  const {
    className,
    classNames,
    before,
    after,
    indicator,
    indicatorColor,
    color,
    textColor,
    disabled,
    renderBody,
    PillBodyProps,
    IndicatorProps,
    children,
    ...other
  } = useProps("Pill", null, props)

  const inner = (
    <Pill.Body
      className={classNames?.body}
      before={before}
      after={after}
      color={color}
      textColor={textColor}
      renderRoot={renderBody}
      {...PillBodyProps}
    >
      {children}
    </Pill.Body>
  )

  let content = inner

  if (indicator) {
    content = (
      <Pill.Indicator
        className={classNames?.indicator}
        label={indicator}
        color={indicatorColor}
        {...IndicatorProps}
      >
        {inner}
      </Pill.Indicator>
    )
  }

  return (
    <Pill.Root
      className={clsx(className, classNames?.root)}
      hasIndicator={!!indicator}
      disabled={disabled}
      {...other}
    >
      {content}
    </Pill.Root>
  )
}

export type PillRootProps = DefaultBoxProps & {
  hasIndicator?: boolean
  disabled?: boolean
}

export const PillRoot = (props: PillRootProps) => {
  const { className, hasIndicator, disabled, ...other } = useProps(
    "PillRoot",
    null,
    props,
  )

  return (
    <Box
      className={clsx(
        "Pill-root",
        classes.root,
        hasIndicator && classes.hasIndicator,
        disabled && classes.disabled,
        className,
      )}
      {...other}
    />
  )
}

export type PillIndicatorProps = IndicatorProps

export const PillIndicator = (props: PillIndicatorProps) => {
  const { className, ...other } = useProps("PillIndicator", null, props)

  return (
    <Indicator
      className={clsx("Pill-indicator", classes.indicatorRoot, className)}
      classNames={{
        indicator: classes.indicatorBody,
      }}
      autoContrast
      {...other}
    />
  )
}

export type PillBodyProps = Omit<DefaultBoxProps, "color"> & {
  color?: string | Iterable<string>
  textColor?: string
  before?: string
  after?: string
}

export const PillBody = (props: PillBodyProps) => {
  const { className, color, textColor, before, after, style, ...other } =
    useProps("PillBody", null, props)

  const fullStyle: CSSProperties = {
    ...style,
  }

  if (before) {
    fullStyle["--pill-before"] = toContentString(before)
  }

  if (after) {
    fullStyle["--pill-after"] = toContentString(after)
  }

  if (textColor) {
    fullStyle["--pill-text-color"] = textColor
  }

  const bgColor = getBackgroundColorString(color)
  const bgGradient = getGradientString(color)

  if (bgColor) {
    fullStyle["--pill-background-color"] = bgColor
  }

  if (bgGradient) {
    fullStyle["--pill-background-gradient"] = bgGradient
  }

  return (
    <Box
      className={clsx(
        "Pill-body",
        classes.body,
        before && classes.hasBefore,
        after && classes.hasAfter,
        className,
      )}
      style={fullStyle}
      {...other}
    />
  )
}

export type PillBoxProps = PillBoxRootProps & {
  classNames?: {
    root?: string
    title?: string
    divider?: string
    content?: string
    item?: string
  }
  renderItem?: RenderRootFunc
}

const _PillBox = (props: PillBoxProps) => {
  const { classNames, renderItem, children, ...other } = useProps(
    "PillBox",
    null,
    props,
  )

  const mappedChildren = React.Children.map(children, (el, i) => {
    if (React.isValidElement(el)) {
      const cloned = React.cloneElement(el)

      return (
        <Pill.Box.Item
          key={cloned.key || i}
          className={classNames?.item}
          renderRoot={renderItem}
        >
          {cloned}
        </Pill.Box.Item>
      )
    } else {
      return el
    }
  })

  return (
    <Pill.Box.Root classNames={classNames} {...other}>
      {mappedChildren}
    </Pill.Box.Root>
  )
}

export type PillBoxRootProps = Omit<DefaultBoxProps, "title"> & {
  classNames?: {
    root?: string
    title?: string
    divider?: string
    content?: string
  }
  title?: ReactNode
  renderTitle?: RenderRootFunc
  renderContent?: RenderRootFunc
  TitleProps?: DefaultBoxProps
  ContentProps?: DefaultBoxProps
}

export const PillBoxRoot = (props: PillBoxRootProps) => {
  const {
    className,
    classNames,
    title,
    renderTitle,
    renderContent,
    TitleProps,
    ContentProps,
    children,
    ...other
  } = useProps("PillBoxRoot", null, props)

  return (
    <Box
      component="section"
      className={clsx("Pill-box", classes.box, className, classNames?.root)}
      {...other}
    >
      {title && (
        <Box
          component="h3"
          className={clsx("Pill-boxTitle", classes.boxTitle, classNames?.title)}
          renderRoot={renderTitle}
          {...TitleProps}
        >
          {title}
        </Box>
      )}
      {title && (
        <Divider
          className={clsx(
            "Pill-boxDivider",
            classes.boxDivider,
            classNames?.divider,
          )}
        />
      )}
      <Box
        component="ul"
        className={clsx(
          "Pill-boxContent",
          classes.boxContent,
          classNames?.content,
        )}
        renderRoot={renderContent}
        {...ContentProps}
      >
        {children}
      </Box>
    </Box>
  )
}

export type PillBoxItemProps = DefaultBoxProps

export const PillBoxItem = (props: PillBoxItemProps) => {
  const { className, ...other } = useProps(
    "PillBoxItem",
    { renderRoot: defaultRenderPillBoxItem },
    props,
  )

  return (
    <Box
      className={clsx("Pill-boxItem", classes.boxItem, className)}
      {...other}
    />
  )
}

const defaultRenderPillBoxTitle: RenderRootFunc = (props) => <h3 {...props} />
const defaultRenderPillBoxContent: RenderRootFunc = (props) => <ul {...props} />
const defaultRenderPillBoxItem: RenderRootFunc = (props) => <li {...props} />

export const PillBox = Object.assign(_PillBox, {
  Root: PillBoxRoot,
  Item: PillBoxItem,
})

export const Pill = Object.assign(_Pill, {
  Root: PillRoot,
  Indicator: PillIndicator,
  Body: PillBody,
  Box: PillBox,
  BoxRoot: PillBoxRoot,
  BoxItem: PillBoxItem,
  defaultRenderPillBoxTitle,
  defaultRenderPillBoxContent,
  defaultRenderPillBoxItem,
})

const toContentString = (s: string) => {
  s = s.replaceAll("\\", "\\\\")
  s = s.replaceAll('"', '\\"')
  return `"${s}"`
}

const getBackgroundColorString = (color?: string | Iterable<string>) => {
  if (!color || typeof color == "string") {
    return color
  }

  const colorArr = [...color]
  return colorArr[0]
}

const getGradientString = (color?: string | Iterable<string>) => {
  if (!Array.isArray(color) || color.length <= 1) {
    return
  }

  const parts = color.join(", ")

  return `linear-gradient(90deg, ${parts})`
}
