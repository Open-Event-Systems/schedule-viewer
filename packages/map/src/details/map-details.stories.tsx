import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapDetails } from "./map-details.js"
import { ItemDetails } from "@open-event-systems/schedule-react"

const meta: Meta<typeof MapDetails> = {
  component: MapDetails,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "Panel Room",
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
                start: new Date(2020, 0, 1, 12),
                end: new Date(2020, 0, 1, 13),
              },
            ]}
            tags={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", title: "Main Event" },
              { tag: "performance", title: "Performance" },
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
                start: new Date(2020, 0, 1, 13),
                end: new Date(2020, 0, 1, 14),
              },
            ]}
            tags={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", title: "Main Event" },
              { tag: "performance", title: "Performance" },
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
                start: new Date(2020, 0, 1, 12),
                end: new Date(2020, 0, 1, 13),
              },
            ]}
            tags={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", title: "Main Event" },
              { tag: "performance", title: "Performance" },
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
                start: new Date(2020, 0, 1, 13),
                end: new Date(2020, 0, 1, 14),
              },
            ]}
            tags={new Set(["main-event", "performance"])}
            tagEntries={[
              { tag: "main-event", title: "Main Event" },
              { tag: "performance", title: "Performance" },
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
                  start: new Date(2020, 0, 1, 12),
                  end: new Date(2020, 0, 1, 13),
                },
              ]}
              tags={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", title: "Main Event" },
                { tag: "performance", title: "Performance" },
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
                  start: new Date(2020, 0, 1, 13),
                  end: new Date(2020, 0, 1, 14),
                },
              ]}
              tags={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", title: "Main Event" },
                { tag: "performance", title: "Performance" },
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
                  start: new Date(2020, 0, 1, 12),
                  end: new Date(2020, 0, 1, 13),
                },
              ]}
              tags={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", title: "Main Event" },
                { tag: "performance", title: "Performance" },
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
    title: null,
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
                  start: new Date(2020, 0, 1, 12),
                  end: new Date(2020, 0, 1, 13),
                },
              ]}
              tags={new Set(["main-event", "performance"])}
              tagEntries={[
                { tag: "main-event", title: "Main Event" },
                { tag: "performance", title: "Performance" },
              ]}
            />
          }
        />
      </MapDetails.Drawer>
    )
  },
}
