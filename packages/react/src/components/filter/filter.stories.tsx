import type { Meta, StoryObj } from "@storybook/react-vite"
import { Filter } from "./filter.js"
import { useReducer } from "react"
import { TagFilter } from "../tag-filter/tag-filter.js"

const meta: Meta<typeof Filter> = {
  component: Filter,
}

export default meta

type Settings = Readonly<{
  disabledTags: ReadonlySet<string>
  text: string
  showPastEvents: boolean
}>

export const Default: StoryObj<typeof meta> = {
  args: {
    noPastEventsOption: false,
  },
  render(args) {
    const [{ disabledTags, text, showPastEvents }, dispatch] = useReducer(
      (prevState: Settings, action: Partial<Settings>) => {
        return {
          ...prevState,
          ...action,
        }
      },
      {
        disabledTags: new Set<string>(),
        showPastEvents: false,
        text: "",
      },
    )

    return (
      <Filter
        {...args}
        text={
          <Filter.Text
            value={text}
            onChange={(e) => dispatch({ text: e.target.value })}
          />
        }
        pastEvents={
          <Filter.PastEvents
            checked={showPastEvents}
            onChange={(e) => dispatch({ showPastEvents: e.target.checked })}
          />
        }
        tagFilter={
          <TagFilter
            tags={[
              {
                tag: "art",
                title: "Art",
              },
              {
                tag: "photography",
                title: "Photography",
              },
              {
                tag: "mature",
                title: "Mature",
              },
            ]}
            tagIndicators={[
              {
                tags: ["mature"],
                label: "18+",
              },
            ]}
            disabledTags={disabledTags}
            onSetDisabled={(tag, disabled) => {
              const newSet = new Set(disabledTags)
              if (disabled) {
                newSet.add(tag)
              } else {
                newSet.delete(tag)
              }
              dispatch({ disabledTags: newSet })
            }}
          />
        }
      />
    )
  },
}
