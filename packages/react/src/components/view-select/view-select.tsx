import { Select, useProps, type SelectProps } from "@mantine/core"
import clsx from "clsx"
import { IconEye } from "@tabler/icons-react"
import { scheduleViewTypes, type ScheduleViewType } from "../../types.js"

const viewTypeNames = {
  "daily-agenda": "Daily Agenda",
  "full-agenda": "Full Agenda",
  catalog: "Catalog",
  tags: "Tags",
} as const satisfies Record<ScheduleViewType, string>

export type ViewSelectProps = Omit<
  SelectProps,
  "data" | "value" | "onChange"
> & {
  allowedTypes?: Iterable<ScheduleViewType>
  type?: ScheduleViewType
  onChange?: (type: ScheduleViewType) => void
}

export const ViewSelect = (props: ViewSelectProps) => {
  const { className, allowedTypes, type, onChange, ...other } = useProps(
    "ViewSelect",
    {
      allowedTypes: scheduleViewTypes,
    },
    props,
  )

  const allowedTypesArr = [...allowedTypes]

  return (
    <Select
      className={clsx("ViewSelect-root", className)}
      size="sm"
      title="View Type"
      aria-label="view type"
      allowDeselect={false}
      leftSection={<IconEye size={18} />}
      variant="default"
      {...other}
      defaultValue={allowedTypesArr[0] ?? scheduleViewTypes[0]}
      data={allowedTypesArr.map((t) => ({
        value: t,
        label: viewTypeNames[t],
      }))}
      value={type}
      onChange={
        onChange && ((v) => v != null && onChange(v as ScheduleViewType))
      }
    />
  )
}
