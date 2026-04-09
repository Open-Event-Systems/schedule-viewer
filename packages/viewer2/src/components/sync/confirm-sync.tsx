import {
  Button,
  Group,
  Stack,
  Text,
  useProps,
  type StackProps,
} from "@mantine/core"
import { makeServerAPI } from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { useViewerConfig } from "../../config.js"
import { useNavigate } from "@tanstack/react-router"
import { pagesRoute } from "../../routes.js"

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
        selections on this device. {config.bookmarks}
      </Text>
      <Group>
        <Button
          onClick={() => {
            if (config.bookmarks) {
              const [api] = makeServerAPI(
                config.bookmarks,
                config.id,
                sessionToken,
              )
              api.getSessionToken().then(() => {
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
