import { TextInput, useProps, type TextInputProps } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import clsx from "clsx"

export type TextFilterProps = TextInputProps

export const TextFilter = (props: TextFilterProps) => {
  const { className, ...other } = useProps("TextFilter", null, props)

  return (
    <TextInput
      className={clsx("TextFilter-root", className)}
      title="Search"
      leftSection={<IconSearch />}
      {...other}
    />
  )
}
