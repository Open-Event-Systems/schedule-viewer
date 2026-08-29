import { Modal, useProps, type ModalProps } from "@mantine/core"
import clsx from "clsx"

import classes from "./filter-dialog.module.scss"

export type FilterDialogProps = ModalProps

export const FilterDialog = (props: FilterDialogProps) => {
  const { className, onClose, children, ...other } = useProps(
    "FilterDialog",
    null,
    props,
  )

  return (
    <Modal
      className={clsx("FilterDialog-root", className)}
      title="Filter"
      classNames={{
        body: classes.body,
      }}
      onClose={onClose}
      {...other}
    >
      {children}
    </Modal>
  )
}
