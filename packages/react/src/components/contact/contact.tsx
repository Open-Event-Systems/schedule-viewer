import {
  Anchor,
  Avatar,
  Box,
  Text,
  useProps,
  type MantineSize,
} from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import type { MouseEvent } from "react"
import clsx from "clsx"

import classes from "./contact.module.scss"

export type ContactProps = DefaultBoxProps<"div"> &
  DefaultBoxProps<"a"> & {
    classNames?: {
      root?: string
      icon?: string
      text?: string
    }
    name?: string
    iconURL?: string
    href?: string
    size?: MantineSize
    color?: string
    onClickLink?: (e: MouseEvent<HTMLAnchorElement>) => void
  }

export const Contact = (props: ContactProps) => {
  const {
    className,
    classNames,
    name,
    iconURL,
    href,
    size,
    color,
    onClickLink,
    ...other
  } = useProps("Contact", null, props)

  const content = (
    <>
      <Avatar
        className={clsx("Contact-icon", classes.icon, classNames?.icon)}
        size={size}
        src={iconURL}
        name={name}
      />
      <Text
        className={clsx("Contact-text", classes.text, classNames?.text)}
        size={size}
        c={href ? undefined : color}
      >
        {name}
      </Text>
    </>
  )

  let root

  if (href) {
    root = (
      <Anchor
        className={clsx(
          "Contact-root",
          classes.root,
          classNames?.root,
          className,
        )}
        href={href}
        onClick={onClickLink}
        {...other}
      >
        {content}
      </Anchor>
    )
  } else {
    root = (
      <Box
        className={clsx(
          "Contact-root",
          classes.root,
          classNames?.root,
          className,
        )}
        {...other}
      >
        {content}
      </Box>
    )
  }

  return root
}
