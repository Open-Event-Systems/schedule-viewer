import {
  HoverCard,
  useProps,
  type HoverCardDropdownProps,
  type HoverCardProps,
} from "@mantine/core"
import { useEffect, useState, type ReactNode } from "react"

export type LazyHoverCardProps = {
  target?: ReactNode
  children?: ReactNode
  DropdownProps?: Partial<HoverCardDropdownProps>
} & Omit<HoverCardProps, "children">

export const LazyHoverCard = (props: LazyHoverCardProps) => {
  const { children, target, DropdownProps, ...other } = useProps(
    "LazyHoverCard",
    null,
    props,
  )

  const [enabled, setEnabled] = useState(false)

  // randomly delay rendering the hover card components to not hang the UI
  // (rendering several hundred of these is slow)
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setEnabled(true),
      Math.random() * 500,
    )
    return () => window.clearTimeout(timeout)
  }, [setEnabled])

  if (enabled) {
    return (
      <HoverCard withArrow position="top" openDelay={100} {...other}>
        <HoverCard.Target>{target}</HoverCard.Target>
        <HoverCard.Dropdown {...DropdownProps}>{children}</HoverCard.Dropdown>
      </HoverCard>
    )
  } else {
    return target
  }
}

// export const LazyHoverCard = (props: LazyHoverCardProps) => {
//   const { children, target, DropdownProps, ...other } = useProps(
//     "LazyHoverCard",
//     null,
//     props,
//   )

//   const [enterEvent, setEnterEvent] =
//     useState<MouseEvent<HTMLDivElement> | null>(null)

//   const [leaveEvent, setLeaveEvent] =
//     useState<MouseEvent<HTMLDivElement> | null>(null)

//   const onMouseEnter = useCallback(
//     (e: MouseEvent<HTMLDivElement>) => {
//       setEnterEvent((prev) => prev ?? e)
//     },
//     [setEnterEvent],
//   )

//   const onMouseLeave = useCallback(
//     (e: MouseEvent<HTMLDivElement>) => {
//       setLeaveEvent((prev) => prev ?? e)
//     },
//     [setLeaveEvent],
//   )

//   const targetEl = typeof target == "function" ? target() : target

//   if (!enterEvent) {
//     return (
//       <Wrapper onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
//         {targetEl}
//       </Wrapper>
//     )
//   } else {
//     const childEl = typeof children == "function" ? children() : children
//     return (
//       <HoverCard withArrow position="top" openDelay={100} {...other}>
//         <HoverCard.Target>
//           <Wrapper enterEvent={enterEvent} leaveEvent={leaveEvent}>
//             {targetEl}
//           </Wrapper>
//         </HoverCard.Target>
//         <HoverCard.Dropdown {...DropdownProps}>{childEl}</HoverCard.Dropdown>
//       </HoverCard>
//     )
//   }
// }

// const Wrapper = (
//   props: {
//     enterEvent?: MouseEvent<HTMLDivElement> | null
//     leaveEvent?: MouseEvent<HTMLDivElement> | null
//   } & ComponentPropsWithRef<"div">,
// ) => {
//   const {
//     children,
//     enterEvent,
//     leaveEvent,
//     onMouseEnter,
//     onMouseLeave,
//     ...other
//   } = props

//   const initialEnterEvent = useRef<MouseEvent<HTMLDivElement> | null>(null)
//   const initialLeaveEvent = useRef<MouseEvent<HTMLDivElement> | null>(null)

//   useLayoutEffect(() => {
//     if (enterEvent && onMouseEnter && !initialEnterEvent.current) {
//       onMouseEnter(enterEvent)
//     }
//     if (enterEvent) {
//       initialEnterEvent.current = enterEvent
//     }

//     if (leaveEvent && onMouseLeave && !initialLeaveEvent.current) {
//       onMouseLeave(leaveEvent)
//     }
//     if (leaveEvent) {
//       initialLeaveEvent.current = leaveEvent
//     }
//   }, [
//     enterEvent,
//     leaveEvent,
//     onMouseEnter,
//     onMouseLeave,
//     initialEnterEvent,
//     initialLeaveEvent,
//   ])

//   let finalChild

//   if (isValidElement(children)) {
//     const child = children as ReactElement<ComponentPropsWithRef<"div">>
//     finalChild = cloneElement(child, {
//       onMouseEnter,
//       onMouseLeave,
//       ...other,
//     })
//   } else {
//     finalChild = children
//   }

//   return finalChild
// }
