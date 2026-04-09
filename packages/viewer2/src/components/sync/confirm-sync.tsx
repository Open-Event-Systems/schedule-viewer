import {
  Button,
  Group,
  Stack,
  Text,
  useProps,
  type StackProps,
} from "@mantine/core"
import clsx from "clsx"
import { useViewerConfig } from "../../config.js"
import { useNavigate } from "@tanstack/react-router"
import { pagesRoute } from "../../routes.js"
import { makeSelectionsServiceAPI } from "@open-event-systems/schedule-lib"

export type ConfirmSyncPageProps = { sessionToken?: string | null } & StackProps

export const ConfirmSyncPage = (props: ConfirmSyncPageProps) => {
  const { className, sessionToken, ...other } = useProps(
    "ConfirmSyncPage",
    null,
    props,
  )

  const config = useViewerConfig()
  const navigate = useNavigate()

  return (
    <Stack className={clsx("ConfirmSyncPage-root", className)} {...other}>
      <Text>
        Sync your schedule to this device? This will replace all current
        selections on this device.
      </Text>
      <Group>
        <Button
          onClick={() => {
            if (config.bookmarks) {
              const api = makeSelectionsServiceAPI(
                config.bookmarks,
                config.id,
                sessionToken,
              )
              api.getSessionSelections("bookmarks").then(() => {
                navigate({
                  to: pagesRoute.to,
                  reloadDocument: true,
                })
              })
            }
          }}
        >
          Confirm
        </Button>
      </Group>
    </Stack>
  )
}
