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

export type ShareMenuProps = {
  enabledOptions?: Iterable<"export" | "share" | "sync">
  onShare?: () => void
  onSync?: () => void
  onExport?: () => void
  ButtonProps?: Partial<ActionIconProps>
} & MenuProps

export const ShareMenu = (props: ShareMenuProps) => {
  const { enabledOptions, onShare, onSync, onExport, ButtonProps, ...other } =
    useProps("ShareMenu", { enabledOptions: [] }, props)

  const opts = [...enabledOptions]

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
            onClick={() => onShare && onShare()}
          >
            Share My Schedule
          </Menu.Item>
        )}
        {opts.includes("sync") && (
          <Menu.Item
            leftSection={<IconTransfer />}
            onClick={() => onSync && onSync()}
          >
            Sync Device
          </Menu.Item>
        )}
        {opts.includes("export") && (
          <Menu.Item
            leftSection={<IconCalendarDown />}
            onClick={() => onExport && onExport()}
          >
            Export Calendar
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
