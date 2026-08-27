import {
  Box,
  parseThemeColor,
  useMantineColorScheme,
  useMantineTheme,
  useProps,
  type CSSProperties,
  type MantineSize,
} from "@mantine/core"
import type { DefaultBoxProps, RenderRootFunc } from "../types.js"
import clsx from "clsx"
import type { ReactNode } from "react"

import classes from "./icon-section.module.scss"

export type IconSectionProps = Omit<DefaultBoxProps, "size"> & {
  size?: MantineSize
  color?: string
  icon?: ReactNode
  renderIcon?: RenderRootFunc
  classNames?: {
    root?: string
    icon?: string
    content?: string
  }
}

const _IconSection = (props: IconSectionProps) => {
  const {
    className,
    size,
    color,
    icon,
    renderIcon,
    classNames,
    children,
    ...other
  } = useProps("IconSection", null, props)

  return (
    <IconSection.Root
      className={clsx(className, classNames?.root)}
      size={size}
      color={color}
      {...other}
    >
      <IconSection.Icon className={classNames?.icon} renderRoot={renderIcon}>
        {icon}
      </IconSection.Icon>
      <IconSection.Content className={classNames?.content}>
        {children}
      </IconSection.Content>
    </IconSection.Root>
  )
}

export type IconSectionRootProps = Omit<DefaultBoxProps, "size"> & {
  size?: MantineSize
  color?: string
}

export const IconSectionRoot = (props: IconSectionRootProps) => {
  const { className, size, color, style, ...other } = useProps(
    "IconSectionRoot",
    null,
    props,
  )

  const theme = useMantineTheme()
  const scheme = useMantineColorScheme()
  const cssVars: CSSProperties = {}

  if (color) {
    const parsedColor = parseThemeColor({
      theme,
      color,
      colorScheme: scheme.colorScheme,
    })
    cssVars["--color"] = parsedColor.value
  }

  return (
    <Box
      className={clsx("IconSection-root", classes.root, className)}
      data-size={size}
      style={{
        ...cssVars,
        ...style,
      }}
      {...other}
    />
  )
}

export type IconSectionIconProps = DefaultBoxProps

export const IconSectionIcon = (props: IconSectionIconProps) => {
  const { className, ...other } = useProps("IconSectionIcon", null, props)

  return (
    <Box
      className={clsx("IconSection-icon", classes.icon, className)}
      {...other}
    />
  )
}

export type IconSectionContentProps = DefaultBoxProps

export const IconSectionContent = (props: IconSectionContentProps) => {
  const { className, ...other } = useProps("IconSectionContent", null, props)

  return (
    <Box
      className={clsx("IconSectionContent-root", classes.content, className)}
      {...other}
    />
  )
}

export const IconSection = Object.assign(_IconSection, {
  Root: IconSectionRoot,
  Icon: IconSectionIcon,
  Content: IconSectionContent,
})
