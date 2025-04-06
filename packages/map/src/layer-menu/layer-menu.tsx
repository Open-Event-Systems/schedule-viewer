import {
  Button,
  Checkbox,
  Paper,
  PaperProps,
  Stack,
  useProps,
} from "@mantine/core"
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react"
import clsx from "clsx"
import { useMemo } from "react"

export type LayerMenuProps = PaperProps & {
  opened?: boolean
  onSetOpened?: (opened: boolean) => void
  layers?: readonly Readonly<{ id: string; label: string }>[]
  hiddenLayers?: Iterable<string>
  onChangeLayers?: (layers: Set<string>) => void
}

export const LayerMenu = (props: LayerMenuProps) => {
  const {
    className,
    opened,
    onSetOpened,
    layers,
    hiddenLayers = [],
    onChangeLayers,
    ...other
  } = useProps("LayerMenu", {}, props)

  const hiddenSet = useMemo(() => new Set(hiddenLayers), [hiddenLayers])

  if (!opened) {
    return (
      <Button
        variant="default"
        size="compact-xs"
        onClick={() => onSetOpened && onSetOpened(true)}
      >
        <IconCaretUp />
      </Button>
    )
  }

  return (
    <Paper className={clsx("LayerMenu-root", className)} p={4} {...other}>
      <Stack gap="xs">
        <Button
          fullWidth
          variant="default"
          size="compact-xs"
          onClick={() => onSetOpened && onSetOpened(false)}
        >
          <IconCaretDown />
        </Button>
        {layers?.map(({ id, label }) => (
          <Checkbox
            key={id}
            size="xs"
            label={label}
            checked={!hiddenSet.has(id)}
            onChange={(e) => {
              const newSet = new Set(hiddenSet)
              if (!e.target.checked) {
                newSet.add(id)
                onChangeLayers && onChangeLayers(newSet)
              } else {
                newSet.delete(id)
                onChangeLayers && onChangeLayers(newSet)
              }
            }}
          />
        ))}
      </Stack>
    </Paper>
  )
}
