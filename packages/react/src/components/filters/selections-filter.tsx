import { Button, type ButtonGroupProps, useProps } from "@mantine/core"
import clsx from "clsx"

import { iterToSet } from "@open-event-systems/schedule-lib"

import classes from "./selections-filter.module.scss"
import type { MouseEvent } from "react"
import { BookmarkIcon } from "@phosphor-icons/react/dist/icons/Bookmark"
import { EyeIcon } from "@phosphor-icons/react/dist/icons/Eye"

export const selectionsFilterOptions = ["bookmarked", "unvisited"] as const

export type SelectionsFilterOption = (typeof selectionsFilterOptions)[number]

export type SelectionsFilterProps = {
  enableOptions?: Iterable<SelectionsFilterOption>
  value?: Iterable<SelectionsFilterOption>
  onChange?: (value: ReadonlySet<SelectionsFilterOption>) => void
  getHref?: (value: ReadonlySet<SelectionsFilterOption>) => string
  small?: boolean
} & ButtonGroupProps

export const SelectionsFilter = (props: SelectionsFilterProps) => {
  const {
    className,
    enableOptions,
    value,
    onChange,
    getHref,
    small,
    ...other
  } = useProps(
    "SelectionsFilter",
    { enableOptions: selectionsFilterOptions },
    props,
  )

  const optsSet = iterToSet(enableOptions)
  const valSet = iterToSet(value)

  const els = []

  if (optsSet.has("bookmarked")) {
    const newValue = new Set(valSet)
    if (valSet.has("bookmarked")) {
      newValue.delete("bookmarked")
    } else {
      newValue.add("bookmarked")
    }

    const newHref = getHref && getHref(newValue)

    els.push(
      <Button
        key="bookmarked"
        component={getHref ? "a" : "button"}
        className={clsx(classes.button)}
        leftSection={<BookmarkIcon size={20} />}
        variant={valSet.has("bookmarked") ? "filled" : "default"}
        href={newHref}
        size={small ? "xs" : "sm"}
        onClick={(e: MouseEvent) => {
          e.preventDefault()
          if (onChange) {
            onChange(newValue)
          }
        }}
      >
        Only Bookmarked
      </Button>,
    )
  }
  if (optsSet.has("unvisited")) {
    const newValue = new Set(valSet)
    if (valSet.has("unvisited")) {
      newValue.delete("unvisited")
    } else {
      newValue.add("unvisited")
    }

    const newHref = getHref && getHref(newValue)

    els.push(
      <Button
        key="unvisited"
        component={getHref ? "a" : "button"}
        className={clsx(classes.button)}
        leftSection={<EyeIcon size={20} />}
        variant={valSet.has("unvisited") ? "filled" : "default"}
        href={newHref}
        size={small ? "xs" : "sm"}
        onClick={(e: MouseEvent) => {
          e.preventDefault()
          if (onChange) {
            onChange(newValue)
          }
        }}
      >
        Only Unvisited
      </Button>,
    )
  }

  return (
    <Button.Group
      className={clsx("SelectionsFilter-root", className)}
      {...other}
    >
      {els}
    </Button.Group>
  )
}
