import { Bins } from "#src/components/bins/bins.js"
import type { BinnedViewComponentProps } from "#src/components/schedule-view/binned-view.js"
import { useProps } from "@mantine/core"
import { binByName } from "@open-event-systems/schedule-lib"
import clsx from "clsx"

export type CatalogViewProps = BinnedViewComponentProps

export const CatalogView = (props: CatalogViewProps) => {
  const { rootProps, items, renderBin, renderFirstLevelBinTitle } = useProps(
    "CatalogView",
    null,
    props,
  )

  const { className, ...other } = rootProps ?? {}

  return (
    <Bins
      className={clsx("CatalogView-root", className)}
      binFunc={binByName}
      items={items}
      renderBin={renderBin}
      renderBinTitle={renderFirstLevelBinTitle}
      {...other}
    />
  )
}
