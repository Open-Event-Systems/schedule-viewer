import {
  Button,
  Group,
  Modal,
  ModalProps,
  Stack,
  Text,
  useProps,
} from "@mantine/core"
import clsx from "clsx"

export type ConfirmSyncDialogProps = ModalProps & {
  onConfirm?: () => void
}

export const ConfirmSyncDialog = (props: ConfirmSyncDialogProps) => {
  const { className, onConfirm, onClose, ...other } = useProps(
    "ConfirmSyncDialog",
    {},
    props,
  )

  return (
    <Modal
      className={clsx("ConfirmSyncDialog-root", className)}
      title="Sync"
      onClose={onClose}
      {...other}
    >
      <Stack gap="xs">
        <Text>
          Sync your selections? This will replace your current selections on
          this device.
        </Text>
        <Group justify="flex-end">
          <Button onClick={() => onConfirm && onConfirm()}>Sync</Button>
          <Button
            variant="outline"
            color="red"
            onClick={() => onClose && onClose()}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
