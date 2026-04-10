import {
  Box,
  type BoxProps,
  createPolymorphicComponent,
  Divider,
  type HoverCardProps,
  Indicator,
  Title,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import {
  memo,
  useEffect,
  useState,
  type AllHTMLAttributes,
  type MouseEvent,
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
  }

  /**
   * The title of the pills.
   */
  title?: ReactNode

  /**
   * Customize how the title element is rendered.
   */
  renderTitle?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode

  /**
   * Customize how the content container element is rendered.
   */
  renderContent?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode

  children?: ReactNode
} & BoxProps

/**
 * Displays data as pills.
 */
const _PillsMemo = memo((props: PillsProps) => {
  const {
    className,
    classNames,
    title,
    renderContent,
    renderTitle,
    children,
    ...other
  } = useProps(
    "Pills",
    { renderTitle: defaultRenderTitle, renderContent: defaultRenderContent },
    props,
  )

  let titleContent

  if (title) {
    titleContent = (
      <>
        <Title
          renderRoot={renderTitle}
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

  return (
    <Box className={clsx("Pills-root", pillClasses.root, className)} {...other}>
      {titleContent}
      <Box
        renderRoot={renderContent}
        className={clsx(
          "Pills-content",
          pillClasses.content,
          classNames?.content,
        )}
      >
        {children}
      </Box>
    </Box>
  )
})

const defaultRenderTitle = (props: AllHTMLAttributes<HTMLElement>) => (
  <h2 {...props} />
)

const defaultRenderContent = (props: AllHTMLAttributes<HTMLElement>) => (
  <ul {...props} />
)

_PillsMemo.displayName = "Pills"

const _Pills = createPolymorphicComponent<"div", PillsProps>(_PillsMemo)

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
   * Content to display in an indicator.
   */
  indicator?: ReactNode

  /**
   * Customize how the pill body is rendered.
   */
  renderBody?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode

  /**
   * Function to render a hover card.
   */
  renderHoverCard?: (props: HoverCardProps) => ReactNode

  /**
   * Event handler for when the pill body is clicked.
   */
  onClickBody?: (e: MouseEvent) => void

  children?: ReactNode
} & BoxProps

/**
 * A single pill component.
 */
const _PillsPillMemo = memo((props: PillProps) => {
  const {
    className,
    classNames,
    indicator,
    renderBody,
    renderHoverCard,
    onClickBody,
    children,
    ...other
  } = useProps("PillsPill", { renderBody: defaultRenderBody }, props)

  // hack to improve rendering performance by setting up the hover components
  // after the first render
  const [hoverEnabled, setHoverEnabled] = useState(false)

  useEffect(() => {
    window.setTimeout(() => {
      setHoverEnabled(true)
    }, 50)
  }, [])

  const inner = (
    <Box
      renderRoot={renderBody}
      className={clsx("Pills-pillBody", pillClasses.body, classNames?.body)}
      onClick={onClickBody}
    >
      {children}
    </Box>
  )

  let withHover

  if (renderHoverCard && hoverEnabled) {
    withHover = renderHoverCard({
      children: inner,
    })
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

const defaultRenderBody = (props: AllHTMLAttributes<HTMLElement>) => (
  <button {...props} type="button" />
)

_PillsPillMemo.displayName = "Pills.Pill"

export const PillsPill = createPolymorphicComponent<"li", PillProps>(
  _PillsPillMemo,
)

export const Pills = Object.assign(_Pills, {
  Pill: PillsPill,
})
