import {
  Box,
  type BoxProps,
  Divider,
  Indicator,
  Title,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import {
  memo,
  type ComponentPropsWithoutRef,
  type ElementType,
  type MouseEvent,
  type NamedExoticComponent,
  type ReactNode,
} from "react"

import pillClasses from "./pills.module.scss"

export type PillsProps = {
  className?: string
  classNames?: {
    root?: string
    title?: string
    divider?: string
    content?: string
    ul?: string
    menu?: string
  }

  /**
   * The title of the pills.
   */
  title?: ReactNode

  /**
   * Whether the content is a menu element instead of a ul element.
   */
  menu?: boolean

  /**
   * The component to use for the title.
   */
  titleComponent?: ElementType<{ children: ReactNode }>

  children?: ReactNode
} & BoxProps &
  Omit<ComponentPropsWithoutRef<"section">, "children">

type PillsComponent = {
  Pill: typeof PillsPill
} & NamedExoticComponent<PillsProps>

/**
 * Displays data as pills.
 */
const _Pills: Partial<PillsComponent> = memo((props: PillsProps) => {
  const {
    className,
    classNames,
    title,
    menu,
    titleComponent,
    children,
    ...other
  } = useProps("Pills", { titleComponent: "h3" }, props)

  let titleContent

  if (title) {
    titleContent = (
      <>
        <Title
          component={titleComponent}
          order={3}
          className={clsx("Pills-title", pillClasses.title, classNames?.title)}
        >
          {title}
        </Title>
        <Divider
          className={clsx(
            "Pills-divider",
            pillClasses.divider,
            classNames?.divider,
          )}
        />
      </>
    )
  }

  let content

  if (menu) {
    content = (
      <Box
        component="menu"
        className={clsx(
          "Pills-content",
          "Pills-menu",
          pillClasses.content,
          pillClasses.menu,
          classNames?.content,
          classNames?.menu,
        )}
      >
        {children}
      </Box>
    )
  } else {
    content = (
      <Box
        component="ul"
        className={clsx(
          "Pills-content",
          "Pills-ul",
          pillClasses.content,
          pillClasses.ul,
          classNames?.content,
          classNames?.ul,
        )}
      >
        {children}
      </Box>
    )
  }

  return (
    <Box
      component="section"
      className={clsx("Pills-root", pillClasses.root, className)}
      {...other}
    >
      {titleContent}
      {content}
    </Box>
  )
})

_Pills.displayName = "Pills"

export type PillProps = {
  className?: string
  classNames?: {
    root?: string
    button?: string
    body?: string
    indicatorRoot?: string
    indicator?: string
  }

  /**
   * The URL the pill body to.
   */
  href?: string

  /**
   * Whether the body of the pill is a button instead of an anchor.
   */
  button?: boolean

  /**
   * Content to display in an indicator.
   */
  indicator?: ReactNode

  /**
   * Function to render a hover card.
   */
  renderHoverCard?: (props: { children?: ReactNode }) => ReactNode

  /**
   * Event handler for when the pill body is clicked.
   */
  onClickBody?: (e: MouseEvent) => void

  children?: ReactNode
} & BoxProps &
  Omit<ComponentPropsWithoutRef<"li">, "children">

/**
 * A single pill component.
 */
export const PillsPill = memo((props: PillProps) => {
  const {
    className,
    classNames,
    href,
    button,
    indicator,
    renderHoverCard,
    onClickBody,
    children,
    ...other
  } = useProps("PillsPill", {}, props)

  let inner

  if (button) {
    inner = (
      <Box
        component="button"
        className={clsx(
          "Pills-pillBody",
          "Pills-pillButton",
          pillClasses.body,
          pillClasses.button,
          classNames?.body,
        )}
        onClick={onClickBody}
      >
        {children}
      </Box>
    )
  } else {
    inner = (
      <Box
        component="a"
        className={clsx(
          "Pills-pillBody",
          "Pills-pillAnchor",
          pillClasses.body,
          pillClasses.anchor,
          classNames?.body,
        )}
        href={href}
        onClick={onClickBody}
      >
        {children}
      </Box>
    )
  }

  let withHover

  if (renderHoverCard) {
    withHover = renderHoverCard({ children: inner })
  } else {
    withHover = inner
  }

  let withIndicator

  if (indicator) {
    withIndicator = (
      <Indicator
        label={indicator}
        className={clsx(
          "Pills-pillIndicatorRoot",
          pillClasses.indicatorRoot,
          classNames?.indicatorRoot,
        )}
        classNames={{
          indicator: clsx(
            "Pills-pillIndicator",
            pillClasses.indicator,
            classNames?.indicator,
          ),
        }}
      >
        {withHover}
      </Indicator>
    )
  } else {
    withIndicator = withHover
  }

  return (
    <Box
      component="li"
      className={clsx(
        "Pills-pillRoot",
        pillClasses.pillRoot,
        classNames?.root,
        className,
      )}
      {...other}
    >
      {withIndicator}
    </Box>
  )
})

PillsPill.displayName = "Pills.Pill"

_Pills.Pill = PillsPill

export const Pills = _Pills as PillsComponent
