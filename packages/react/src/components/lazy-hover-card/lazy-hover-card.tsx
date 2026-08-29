import {
  HoverCard,
  useProps,
  type HoverCardDropdownProps,
  type HoverCardProps,
} from "@mantine/core"
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react"

export type LazyHoverCardProps = {
  target?: ReactNode
  DropdownProps?: Partial<HoverCardDropdownProps>
} & HoverCardProps

export const LazyHoverCard = (props: LazyHoverCardProps) => {
  const { children, target, DropdownProps, ...other } = useProps(
    "LazyHoverCard",
    null,
    props,
  )

  const prevEvent = useRef<MouseEvent<HTMLDivElement> | null>(null)

  const [enabled, setEnabled] = useState(false)

  const onMouseEnter = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!prevEvent.current) {
      prevEvent.current = e
      setEnabled(true)
    }
  }, [])

  if (!enabled) {
    return <Wrapper onMouseEnter={onMouseEnter}>{target}</Wrapper>
  }

  return (
    <HoverCard withArrow position="top" {...other}>
      <HoverCard.Target>
        <Wrapper enabled={enabled} prevEvent={prevEvent.current}>
          {target}
        </Wrapper>
      </HoverCard.Target>
      <HoverCard.Dropdown {...DropdownProps}>{children}</HoverCard.Dropdown>
    </HoverCard>
  )
}

const Wrapper = (
  props: {
    enabled?: boolean
    prevEvent?: MouseEvent<HTMLDivElement> | null
  } & ComponentPropsWithRef<"div">,
) => {
  const { children, enabled, prevEvent, onMouseEnter, ...other } = props

  const prevEnabled = useRef(false)

  useEffect(() => {
    if (enabled && !prevEnabled.current) {
      prevEnabled.current = enabled

      if (onMouseEnter && prevEvent) {
        window.setTimeout(() => {
          onMouseEnter(prevEvent)
        }, 1)
      }
    }
  }, [enabled, prevEvent, onMouseEnter])

  let finalChild

  if (isValidElement(children)) {
    const child = children as ReactElement<ComponentPropsWithRef<"div">>
    finalChild = cloneElement(child, {
      onMouseEnter,
      ...other,
    })
  } else {
    finalChild = children
  }

  return finalChild
}
