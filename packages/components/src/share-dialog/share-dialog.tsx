import {
  ActionIcon,
  Alert,
  Box,
  Modal,
  ModalProps,
  Stack,
  Text,
  TextInput,
  useProps,
} from "@mantine/core"
import { IconAlertTriangle, IconCopy } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import qrcode from "qrcode"

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

  const [svg, setSvg] = useState("")

  useEffect(() => {
    if (shareURL) {
      qrcode
        .toString(shareURL, {
          type: "svg",
        })
        .then((res) => setSvg(res))
    }
  }, [shareURL])

  return (
    <Modal title={type == "share" ? "Share" : "Sync"} {...other}>
      <Stack gap="xs">
        {type == "share" ? (
          <Text>Use this link to share your current selections.</Text>
        ) : (
          <>
            <Text>
              Open this link on another device to sync your selections to it.
            </Text>
            <Alert variant="light" color="yellow" icon={<IconAlertTriangle />}>
              Anyone with this link will be able to view and modify your
              schedule.
            </Alert>
          </>
        )}
        <Box dangerouslySetInnerHTML={{ __html: svg }} w={200} m="auto"></Box>
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
