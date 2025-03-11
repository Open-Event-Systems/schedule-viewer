import { Box, BoxProps, Button, Stack, useProps } from "@mantine/core"
import clsx from "clsx"
import { ReactNode, useCallback } from "react"
import { MapControl } from "../control.js"
import { observer } from "mobx-react-lite"
import { MapLevel } from "../types.js"

export type MapViewerProps = {
  control: MapControl
} & BoxProps

export const MapViewer = observer((props: MapViewerProps) => {
  const { className, control, ...other } = useProps("MapViewer", {}, props)

  const mount = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        control.mount(el)
      }
    },
    [control],
  )

  return (
    <Box className={clsx("MapViewer-root", className)} {...other}>
      <Box className="MapViewer-wrapper" ref={mount}></Box>
      <ControlsRight>
        <Button
          variant={control.isIsometric ? "filled" : "default"}
          size="compact-xs"
          onClick={() => {
            control.setIsometric(!control.isIsometric)
          }}
        >
          3D Layout
        </Button>
        {!control.isIsometric && (
          <LevelButtons
            levels={control.config.levels}
            selected={control.selectedLevel}
            onChangeLevel={(lvl) => control.setSelectedLevel(lvl)}
          />
        )}
      </ControlsRight>
    </Box>
  )
})

MapViewer.displayName = "MapViewer"

const ControlsRight = ({ children }: { children?: ReactNode }) => {
  return (
    <Stack className="MapViewer-controlsRight" gap="xs" p="xs">
      {children}
    </Stack>
  )
}

const LevelButtons = ({
  levels,
  selected,
  onChangeLevel,
}: {
  selected?: string
  levels: readonly MapLevel[]
  onChangeLevel?: (lvl: string) => void
}) => {
  return (
    <Stack className="MapViewer-levelButtons" gap="xs">
      {levels.map((lvl) => (
        <Button
          key={lvl.id}
          size="compact-xs"
          variant={lvl.id === selected ? "filled" : "default"}
          onClick={() => {
            if (lvl.id !== selected) {
              onChangeLevel && onChangeLevel(lvl.id)
            }
          }}
        >
          {lvl.title}
        </Button>
      ))}
    </Stack>
  )
}
