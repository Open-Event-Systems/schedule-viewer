import {
  Button,
  Checkbox,
  Paper,
  type PaperProps,
  Stack,
  useProps,
} from "@mantine/core"
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react"
import clsx from "clsx"
import { useMemo } from "react"
import type { MapFlagToggle, MapLayer } from "../types.js"
import { iterToArr } from "@open-event-systems/schedule-lib"

export type ToggleMenuProps = PaperProps & {
  opened?: boolean
  onSetOpened?: (opened: boolean) => void
  layers?: Iterable<MapLayer>
  flagToggles?: Iterable<MapFlagToggle>
  hiddenLayers?: Iterable<string>
  onChangeLayer?: (layer: string, enable: boolean) => void
  enabledFlags?: Iterable<string>
  onChangeFlag?: (flag: string, enable: boolean) => void
}

export const ToggleMenu = (props: ToggleMenuProps) => {
  const {
    className,
    opened,
    onSetOpened,
    layers,
    flagToggles,
    hiddenLayers,
    onChangeLayer,
    enabledFlags,
    onChangeFlag,
    ...other
  } = useProps("ToggleMenu", {}, props)

  const hiddenSet = useMemo(() => new Set(hiddenLayers), [hiddenLayers])

  const layersArr = iterToArr(layers)
  const togglesArr = iterToArr(flagToggles)
  const enabledFlagsArr = iterToArr(enabledFlags)

  if (!opened) {
    return (
      <Button
        className="ToggleMenu-showButton"
        variant="default"
        size="compact-xs"
        aria-label="toggle layer menu"
        aria-expanded={opened ? "true" : "false"}
        onClick={() => onSetOpened && onSetOpened(true)}
      >
        <IconCaretUp />
      </Button>
    )
  }

  return (
    <Paper className={clsx("ToggleMenu-root", className)} p={4} {...other}>
      <Stack gap="xs">
        <Button
          fullWidth
          variant="default"
          size="compact-xs"
          onClick={() => onSetOpened && onSetOpened(false)}
        >
          <IconCaretDown />
        </Button>
        {layersArr.map(({ id, title }) => (
          <Checkbox
            key={`layer-${id}`}
            size="xs"
            label={title}
            role="switch"
            checked={!hiddenSet.has(id)}
            aria-checked={!hiddenSet.has(id)}
            onChange={(e) => {
              onChangeLayer && onChangeLayer(id, e.target.checked)
            }}
          />
        ))}
        {togglesArr.map(({ id, title }) => (
          <Checkbox
            key={`toggle-${id}`}
            size="xs"
            label={title}
            role="switch"
            checked={enabledFlagsArr.includes(id)}
            aria-checked={enabledFlagsArr.includes(id)}
            onChange={(e) => {
              onChangeFlag && onChangeFlag(id, e.target.checked)
            }}
          />
        ))}
      </Stack>
    </Paper>
  )
}
