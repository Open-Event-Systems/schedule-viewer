import { Meta, StoryObj } from "@storybook/react"
import { LayerMenu } from "./layer-menu.js"
import { useState } from "react"

const meta: Meta<typeof LayerMenu> = {
  component: LayerMenu,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default: StoryObj<typeof LayerMenu> = {
  args: {
    layers: [
      {
        id: "text",
        label: "Text",
      },
      {
        id: "detail",
        label: "Detail",
      },
      {
        id: "landmarks",
        label: "Landmarks",
      },
    ],
  },
  render(args) {
    const [opened, setOpened] = useState(false)
    const [hiddenLayers, setHiddenLayers] = useState<ReadonlySet<string>>(
      new Set(),
    )

    return (
      <LayerMenu
        {...args}
        opened={opened}
        onSetOpened={setOpened}
        hiddenLayers={hiddenLayers}
        onChangeLayers={setHiddenLayers}
      />
    )
  },
}
