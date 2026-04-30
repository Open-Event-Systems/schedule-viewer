import { Select, useProps, type SelectProps } from "@mantine/core"
import clsx from "clsx"
import { IconEye } from "@tabler/icons-react"

export type ViewSelectProps = SelectProps

export const ViewSelect = (props: ViewSelectProps) => {
  const { className, ...other } = useProps("ViewSelect", null, props)

  return (
    <Select
      className={clsx("ViewSelect-root", className)}
      size="sm"
      label="View Type"
      allowDeselect={false}
      leftSection={<IconEye size={18} />}
      variant="default"
      {...other}
    />
  )
}
