import {
  Button,
  type ButtonProps,
  Menu,
  type MenuProps,
  useProps,
} from "@mantine/core"
import { iterToSet } from "@open-event-systems/schedule-lib"
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/icons/CalendarBlank"
import { CloudArrowUpIcon } from "@phosphor-icons/react/dist/icons/CloudArrowUp"
import { ShareFatIcon } from "@phosphor-icons/react/dist/icons/ShareFat"
import { ShareNetworkIcon } from "@phosphor-icons/react/dist/icons/ShareNetwork"

export const ShareMenuOption = {
  export: "export",
  share: "share",
  sync: "sync",
} as const

export type ShareMenuOption =
  (typeof ShareMenuOption)[keyof typeof ShareMenuOption]

export const ShareMenuOptionNames = {
  export: "Export calendar",
  share: "Share selections",
  sync: "Sync selections",
} as const satisfies {
  readonly [K in ShareMenuOption]: string
}

export type ShareMenuProps = {
  enabledOptions?: Iterable<ShareMenuOption>
  onSelect?: (option: ShareMenuOption) => void
  small?: boolean
  ButtonProps?: Partial<ButtonProps>
} & MenuProps

export const ShareMenu = (props: ShareMenuProps) => {
  const { enabledOptions, onSelect, small, ButtonProps, ...other } = useProps(
    "ShareMenu",
    null,
    props,
  )

  const opts = iterToSet(enabledOptions)

  return (
    <Menu {...other}>
      <Menu.Target>
        <Button
          leftSection={<ShareNetworkIcon size={20} />}
          size={small ? "xs" : "sm"}
          variant="subtle"
          {...ButtonProps}
        >
          Share
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Import/Export</Menu.Label>
        {opts.has("share") && (
          <Menu.Item
            leftSection={<ShareFatIcon size={24} />}
            onClick={() => onSelect && onSelect("share")}
          >
            Share My Schedule
          </Menu.Item>
        )}
        {opts.has("sync") && (
          <Menu.Item
            leftSection={<CloudArrowUpIcon size={24} />}
            onClick={() => onSelect && onSelect("sync")}
          >
            Sync Device
          </Menu.Item>
        )}
        {opts.has("export") && (
          <Menu.Item
            leftSection={<CalendarBlankIcon size={24} />}
            onClick={() => onSelect && onSelect("export")}
          >
            Export Calendar
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
