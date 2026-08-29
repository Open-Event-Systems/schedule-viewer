import type { Meta, StoryObj } from "@storybook/react-vite"
import { FilterDialog } from "./filter-dialog.js"
import { TextFilter } from "./text-filter.js"
import { TagFilter, type TagFilterMode } from "./tag-filter.js"
import { useState } from "react"
import { PastEventsFilter } from "./past-events-filter.js"
import { tagData } from "../../test-data-new.js"

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
          tags={[...tagData, "Other"]}
          onSetDisabled={(tag, disabled) => {
            setState((prev) => {
              const newSet = new Set(prev.disabledTags)

              if (disabled) {
                newSet.add(tag)
              } else {
                newSet.delete(tag)
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
