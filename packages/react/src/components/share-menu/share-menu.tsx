import {
  ActionIcon,
  type ActionIconProps,
  Menu,
  type MenuProps,
  useProps,
} from "@mantine/core"
import {
  IconCalendarDown,
  IconShare,
  IconShare3,
  IconTransfer,
} from "@tabler/icons-react"
import { iterToArr } from "../../utils.js"

export const shareMenuOptions = ["export", "share", "sync"] as const
export type ShareMenuOption = (typeof shareMenuOptions)[number]

export type ShareMenuProps = {
  enabledOptions?: Iterable<ShareMenuOption>
  onSelect?: (option: ShareMenuOption) => void
  ButtonProps?: Partial<ActionIconProps>
} & MenuProps

export const ShareMenu = (props: ShareMenuProps) => {
  const { enabledOptions, onSelect, ButtonProps, ...other } = useProps(
    "ShareMenu",
    { enabledOptions: [] },
    props,
  )

  const opts = iterToArr(enabledOptions)

  return (
    <Menu {...other}>
      <Menu.Target>
        <ActionIcon
          title="Sharing Options"
          variant="subtle"
          size="input-sm"
          {...ButtonProps}
        >
          <IconShare />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Import/Export</Menu.Label>
        {opts.includes("share") && (
          <Menu.Item
            leftSection={<IconShare3 />}
            onClick={() => onSelect && onSelect("share")}
          >
            Share My Schedule
          </Menu.Item>
        )}
        {opts.includes("sync") && (
          <Menu.Item
            leftSection={<IconTransfer />}
            onClick={() => onSelect && onSelect("sync")}
          >
            Sync Device
          </Menu.Item>
        )}
        {opts.includes("export") && (
          <Menu.Item
            leftSection={<IconCalendarDown />}
            onClick={() => onSelect && onSelect("export")}
          >
            Export Calendar
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
