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
  type MouseEvent,
  type NamedExoticComponent,
  type ReactNode,
} from "react"

import binClasses from "./bin.module.scss"
import pillClasses from "./pill.module.scss"

type PillComponentType = NamedExoticComponent<PillProps> & {
  Bin: typeof PillBin
}

export type PillBinProps = {
  children?: ReactNode
  title?: ReactNode
  menu?: boolean
  titleComponent?: string
} & BoxProps

const PillBin = memo((props: PillBinProps) => {
  const {
    className,
    children,
    title,
    menu,
    titleComponent = "h3",
    ...other
  } = useProps("PillBin", {}, props)

  return (
    <Box
      component="section"
      className={clsx("PillBin-root", binClasses.root, className)}
      {...other}
    >
      {title ? (
        <>
          <Title
            component={titleComponent}
            order={3}
            className={clsx("PillBin-title", binClasses.title)}
          >
            {title}
          </Title>
          <Divider className={clsx("PillBin-divider", binClasses.divider)} />
        </>
      ) : null}
      <Box
        component={menu ? "menu" : "ul"}
        className={clsx("PillBin-pills", binClasses.pills)}
      >
        {children}
      </Box>
    </Box>
  )
})

PillBin.displayName = "Pill.Bin"

export type PillProps = {
  classNames?: {
    root?: string
    button?: string
    body?: string
    indicator?: string
  }
  indicator?: ReactNode
  href?: string
  button?: boolean
  renderHoverCard?: (props: { children?: ReactNode }) => ReactNode
  children?: ReactNode
  onClick?: (e: MouseEvent) => void
} & BoxProps &
  ComponentPropsWithoutRef<"li">

const _Pill = memo((props: PillProps) => {
  const {
    className,
    classNames,
    indicator,
    href,
    button,
    renderHoverCard,
    children,
    onClick,
    ...other
  } = useProps("Pill", {}, props)

  const inner = button ? (
    <Box
      component="button"
      className={clsx(
        "Pill-body",
        "Pill-button",
        pillClasses.body,
        pillClasses.button,
        classNames?.body,
      )}
      onClick={onClick}
    >
      {children}
    </Box>
  ) : (
    <Box
      component="a"
      className={clsx("Pill-body", pillClasses.body, classNames?.body)}
      href={href}
      onClick={onClick}
    >
      {children}
    </Box>
  )

  const withHover = renderHoverCard
    ? renderHoverCard({ children: inner })
    : inner

  const wrapped = indicator ? (
    <Indicator
      label={indicator}
      className={clsx(
        "Pill-indicator",
        pillClasses.indicator,
        classNames?.indicator,
      )}
    >
      {withHover}
    </Indicator>
  ) : (
    withHover
  )

  return (
    <Box
      component="li"
      className={clsx(
        "Pill-root",
        pillClasses.root,
        classNames?.root,
        className,
      )}
      {...other}
    >
      {wrapped}
    </Box>
  )
}) as Partial<PillComponentType>

_Pill.displayName = "Pill"
_Pill.Bin = PillBin

export const Pill = _Pill as PillComponentType
