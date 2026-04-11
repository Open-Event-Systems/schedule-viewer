import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  SelectionsFilter,
  type SelectionsFilterOption,
} from "./selections-filter.js"
import { useCallback, useState, type AllHTMLAttributes } from "react"

const meta: Meta<typeof SelectionsFilter> = {
  component: SelectionsFilter,
}

export default meta

export const Default: StoryObj<typeof SelectionsFilter> = {
  render(args) {
    const [value, setValue] = useState<SelectionsFilterOption[]>([])
    return <SelectionsFilter {...args} value={value} onChange={setValue} />
  },
}

export const AsAnchor: StoryObj<typeof SelectionsFilter> = {
  render(args) {
    const [value, setValue] = useState<SelectionsFilterOption[]>([])
    const renderButton = useCallback(
      (
        props: AllHTMLAttributes<HTMLElement>,
        option: SelectionsFilterOption,
        state: boolean,
      ) => {
        const params = new URLSearchParams(window.location.search)
        if (state) {
          params.append(option, "true")
        } else {
          params.delete(option)
        }
        const newURL = new URL(window.location.href)
        newURL.search = String(params)
        return (
          <a
            href={String(newURL)}
            {...props}
            onClick={(e) => {
              e.preventDefault()
              if (state) {
                setValue([...value, option])
              } else {
                setValue(value.filter((v) => v != option))
              }
            }}
          />
        )
      },
      [value],
    )
    return (
      <SelectionsFilter
        {...args}
        value={value}
        onChange={setValue}
        renderButton={renderButton}
      />
    )
  },
}
