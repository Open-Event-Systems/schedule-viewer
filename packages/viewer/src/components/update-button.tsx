import { Button, Group, Text } from "@mantine/core"
import { IconReload } from "@tabler/icons-react"
import { observer } from "mobx-react-lite"
import { useSWStore } from "../service-worker.js"

export const UpdateButton = observer(() => {
  const swStore = useSWStore()

  if (!swStore.updateAvailable) {
    return null
  }

  return (
    <Group>
      <Text span>A new version of this page is available.</Text>
      <Button
        size="xs"
        variant="outline"
        leftSection={<IconReload />}
        onClick={() => {
          swStore.confirmUpdate()
        }}
      >
        Update
      </Button>
    </Group>
  )
})

UpdateButton.displayName = "UpdateButton"
