import { ActionIcon, Menu, MenuProps, useProps } from "@mantine/core"
import {
  IconCalendarDown,
  IconSettings,
  IconShare3,
  IconTransfer,
} from "@tabler/icons-react"

export type ShareMenuProps = {
  enableSync?: boolean
  onShare?: () => void
  onSync?: () => void
  onExport?: () => void
} & MenuProps

export const ShareMenu = (props: ShareMenuProps) => {
  const { enableSync, onShare, onSync, onExport, ...other } = useProps(
    "ShareMenu",
    {},
    props,
  )

  return (
    <Menu {...other}>
      <Menu.Target>
        <ActionIcon variant="transparent">
          <IconSettings />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Import/Export</Menu.Label>
        {enableSync && (
          <Menu.Item
            leftSection={<IconShare3 />}
            onClick={() => onShare && onShare()}
          >
            Share My Schedule
          </Menu.Item>
        )}
        {enableSync && (
          <Menu.Item
            leftSection={<IconTransfer />}
            onClick={() => onSync && onSync()}
          >
            Sync Device
          </Menu.Item>
        )}
        <Menu.Item
          leftSection={<IconCalendarDown />}
          onClick={() => onExport && onExport()}
        >
          Export Calendar
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
