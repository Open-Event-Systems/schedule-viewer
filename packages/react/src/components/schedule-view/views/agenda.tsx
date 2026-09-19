import { Bins } from "#src/components/bins/bins.js"
import type { BinnedViewComponentProps } from "#src/components/schedule-view/binned-view.js"
import { useProps } from "@mantine/core"
import { makeTimeBinFunc } from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { useMemo } from "react"

export type AgendaViewProps = BinnedViewComponentProps

export const AgendaView = (props: AgendaViewProps) => {
  const { rootProps, now, items, renderBin, renderFirstLevelBinTitle } =
    useProps("AgendaView", null, props)
  const { className, ...other } = rootProps ?? {}

  const binFunc = useMemo(() => makeTimeBinFunc(now), [now])

  return (
    <Bins
      className={clsx("AgendaView-day", className)}
      binFunc={binFunc}
      renderBin={renderBin}
      items={items}
      renderBinTitle={renderFirstLevelBinTitle}
      {...other}
    />
  )
}
