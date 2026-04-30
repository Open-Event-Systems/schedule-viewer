import {
  Button,
  Group,
  Stack,
  Text,
  type NotificationProps,
  type StackProps,
} from "@mantine/core"
import { IconRefresh } from "@tabler/icons-react"

import classes from "./update-notification.module.scss"

export const updateNotificationProps = {
  color: "green",
  title: "Update Available",
} as const satisfies NotificationProps

export const UpdateNotificationBody = (
  props: StackProps & { onUpdate?: () => void },
) => {
  const { onUpdate, ...other } = props
  return (
    <Stack gap={4} {...other}>
      <Text span>Reload to view the latest information.</Text>
      <Group gap={4} justify="flex-start">
        <Button
          onClick={() => onUpdate && onUpdate()}
          leftSection={<IconRefresh className={classes.btnIcon} />}
          color="green"
          size="xs"
        >
          Reload
        </Button>
      </Group>
    </Stack>
  )
}
