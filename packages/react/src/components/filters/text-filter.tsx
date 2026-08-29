import { TextInput, useProps, type TextInputProps } from "@mantine/core"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/icons/MagnifyingGlass"
import clsx from "clsx"

export type TextFilterProps = TextInputProps

export const TextFilter = (props: TextFilterProps) => {
  const { className, ...other } = useProps("TextFilter", null, props)

  return (
    <TextInput
      className={clsx("TextFilter-root", className)}
      title="Search"
      leftSection={<MagnifyingGlassIcon size={24} />}
      {...other}
    />
  )
}
