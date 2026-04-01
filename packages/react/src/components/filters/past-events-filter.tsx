import { Switch, useProps, type SwitchProps } from "@mantine/core"
import clsx from "clsx"

export type PastEventsFilterProps = SwitchProps

export const PastEventsFilter = (props: PastEventsFilterProps) => {
  const { className, ...other } = useProps("PastEventsFilter", null, props)

  return (
    <Switch
      className={clsx("PastEventsFilter-root", className)}
      label="Show past events"
      {...other}
    />
  )
}
