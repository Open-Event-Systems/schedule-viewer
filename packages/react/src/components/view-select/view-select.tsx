import { Select, useProps, type SelectProps } from "@mantine/core"
import { EyeIcon } from "@phosphor-icons/react/dist/icons/Eye"
import clsx from "clsx"

import classes from "./view-select.module.scss"

export type ViewSelectProps = { fixedWidth?: boolean } & SelectProps

export const ViewSelect = (props: ViewSelectProps) => {
  const { className, classNames, fixedWidth, ...other } = useProps(
    "ViewSelect",
    null,
    props,
  )

  return (
    <Select
      className={clsx("ViewSelect-root", classes.root, className)}
      classNames={{
        ...classNames,
        input: clsx(
          classNames && "input" in classNames && classNames.input,
          classes.input,
          fixedWidth && classes.fixedWidth,
        ),
      }}
      size="sm"
      label="View Type"
      allowDeselect={false}
      leftSection={<EyeIcon size={20} />}
      variant="default"
      {...other}
    />
  )
}
