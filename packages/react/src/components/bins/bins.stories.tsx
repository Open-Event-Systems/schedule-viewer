import type { Meta, StoryObj } from "@storybook/react-vite"
import { Bins } from "./bins.js"
import { List } from "@mantine/core"
import { iterToArr, type Bin } from "@open-event-systems/schedule-lib"

const meta: Meta<typeof Bins> = {
  component: Bins,
}

export default meta

export const Default: StoryObj<typeof Bins<string>> = {
  args: {
    bins: [
      {
        key: "1",
        name: "Bin 1",
        items: ["A", "B", "C"],
      },
      {
        key: "2",
        name: "Bin 2",
        items: ["D", "E", "F"],
      },
    ],
    renderBin: (props, bin) => {
      return (
        <List renderRoot={(listProps) => <ul {...props} {...listProps} />}>
          {iterToArr(bin.items).map((i) => (
            <List.Item key={i}>{i}</List.Item>
          ))}
        </List>
      )
    },
  },
}

export const Nested: StoryObj<typeof Bins<Bin<string>>> = {
  args: {
    bins: [
      {
        key: "1",
        name: "Bin 1",
        items: [
          {
            key: "1",
            name: "Sub Bin 1",
            items: ["A", "B"],
          },
        ],
      },
      {
        key: "2",
        name: "Bin 2",
        items: [
          {
            key: "1",
            name: "Sub Bin 2",
            items: ["C", "D"],
          },
        ],
      },
    ],
    renderBin: (props, bin) => {
      return (
        <Bins
          {...props}
          bins={bin.items}
          renderBinTitle={(props) => <h3 {...props} />}
          renderBin={(props, bin) => {
            return (
              <List
                renderRoot={(listProps) => <ul {...props} {...listProps} />}
              >
                {iterToArr(bin.items).map((i) => (
                  <List.Item key={i}>{i}</List.Item>
                ))}
              </List>
            )
          }}
        />
      )
    },
  },
}

export const Empty: StoryObj<typeof Bins<string>> = {
  args: {
    bins: [],
    renderBin: (props, bin) => {
      return (
        <List renderRoot={(listProps) => <ul {...props} {...listProps} />}>
          {iterToArr(bin.items).map((i) => (
            <List.Item key={i}>{i}</List.Item>
          ))}
        </List>
      )
    },
  },
}
