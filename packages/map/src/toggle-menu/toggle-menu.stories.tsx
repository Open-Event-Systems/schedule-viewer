import type { Meta, StoryObj } from "@storybook/react-vite"
import { ToggleMenu } from "./toggle-menu.js"
import { useState } from "react"

const meta: Meta<typeof ToggleMenu> = {
  component: ToggleMenu,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default: StoryObj<typeof ToggleMenu> = {
  args: {
    layers: [
      {
        id: "text",
        name: "Text",
      },
      {
        id: "detail",
        name: "Detail",
      },
      {
        id: "landmarks",
        name: "Landmarks",
      },
    ],
    flagToggles: [
      {
        id: "toggle",
        name: "Enable Feature",
      },
    ],
  },
  render(args) {
    const [opened, setOpened] = useState(false)
    const [hiddenLayers, setHiddenLayers] = useState<Iterable<string>>([])
    const [flags, setFlags] = useState<Iterable<string>>([])

    return (
      <ToggleMenu
        {...args}
        opened={opened}
        onSetOpened={setOpened}
        hiddenLayerIds={hiddenLayers}
        onChangeLayer={(layer, enabled) => {
          setHiddenLayers((cur) => {
            const newSet = new Set(cur)
            if (enabled) {
              newSet.delete(layer)
            } else {
              newSet.add(layer)
            }
            return newSet
          })
        }}
        enabledFlags={flags}
        onChangeFlag={(flag, enable) => {
          setFlags((cur) => {
            const newSet = new Set(cur)
            if (enable) {
              newSet.add(flag)
            } else {
              newSet.delete(flag)
            }
            return newSet
          })
        }}
      />
    )
  },
}
