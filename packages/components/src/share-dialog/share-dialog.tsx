import {
  ActionIcon,
  Alert,
  Box,
  Modal,
  ModalProps,
  Skeleton,
  Stack,
  Text,
  TextInput,
  useProps,
} from "@mantine/core"
import { IconAlertTriangle, IconCopy } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { ShareButton } from "../share-button/share-button.js"

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
  const curRef = useRef<string>("")
  curRef.current = shareURL

  const [[svgFor, svg], setSvg] = useState<[string, string]>(["", ""])

  useEffect(() => {
    if (shareURL) {
      import("qrcode").then((qrcode) =>
        qrcode
          .toString(shareURL, {
            type: "svg",
            width: 200,
          })
          .then((res) => {
            if (shareURL == curRef.current) {
              setSvg([shareURL, res])
            }
          }),
      )
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
        {svg && shareURL == svgFor ? (
          <Box
            dangerouslySetInnerHTML={{ __html: svg }}
            w={200}
            h={200}
            m="auto"
          ></Box>
        ) : (
          <Skeleton w={200} h={200} m="auto" />
        )}

        <TextInput
          readOnly
          title="Share URL"
          value={shareURL}
          ref={textRef}
          onFocus={(e) => {
            e.target.select()
          }}
          rightSection={<ShareButton url={shareURL} />}
        />
      </Stack>
    </Modal>
  )
}
