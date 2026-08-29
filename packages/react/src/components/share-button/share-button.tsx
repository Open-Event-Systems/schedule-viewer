import {
  ActionIcon,
  type ActionIconProps,
  Tooltip,
  useProps,
} from "@mantine/core"
import { ShareFatIcon } from "@phosphor-icons/react/dist/icons/ShareFat"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"

export type ShareButtonProps = {
  className?: string
  url?: string
} & ActionIconProps

export const ShareButton = (props: ShareButtonProps) => {
  const { className, url, ...other } = useProps("ShareButton", {}, props)

  const [tooltipOpen, setTooltipOpen] = useState(false)

  const canShare = useMemo(() => {
    if (typeof navigator == "undefined" || !("share" in navigator)) {
      return false
    }
    return navigator.canShare({ url: url })
  }, [url])

  useEffect(() => {
    if (tooltipOpen) {
      const id = window.setTimeout(() => {
        setTooltipOpen(false)
      }, 1500)
      return () => {
        window.clearTimeout(id)
      }
    }
  }, [tooltipOpen])

  return (
    <>
      <Tooltip label="Copied" opened={tooltipOpen} position="bottom">
        <ActionIcon
          className={clsx("ShareButton-button", className)}
          title="Share"
          variant="default"
          onClick={() => {
            if (!canShare) {
              if (typeof navigator != "undefined" && "clipboard" in navigator) {
                navigator.clipboard.writeText(url || window.location.href)
                setTooltipOpen(true)
              }
            } else {
              navigator.share({ url })
            }
          }}
          {...other}
        >
          <ShareFatIcon size={20} />
        </ActionIcon>
      </Tooltip>
    </>
  )
}
