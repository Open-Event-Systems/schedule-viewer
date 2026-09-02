import {
  ActionIcon,
  Tooltip,
  useProps,
  type ActionIconProps,
  type TooltipProps,
} from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import clsx from "clsx"

import classes from "./share-button.module.scss"
import { type ReactNode } from "react"
import {  shareURL, useTooltip } from "./hooks.js"
import { ShareFatIcon } from "@phosphor-icons/react/dist/icons/ShareFat"

export type ShareButtonURLProps = ShareButtonRootProps & {
  url?: string
}

export const ShareButtonURL = (props: ShareButtonURLProps) => {
  const { className, url, children, ...other } = useProps(
    "ShareButtonURL",
    null,
    props,
  )

  const { showTooltip, tooltipOpened, tooltipLabel } = useTooltip()

  return (
    <ShareButton.Root
      className={clsx("ShareButton-url", className)}
      tooltipOpened={tooltipOpened}
      tooltipLabel={tooltipLabel}
      onClick={() => {
        if (url) {
          const shareRes = shareURL(url)
          if (shareRes) {
            shareRes.then((method) => {
              if (method == "copied") {
                showTooltip("Copied")
              }
            })
          }
        }
      }}
      {...other}
    >
      {children || <ShareFatIcon />}
    </ShareButton.Root>
  )
}

// export type ShareButtonICalProps = ShareButtonRootProps & {
//   filename?: string
//   icsData?:
//     | string
//     | null
//     | Promise<string | null | undefined>
//     | (() => string | null | undefined | Promise<string | null | undefined>)
// }

// export const ShareButtonICal = (props: ShareButtonICalProps) => {
//   const { className,...other } = useProps(
//     "ShareButtonICal",
//     { filename: "event.ics" },
//     props,
//   )
//   return (
//     <ShareButton.Root
//       className={clsx("ShareButton-ical", className)}
//       onClick={onClick}
//       {...other}
//     >
//       <CalendarPlusIcon />
//     </ShareButton.Root>
//   )
// }

export type ShareButtonRootProps = ActionIconProps &
  DefaultBoxProps<"button"> & {
    tooltipOpened?: boolean
    tooltipLabel?: ReactNode
    tooltipPosition?: TooltipProps["position"]
    TooltipProps?: Partial<TooltipProps>
  }

export const ShareButtonRoot = (props: ShareButtonRootProps) => {
  const {
    className,
    tooltipOpened,
    tooltipLabel,
    tooltipPosition,
    TooltipProps,
    children,
    ...other
  } = useProps("ShareButtonRoot", { tooltipOpened: false }, props)

  return (
    <Tooltip
      label={tooltipLabel}
      opened={tooltipOpened}
      position={tooltipPosition}
      {...TooltipProps}
    >
      <ActionIcon
        className={clsx("ShareButton-root", classes.root, className)}
        variant="default"
        {...other}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  )
}

export const ShareButton = Object.assign(
  {},
  {
    Root: ShareButtonRoot,
    URL: ShareButtonURL,
    // ICal: ShareButtonICal,
  },
)
