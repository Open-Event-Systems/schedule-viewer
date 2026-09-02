import {
  ActionIcon,
  Box,
  Text,
  Tooltip,
  useProps,
  type ActionIconProps,
  type MantineSize,
  type TooltipProps,
} from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import clsx from "clsx"

import { iterToSet } from "@open-event-systems/schedule-lib"
import { ShareButton } from "../newsharebutton/share-button.js"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react"
import { BookmarkIcon } from "@phosphor-icons/react/dist/icons/Bookmark"

import { EyeIcon } from "@phosphor-icons/react/dist/icons/Eye"

import classes from "./item-buttons.module.scss"

export const ItemButtonsFeature = {
  share: "share",
  ical: "ical",
  bookmark: "bookmark",
  visited: "visited",
} as const

export type ItemButtonsFeature =
  (typeof ItemButtonsFeature)[keyof typeof ItemButtonsFeature]

export type ItemButtonsProps = DefaultBoxProps & {
  variant?: "horizontal" | "vertical"
  size?: MantineSize
  enableFeatures?: Iterable<ItemButtonsFeature>
  url?: string
  // icsData?: ShareButtonICalProps["icsData"]
  isBookmarked?: boolean
  isVisited?: boolean
  bookmarkCount?: number
  onSetBookmarked?: (isBookmarked: boolean) => void
  onSetVisited?: (isVisited: boolean) => void
}

export const ItemButtons = (props: ItemButtonsProps) => {
  const {
    className,
    variant,
    size,
    enableFeatures,
    url,
    // icsData,
    isBookmarked,
    isVisited,
    bookmarkCount,
    onSetBookmarked,
    onSetVisited,
    ...other
  } = useProps("ItemButtons", null, props)

  const els = []

  const feats = iterToSet(enableFeatures)

  if (feats.has("share") && url) {
    els.push(
      <ShareButton.URL
        size={size}
        url={url}
        title="Share"
        tooltipPosition={variant == "vertical" ? "left" : "bottom"}
      />,
    )
  }

  // if (feats.has("ical") && icsData) {
  //   els.push(
  //     <ShareButton.ICal
  //       size={size}
  //       icsData={icsData}
  //       title="Export to calendar"
  //       tooltipPosition={variant == "vertical" ? "left" : "bottom"}
  //     />,
  //   )
  // }

  if (feats.has("bookmark")) {
    els.push(
      <TooltipButton
        className={classes.button}
        size={size}
        variant={isBookmarked ? "filled" : "default"}
        tooltipLabel={isBookmarked ? "Bookmarked" : "Unbookmarked"}
        tooltipPosition={variant == "vertical" ? "left" : "bottom"}
        title={isBookmarked ? "Unbookmark" : "Bookmark"}
        onClick={() => {
          onSetBookmarked && onSetBookmarked(!isBookmarked)
        }}
      >
        <BookmarkIcon />
      </TooltipButton>,
    )
  }

  if (feats.has("visited")) {
    els.push(
      <TooltipButton
        className={classes.button}
        size={size}
        variant={isVisited ? "filled" : "default"}
        tooltipLabel={isVisited ? "Visited" : "Unvisited"}
        tooltipPosition={variant == "vertical" ? "left" : "bottom"}
        title={isVisited ? "Mark unvisited" : "Mark visited"}
        onClick={() => {
          onSetVisited && onSetVisited(!isVisited)
        }}
      >
        <EyeIcon />
      </TooltipButton>,
    )
  }

  if (bookmarkCount && bookmarkCount > 0) {
    els.push(<BookmarkCount count={bookmarkCount} />)
  }

  return (
    <Box
      className={clsx("ItemButtons-root", classes.root, className)}
      data-size={size}
      data-variant={variant}
      {...other}
    >
      {els}
    </Box>
  )
}

const TooltipButton = (
  props: ActionIconProps &
    DefaultBoxProps<"button"> & {
      tooltipLabel?: ReactNode
      tooltipPosition?: TooltipProps["position"]
    },
) => {
  const { tooltipLabel, onClick, tooltipPosition, ...other } = props
  const [opened, setOpened] = useState(false)

  const timeoutRef = useRef<number | null>(null)

  const wrappedOnClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick && onClick(e)

      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
      setOpened(true)
      timeoutRef.current = window.setTimeout(() => {
        setOpened(false)
        timeoutRef.current = null
      }, 750)
    },
    [onClick, setOpened, timeoutRef],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [timeoutRef])

  return (
    <Tooltip label={tooltipLabel} opened={opened} position={tooltipPosition}>
      <ActionIcon onClick={wrappedOnClick} {...other} />
    </Tooltip>
  )
}

const BookmarkCount = (props: { count?: number }) => {
  const { count } = props

  return (
    <Box className={clsx("ItemButtons-bookmarkCount", classes.bookmarkCount)}>
      <Box className={classes.bookmarkCountIcon}>
        <BookmarkIcon />
      </Box>
      <Text className={classes.bookmarkCountNumber} span>
        {count}
      </Text>
    </Box>
  )
}
