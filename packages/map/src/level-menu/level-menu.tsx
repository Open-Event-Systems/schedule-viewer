import { Button, Stack, type StackProps, useProps } from "@mantine/core"
import type { MapLevel } from "../types-new.js"
import clsx from "clsx"

export type LevelMenuProps = {
  levels?: readonly MapLevel[]
  selectedLevel?: string
  onSelectLevel?: (id: string) => void
} & StackProps

export const LevelMenu = (props: LevelMenuProps) => {
  const {
    className,
    levels = [],
    selectedLevel,
    onSelectLevel,
    ...other
  } = useProps("LevelMenu", {}, props)

  const curIdx = levels.findIndex((lvl) => lvl.id == selectedLevel)

  const setFocus = (els: HTMLButtonElement[], d: number) => {
    const newIdx =
      (((curIdx + d) % levels.length) + levels.length) % levels.length
    els[newIdx]?.focus()
    els[newIdx]?.click()
  }

  const btns = levels.map((lvl) => {
    const active = lvl.id == selectedLevel
    return (
      <Button
        key={lvl.id}
        variant={active ? "filled" : "outline"}
        size="compact-xs"
        role="radio"
        tabIndex={active ? 0 : -1}
        aria-checked={active ? "true" : "false"}
        onClick={() => {
          onSelectLevel && onSelectLevel(lvl.id)
        }}
        onKeyDown={(e) => {
          const btns = [
            ...(e.currentTarget.parentElement?.querySelectorAll("button") ??
              []),
          ]
          if (e.key == "ArrowUp" || e.key == "ArrowLeft") {
            setFocus(btns, -1)
          } else if (e.key == "ArrowDown" || e.key == "ArrowRight") {
            setFocus(btns, 1)
          }
        }}
      >
        {lvl.title}
      </Button>
    )
  })

  return (
    <Stack
      className={clsx("LevelMenu-root", className)}
      gap="6px"
      role="radiogroup"
      aria-label="select level"
      {...other}
    >
      {btns}
    </Stack>
  )
}
