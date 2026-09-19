import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { testTagsConfig } from "../../test-data-new.js"
import { FilterDialog } from "./filter-dialog.js"
import { PastEventsFilter } from "./past-events-filter.js"
import { TagFilter, type TagFilterMode } from "./tag-filter.js"
import { TextFilter } from "./text-filter.js"

const meta: Meta<typeof FilterDialog> = {
  component: FilterDialog,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryObj<typeof FilterDialog> = {
  args: {
    opened: true,
  },
  render(args) {
    const [state, setState] = useState(() => ({
      text: "",
      mode: "exclude" as TagFilterMode,
      disabledTags: new Set<string>() as ReadonlySet<string>,
      showPastEvents: false,
    }))

    return (
      <FilterDialog {...args}>
        <TextFilter
          value={state.text}
          onChange={(e) =>
            setState((prev) => ({ ...prev, text: e.target.value }))
          }
        />
        <PastEventsFilter
          checked={state.showPastEvents}
          onChange={(e) =>
            setState((prev) => ({ ...prev, showPastEvents: e.target.checked }))
          }
        />
        <TagFilter
          label="Filter Tags"
          mode={state.mode}
          disabledTags={state.disabledTags}
          tags={[...testTagsConfig, "Other"]}
          onSetDisabled={(tags, disabled) => {
            setState((prev) => {
              let newSet

              if (disabled != null) {
                newSet = new Set(prev.disabledTags)
                for (const tag of tags) {
                  if (disabled) {
                    newSet.add(tag)
                  } else {
                    newSet.delete(tag)
                  }
                }
              } else {
                newSet = new Set(tags)
              }

              return { ...prev, disabledTags: newSet }
            })
          }}
          onSetMode={(mode) => setState((prev) => ({ ...prev, mode }))}
        />
      </FilterDialog>
    )
  },
}
