import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapDetails } from "./map-details.js"
import { ItemDetails } from "@open-event-systems/schedule-react"
import dayjs from "dayjs"

const meta: Meta<typeof MapDetails> = {
  component: MapDetails,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    name: "Panel Room",
    description: "Markdown location description.",
  },
}

export default meta

export const Default: StoryObj<typeof MapDetails> = {
  render(args) {
    return (
      <MapDetails
        {...args}
        nowChildren={
          <ItemDetails
            itemId="e1"
            title="Now Event"
            description="Event happening now."
            occurrences={[
              {
                startDate: dayjs(new Date(2020, 0, 1, 12)),
                endDate: dayjs(new Date(2020, 0, 1, 13)),
              },
            ]}
            keywords={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", name: "Main Event" },
              { tag: "performance", name: "Performance" },
            ]}
          />
        }
        laterChildren={
          <ItemDetails
            itemId="e2"
            title="Later Event"
            description="Event happening later."
            occurrences={[
              {
                startDate: dayjs(new Date(2020, 0, 1, 13)),
                endDate: dayjs(new Date(2020, 0, 1, 14)),
              },
            ]}
            keywords={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", name: "Main Event" },
              { tag: "performance", name: "Performance" },
            ]}
          />
        }
      />
    )
  },
}

export const Now_Only: StoryObj<typeof MapDetails> = {
  render(args) {
    return (
      <MapDetails
        {...args}
        nowChildren={
          <ItemDetails
            itemId="e1"
            title="Now Event"
            description="Event happening now."
            occurrences={[
              {
                startDate: dayjs(new Date(2020, 0, 1, 12)),
                endDate: dayjs(new Date(2020, 0, 1, 13)),
              },
            ]}
            keywords={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", name: "Main Event" },
              { tag: "performance", name: "Performance" },
            ]}
          />
        }
      />
    )
  },
}

export const Later_Only: StoryObj<typeof MapDetails> = {
  render(args) {
    return (
      <MapDetails
        {...args}
        laterChildren={
          <ItemDetails
            itemId="e2"
            title="Later Event"
            description="Event happening later."
            occurrences={[
              {
                startDate: dayjs(new Date(2020, 0, 1, 13)),
                endDate: dayjs(new Date(2020, 0, 1, 14)),
              },
            ]}
            keywords={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", name: "Main Event" },
              { tag: "performance", name: "Performance" },
            ]}
          />
        }
      />
    )
  },
}

export const Drawer: StoryObj<typeof MapDetails> = {
  render(args) {
    return (
      <MapDetails.Drawer opened={true} onClose={() => {}}>
        <MapDetails
          {...args}
          nowChildren={
            <ItemDetails
              itemId="e1"
              title="Now Event"
              description="Event happening now."
              occurrences={[
                {
                  startDate: dayjs(new Date(2020, 0, 1, 12)),
                  endDate: dayjs(new Date(2020, 0, 1, 13)),
                },
              ]}
              keywords={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", name: "Main Event" },
                { tag: "performance", name: "Performance" },
              ]}
            />
          }
          laterChildren={
            <ItemDetails
              itemId="e2"
              title="Later Event"
              description="Event happening later."
              occurrences={[
                {
                  startDate: dayjs(new Date(2020, 0, 1, 13)),
                  endDate: dayjs(new Date(2020, 0, 1, 14)),
                },
              ]}
              keywords={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", name: "Main Event" },
                { tag: "performance", name: "Performance" },
              ]}
            />
          }
        />
      </MapDetails.Drawer>
    )
  },
}

export const Drawer_Only_Now: StoryObj<typeof MapDetails> = {
  render(args) {
    return (
      <MapDetails.Drawer opened={true} onClose={() => {}}>
        <MapDetails
          {...args}
          nowChildren={
            <ItemDetails
              itemId="e1"
              title="Now Event"
              description="Event happening now."
              occurrences={[
                {
                  startDate: dayjs(new Date(2020, 0, 1, 12)),
                  endDate: dayjs(new Date(2020, 0, 1, 13)),
                },
              ]}
              keywords={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", name: "Main Event" },
                { tag: "performance", name: "Performance" },
              ]}
            />
          }
        />
      </MapDetails.Drawer>
    )
  },
}

export const Drawer_Only_Now_No_Title: StoryObj<typeof MapDetails> = {
  args: {
    name: null,
    description: "",
  },
  render(args) {
    return (
      <MapDetails.Drawer opened={true} onClose={() => {}}>
        <MapDetails
          {...args}
          nowChildren={
            <ItemDetails
              itemId="e1"
              title="Now Event"
              description="Event happening now."
              occurrences={[
                {
                  startDate: dayjs(new Date(2020, 0, 1, 12)),
                  endDate: dayjs(new Date(2020, 0, 1, 13)),
                },
              ]}
              keywords={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", name: "Main Event" },
                { tag: "performance", name: "Performance" },
              ]}
            />
          }
        />
      </MapDetails.Drawer>
    )
  },
}
