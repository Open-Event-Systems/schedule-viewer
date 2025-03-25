import {
  ActionIcon,
  Modal,
  ModalProps,
  Stack,
  Text,
  TextInput,
  useProps,
} from "@mantine/core"
import { IconCopy } from "@tabler/icons-react"
import { useRef } from "react"

export type ShareDialogProps = ModalProps & {
  shareURL?: string
  type: "share" | "sync"
}

export const ShareDialog = (props: ShareDialogProps) => {
  const {
    className,
    type,
    shareURL = "",
    ...other
  } = useProps("ShareDialog", {}, props)

  const textRef = useRef<HTMLInputElement | null>(null)

  return (
    <Modal title={type == "share" ? "Share" : "Sync"} {...other}>
      <Stack gap="xs">
        {type == "share" ? (
          <Text>Use this link to share your current selections.</Text>
        ) : (
          <Text>
            Open this link on another device to sync your selections to it.
          </Text>
        )}
        <TextInput
          readOnly
          title="Share URL"
          value={shareURL}
          ref={textRef}
          rightSection={
            <ActionIcon
              variant="subtle"
              title="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(shareURL)
                textRef.current?.select()
              }}
            >
              <IconCopy />
            </ActionIcon>
          }
        />
      </Stack>
    </Modal>
  )
}
