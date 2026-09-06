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
  target?: ReactNode | (() => ReactNode)
  children?: ReactNode | (() => ReactNode)
  DropdownProps?: Partial<HoverCardDropdownProps>
} & Omit<HoverCardProps, "children">

export const LazyHoverCard = (props: LazyHoverCardProps) => {
  const { children, target, DropdownProps, ...other } = useProps(
    "LazyHoverCard",
    null,
    props,
  )

  const [enterEvent, setEnterEvent] =
    useState<MouseEvent<HTMLDivElement> | null>(null)

  const onMouseEnter = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      setEnterEvent((prev) => prev ?? e)
    },
    [setEnterEvent],
  )

  const targetEl = typeof target == "function" ? target() : target

  if (!enterEvent) {
    return <Wrapper onMouseEnter={onMouseEnter}>{targetEl}</Wrapper>
  } else {
    const childEl = typeof children == "function" ? children() : children
    return (
      <HoverCard withArrow position="top" {...other}>
        <HoverCard.Target>
          <Wrapper enterEvent={enterEvent}>{targetEl}</Wrapper>
        </HoverCard.Target>
        <HoverCard.Dropdown {...DropdownProps}>{childEl}</HoverCard.Dropdown>
      </HoverCard>
    )
  }
}

const Wrapper = (
  props: {
    enterEvent?: MouseEvent<HTMLDivElement> | null
  } & ComponentPropsWithRef<"div">,
) => {
  const { children, enterEvent, onMouseEnter, ...other } = props

  const initialEnterEvent = useRef<MouseEvent<HTMLDivElement> | null>(null)

  useEffect(() => {
    if (enterEvent && onMouseEnter && !initialEnterEvent.current) {
      initialEnterEvent.current = enterEvent
      window.setTimeout(() => {
        onMouseEnter(enterEvent)
      }, 1)
    }
  }, [enterEvent, onMouseEnter, initialEnterEvent])

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
