import {
  SegmentedControl,
  type SegmentedControlProps,
  useProps,
} from "@mantine/core"
import clsx from "clsx"

import classes from "./bookmark-filter.module.scss"

export type BookmarkFilterProps = Omit<
  SegmentedControlProps,
  "data" | "value" | "onChange"
> & {
  value?: boolean
  onChange?: (enabled: boolean) => void
}

export const BookmarkFilter = (props: BookmarkFilterProps) => {
  const { className, value, onChange, ...other } = useProps(
    "BookmarkFilter",
    {},
    props,
  )

  return (
    <SegmentedControl
      variant="unstyled"
      className={clsx("BookmarkFilter-root", classes.root, className)}
      data={[
        {
          label: "Show All",
          value: "false",
        },
        {
          label: "Only Bookmarked",
          value: "true",
        },
      ]}
      value={value ? "true" : "false"}
      onChange={(v) => {
        onChange && onChange(v == "true")
      }}
      {...other}
    />
  )
}
