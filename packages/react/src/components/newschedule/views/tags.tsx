import { Bins } from "#src/components/bins/bins.js"
import { type BinnedViewComponentProps } from "#src/components/newschedule/binned-view.js"
import { useTagsConfig } from "#src/tags.js"
import { useProps } from "@mantine/core"
import { makeTagBinFunc } from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { useMemo } from "react"

export type TagsViewProps = BinnedViewComponentProps

export const TagsView = (props: TagsViewProps) => {
  const { rootProps, items, renderBin, renderFirstLevelBinTitle } = useProps(
    "TagsView",
    null,
    props,
  )

  const { className, ...other } = rootProps ?? {}

  const tagsConfig = useTagsConfig()

  const binFunc = useMemo(() => {
    return makeTagBinFunc(tagsConfig)
  }, [tagsConfig])

  return (
    <Bins
      className={clsx("TagsView-root", className)}
      items={items}
      binFunc={binFunc}
      renderBin={renderBin}
      renderBinTitle={renderFirstLevelBinTitle}
      {...other}
    />
  )
}
