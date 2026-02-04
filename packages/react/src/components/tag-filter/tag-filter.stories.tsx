import type { Meta, StoryObj } from "@storybook/react-vite"
import { TagFilter } from "./tag-filter.js"
import { useCallback, useState } from "react"
import { makeObservableSet, type BasicSet } from "../../utils/basic-set.js"
import { action } from "mobx"
import { Observer } from "mobx-react-lite"

const meta: Meta<typeof TagFilter> = {
  component: TagFilter,
  args: {
    tags: [
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
    ],
    tagIndicators: [
      {
        tags: ["mature"],
        label: "18+",
      },
    ],
  },
}

export default meta

export const Default: StoryObj<typeof TagFilter> = {
  render(args) {
    const [disabledTags] = useState<BasicSet<string>>(() => makeObservableSet())

    const onSetDisabled = useCallback(
      action((tag: string, disabled: boolean) => {
        if (disabled) {
          disabledTags.add(tag)
        } else {
          disabledTags.delete(tag)
        }
      }),
      [disabledTags],
    )

    return (
      <TagFilter
        {...args}
        disabledTags={disabledTags}
        onSetDisabled={onSetDisabled}
        renderTag={(props) => (
          <Observer>
            {() => (
              <TagFilter.Tag
                {...props}
                disabled={disabledTags.has(props.tag)}
              />
            )}
          </Observer>
        )}
      />
    )
  },
}
