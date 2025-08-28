import { ActionIcon, ActionIconProps, Tooltip, useProps } from "@mantine/core"
import { IconShare3 } from "@tabler/icons-react"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"

export type ShareButtonProps = {
  className?: string
  url?: string
} & ActionIconProps

export const ShareButton = (props: ShareButtonProps) => {
  const {
    className,
    url = window.location.href,
    ...other
  } = useProps("ShareButton", {}, props)

  const [tooltipOpen, setTooltipOpen] = useState(false)

  const canShare = useMemo(() => {
    if (!("share" in navigator)) {
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
              if ("clipboard" in navigator) {
                navigator.clipboard.writeText(url)
                setTooltipOpen(true)
              }
            } else {
              navigator.share({ url })
            }
          }}
          {...other}
        >
          <IconShare3 />
        </ActionIcon>
      </Tooltip>
    </>
  )
}
