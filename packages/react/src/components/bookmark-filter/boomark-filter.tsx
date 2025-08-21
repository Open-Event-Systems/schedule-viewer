import {
  SegmentedControl,
  SegmentedControlProps,
  useProps,
} from "@mantine/core"
import clsx from "clsx"

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
      className={clsx("BookmarkFilter-root", className)}
      data={[
        {
          label: "All Events",
          value: "false",
        },
        {
          label: "My Schedule",
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
