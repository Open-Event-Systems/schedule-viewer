import type { Meta, StoryObj } from "@storybook/react-vite"
import { ScheduleBins } from "./bins.js"
import {
  binByTitle,
  makeTagBinFunc,
  makeTimeBinFunc,
} from "@open-event-systems/schedule-lib"
import { parsedConfig, parsedEvents } from "../../test-data.js"

const byTag = makeTagBinFunc(parsedConfig.tags)
const byTime = makeTimeBinFunc()

const meta: Meta<typeof ScheduleBins> = {
  component: ScheduleBins,
  argTypes: {
    binFunc: {
      control: "radio",
      options: ["By Title", "By Tags", "By Time"],
      mapping: {
        "By Title": binByTitle,
        "By Tags": byTag,
        "By Time": byTime,
      },
    },
  },
  args: {
    binFunc: binByTitle,
    items: parsedEvents,
  },
}

export default meta

export const Default: StoryObj<typeof ScheduleBins> = {}

export const WithTitle: StoryObj<typeof ScheduleBins> = {
  args: {
    title: "Example Title",
  },
}
