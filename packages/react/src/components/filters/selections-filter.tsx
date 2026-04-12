import { Button, type ButtonGroupProps, useProps } from "@mantine/core"
import clsx from "clsx"

import { iterToArr } from "@open-event-systems/schedule-lib"
import type { AllHTMLAttributes, ReactNode } from "react"
import { IconBookmark, IconEye } from "@tabler/icons-react"

import classes from "./selections-filter.module.scss"

export const selectionsFilterOptions = ["bookmarked", "unvisited"] as const

export type SelectionsFilterOption = (typeof selectionsFilterOptions)[number]

export type SelectionsFilterProps = {
  enableOptions?: Iterable<SelectionsFilterOption>
  value?: Iterable<SelectionsFilterOption>
  onChange?: (value: SelectionsFilterOption[]) => void
  renderButton?: (
    props: AllHTMLAttributes<HTMLElement>,
    option: SelectionsFilterOption,
    enabled: boolean,
  ) => ReactNode
} & ButtonGroupProps

export const SelectionsFilter = (props: SelectionsFilterProps) => {
  const { className, enableOptions, value, onChange, renderButton, ...other } =
    useProps(
      "SelectionsFilter",
      { enableOptions: selectionsFilterOptions },
      props,
    )

  const optsArr = iterToArr(enableOptions)
  const valArr = iterToArr(value)

  const els = []

  if (optsArr.includes("bookmarked")) {
    const render = renderButton
      ? (props: AllHTMLAttributes<HTMLElement>) => {
          return renderButton(
            props,
            "bookmarked",
            !valArr.includes("bookmarked"),
          )
        }
      : undefined

    els.push(
      <Button
        key="bookmarked"
        renderRoot={render}
        className={clsx(classes.button)}
        leftSection={<IconBookmark />}
        variant={valArr.includes("bookmarked") ? "filled" : "default"}
        onClick={() => {
          if (onChange) {
            if (valArr.includes("bookmarked")) {
              onChange([...valArr].filter((v) => v != "bookmarked"))
            } else {
              onChange([...valArr, "bookmarked"])
            }
          }
        }}
      >
        Only Bookmarked
      </Button>,
    )
  }
  if (optsArr.includes("unvisited")) {
    const render = renderButton
      ? (props: AllHTMLAttributes<HTMLElement>) => {
          return renderButton(props, "unvisited", !valArr.includes("unvisited"))
        }
      : undefined
    els.push(
      <Button
        key="unvisited"
        renderRoot={render}
        className={clsx(classes.button)}
        leftSection={<IconEye />}
        variant={valArr.includes("unvisited") ? "filled" : "default"}
        onClick={() => {
          if (onChange) {
            if (valArr.includes("unvisited")) {
              onChange([...valArr].filter((v) => v != "unvisited"))
            } else {
              onChange([...valArr, "unvisited"])
            }
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
