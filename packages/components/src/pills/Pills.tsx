import {
  Box,
  BoxProps,
  Divider,
  Indicator,
  Title,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import { MouseEvent, ReactNode } from "react"

export type PillsProps = BoxProps & { children?: ReactNode }

export const Pills = (props: PillsProps) => {
  const { className, children, ...other } = useProps("Pills", {}, props)

  return (
    <Box className={clsx("Pills-root", className)} {...other}>
      {children}
    </Box>
  )
}

export type PillBinProps = {
  children?: ReactNode
  title?: ReactNode
} & BoxProps

const PillBin = (props: PillBinProps) => {
  const { className, children, title, ...other } = useProps(
    "PillBin",
    {},
    props,
  )

  return (
    <Box className={clsx("PillBin-root", className)} {...other}>
      {title ? (
        <>
          <Title order={6} className="PillBin-title">
            {title}
          </Title>
          <Divider className="PillBin-divider" />
        </>
      ) : null}
      <Box className="PillBin-pills">{children}</Box>
    </Box>
  )
}

Pills.Bin = PillBin

export type PillProps = {
  indicator?: ReactNode
  href?: string
  button?: boolean
  children?: ReactNode
  renderContent?: (children: ReactNode) => ReactNode
  onClick?: (e: MouseEvent) => void
} & BoxProps

const Pill = (props: PillProps) => {
  const {
    className,
    indicator,
    href,
    button,
    children,
    renderContent = (c: ReactNode) => c,
    onClick,
    ...other
  } = useProps("Pill", {}, props)

  let inner: ReactNode = button ? (
    <Box component="button" className="Pill-body Pill-button" onClick={onClick}>
      {children}
    </Box>
  ) : (
    <Box component="a" className="Pill-body" href={href} onClick={onClick}>
      {children}
    </Box>
  )

  inner = renderContent(inner)

  const wrapped = indicator ? (
    <Indicator label={indicator} className="Pill-indicator">
      {inner}
    </Indicator>
  ) : (
    inner
  )

  return (
    <Box className={clsx("Pill-root", className)} {...other}>
      {wrapped}
    </Box>
  )
}

Pills.Pill = Pill
