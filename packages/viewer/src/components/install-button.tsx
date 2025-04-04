import { observer } from "mobx-react-lite"
import { useSWStore } from "../service-worker.js"
import { ActionIcon } from "@mantine/core"
import { IconDownload } from "@tabler/icons-react"

export const InstallButton = observer(() => {
  const swStore = useSWStore()

  if (swStore.hasInstallPrompt) {
    return (
      <ActionIcon
        title="Install"
        onClick={() => {
          swStore.prompt()
        }}
        variant="outline"
      >
        <IconDownload />
      </ActionIcon>
    )
  }
})

InstallButton.displayName = "InstallButton"
